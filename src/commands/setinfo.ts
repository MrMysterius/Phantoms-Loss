import * as Discord from "discord.js";

import { codeStatus, dbCodeGet, dbCodeSetInfos, userData } from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";

export async function setinfo(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(createLoadingEmbed(message, "Setting info..."));

  if (!args[0]) return await msg.edit(createFailedEmbed(message, "Missing code id"));
  if (!args[1]) return await msg.edit(createFailedEmbed(message, "Missing info to edit"));
  if (!args[2]) return await msg.edit(createFailedEmbed(message, "Missing option"));

  const code = await dbCodeGet(args[0]);

  if (!code) return await msg.edit(createFailedEmbed(message, "Code with that id doesn't exist"));
  if (code.requester != user.user_id) return await msg.edit(createFailedEmbed(message, "Not your code"));
  if (code.status != codeStatus.open) return await msg.edit(createFailedEmbed(message, "Code isn't open anymore"));

  let message_info = "Nothing Updated";

  switch (args[1].toLowerCase()) {
    case "uncommon":
      code.uncommon = parseInt(args[2], 10);
      message_info = `Set uncommon keys to ${code.uncommon}`;
      break;
    case "rare":
      code.rare = parseInt(args[2], 10);
      message_info = `Set rare keys to ${code.rare}`;
      break;
    case "epic":
      code.epic = parseInt(args[2], 10);
      message_info = `Set epic keys to ${code.epic}`;
      break;
    case "legendary":
      code.legendary = parseInt(args[2], 10);
      message_info = `Set legendary keys to ${code.legendary}`;
      break;
    case "guardian":
      switch (args[2].toLowerCase()) {
        case "mask":
          code.guardian = "MASK";
          message_info = `Set guardian to ${code.guardian}`;
          break;
        case "eye":
          code.guardian = "EYE";
          message_info = `Set guardian to ${code.guardian}`;
          break;
        case "devour":
          code.guardian = "DEVOUR";
          message_info = `Set guardian to ${code.guardian}`;
          break;
      }
      break;
  }

  if (message_info != "Nothing Updated") await dbCodeSetInfos(code.code_id, code.uncommon, code.rare, code.epic, code.legendary, code.guardian);
  await msg.edit(createSuccessEmbed(message, message_info).setDescription(code.code_id));
}
