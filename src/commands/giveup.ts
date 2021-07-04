import * as Discord from "discord.js";

import { codeStatus, dbCodeAssignsGet, dbCodeUnassign, userData } from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";

export async function giveUp(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(await createLoadingEmbed(message, "Giving Up...")).catch();
  if (!msg) return;

  const assignedCodes = await dbCodeAssignsGet(message.author.id, codeStatus.assigned);

  if (assignedCodes.length == 0) {
    await msg.edit(await createFailedEmbed(message, "No code assgined at the moment"));
    return;
  }

  const code = assignedCodes[0];
  await dbCodeUnassign(code.code_id, code.attempts + 1);
  await msg.edit(await createSuccessEmbed(message, "Gave Up Code"));
  return;
}
