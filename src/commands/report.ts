import * as Discord from "discord.js";

import { codeStatus, dbCodeAssignsGet, dbCodeSetReports, dbGetUser, dbUserSetStrikes, userData, userStatus } from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";

export async function report(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(createLoadingEmbed(message, "Reporting..."));

  if (!args[0]) return await msg.edit(createFailedEmbed(message, "Missing report reason"));

  const assignedCodes = await dbCodeAssignsGet(user.user_id, codeStatus.assigned);

  if (assignedCodes.length == 0) return await msg.edit(createFailedEmbed(message, "There is no code to report"));

  const code = assignedCodes[0];

  switch (args[0].toLowerCase()) {
    case "already_cleared":
      code.already_cleared++;
      if (code.already_cleared >= parseInt(process.env.CODE_ALREADY_CLEARED as string, 10)) code.status = codeStatus.verified;
      await dbCodeSetReports(code.code_id, code.strikes, code.already_cleared, code.status);
      await msg.edit(createSuccessEmbed(message, "Code Reported for already cleared"));
      return;
    case "invalid":
      code.strikes++;
      if (code.strikes >= parseInt(process.env.CODE_STRIKES as string, 10)) {
        code.status = codeStatus.verified;
        const requester = await dbGetUser(code.requester);
        if (requester) {
          requester.strikes++;
          if (requester.strikes >= parseInt(process.env.USER_STRIKES as string, 10)) requester.status = userStatus.banned;
          await dbUserSetStrikes(requester.user_id, requester.strikes, requester.status);
        }
      }
      await dbCodeSetReports(code.code_id, code.strikes, code.already_cleared, code.status);
      await msg.edit(createSuccessEmbed(message, "Code Reported for invalidity"));
      return;
    default:
      await msg.edit(createFailedEmbed(message, "Report reason not provided"));
      return;
  }
}
