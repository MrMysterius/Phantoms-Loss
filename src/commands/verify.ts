import * as Discord from "discord.js";

import {
  codeStatus,
  dbCodeChangeStatus,
  dbCodeGet,
  dbCodeUnassign,
  dbGetUser,
  dbUserSetStrikes,
  dbUserUpdateLevelAndXP,
  userData,
  userStatus,
} from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";

export async function verify(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(createLoadingEmbed(message, "Verifying..."));

  if (!args[0]) return await msg.edit(createFailedEmbed(message, "No code id provided"));
  if (!args[1] || (args[1].toLowerCase() != "yes" && args[1].toLowerCase() != "no" && args[1].toLowerCase() != "wrong_name"))
    return await msg.edit(createFailedEmbed(message, "Neither yes or no supplied"));

  const code = await dbCodeGet(args[0]);

  if (!code) return await msg.edit(createFailedEmbed(message, "Provied code id doesn't exist"));

  if (code.requester != user.user_id) return await msg.edit(createFailedEmbed(message, "Provided code id is not yours"));

  if (code.status != codeStatus.verification_pending) return await msg.edit(createFailedEmbed(message, "Provided code is not pending for verification"));

  const assignee = await dbGetUser(code.assignee);

  if (!assignee) {
    await dbCodeUnassign(code.code_id, ++code.attempts);
    await msg.edit(createFailedEmbed(message, "Couldn't get the original assignee. Reopening code."));
    return;
  }

  switch (args[1].toLowerCase()) {
    case "yes":
      assignee.xp += Math.floor(parseInt(process.env.LVL_REWARD_XP as string, 10));
      if (assignee.xp >= parseInt(process.env.LVL_BASE_XP as string, 10) * parseInt(process.env.LVL_XP_SCALE as string, 10) * assignee.level) {
        assignee.xp -= parseInt(process.env.LVL_BASE_XP as string, 10) * parseInt(process.env.LVL_XP_SCALE as string, 10) * assignee.level;
        assignee.level++;
      }
      await dbUserUpdateLevelAndXP(assignee.user_id, assignee.level, assignee.xp);
      await dbCodeChangeStatus(code.code_id, codeStatus.verified);
      await msg.edit(createSuccessEmbed(message, "Thank you for the verification. User has been credited."));
      return;
    case "no":
      assignee.strikes++;
      if (assignee.strikes >= parseInt(process.env.USER_STRIKES as string, 10)) assignee.status = userStatus.banned;
      await dbUserSetStrikes(assignee.user_id, assignee.strikes, assignee.status);
      await dbCodeUnassign(code.code_id, ++code.attempts);
      await msg.edit(createSuccessEmbed(message, "Thank you for the verification. User has been striked and the code opened again."));
      return;
    case "wrong_name":
      assignee.strikes++;
      if (assignee.strikes >= parseInt(process.env.USER_STRIKES as string, 10)) assignee.status = userStatus.banned;
      await dbUserSetStrikes(assignee.user_id, assignee.strikes, assignee.status);
      await dbCodeChangeStatus(code.code_id, codeStatus.verified_wrongname);
      await msg.edit(createSuccessEmbed(message, "Thank you for the verification. User has been striked and the code is closed."));
      return;
  }
}
