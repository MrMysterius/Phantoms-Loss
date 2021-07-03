import * as Discord from "discord.js";

import { codeStatus, dbCodeAssign, dbCodeAssignsGet, dbCodesGetOpen, userData } from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed, dmRestricted } from "../discord";

export async function getCode(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(await createLoadingEmbed(message, "Getting Code")).catch();
  if (!msg) return;

  const assignedCodes = await dbCodeAssignsGet(message.author.id, codeStatus.assigned);

  if (assignedCodes.length > 0) {
    const embed = await createSuccessEmbed(message, "Your current code:");
    embed.addField(`Code - ${assignedCodes[0].code}`, "```" + assignedCodes[0].code + "```");
    embed.addField("Attempts", assignedCodes[0].attempts);
    embed.addField(
      "Keys",
      `${process.env.E_UNCOMMON}: ${assignedCodes[0].uncommon}\n${process.env.E_RARE}: ${assignedCodes[0].rare}\n${process.env.E_EPIC}: ${assignedCodes[0].epic}\n${process.env.E_LEGENDARY}: ${assignedCodes[0].legendary}`
    );
    let guardian = "";
    switch (assignedCodes[0].guardian) {
      case "MASK":
        guardian = process.env.E_GUARDIAN_MASK as string;
        break;
      case "EYE":
        guardian = process.env.E_GUARDIAN_EYE as string;
        break;
      case "DEVOUR":
        guardian = process.env.E_GUARDIAN_DEVOUR as string;
        break;
    }
    embed.addField("Guardian", guardian);
    await msg.edit(embed);
    return;
  }

  const openCodes = await dbCodesGetOpen(user.user_id);

  const code = openCodes[Math.floor(Math.random() * openCodes.length)];

  await dbCodeAssign(user.user_id, code.code_id);

  const embed = await createSuccessEmbed(message, "Your current code:");
  embed.addField(`Code - ${code.code}`, "```" + code.code + "```");
  embed.addField("Attempts", code.attempts);
  embed.addField(
    "Keys",
    `${process.env.E_UNCOMMON}: ${code.uncommon}\n${process.env.E_RARE}: ${code.rare}\n${process.env.E_EPIC}: ${code.epic}\n${process.env.E_LEGENDARY}: ${code.legendary}`
  );
  let guardian = "";
  switch (code.guardian) {
    case "MASK":
      guardian = process.env.E_GUARDIAN_MASK as string;
      break;
    case "EYE":
      guardian = process.env.E_GUARDIAN_EYE as string;
      break;
    case "DEVOUR":
      guardian = process.env.E_GUARDIAN_DEVOUR as string;
      break;
  }
  embed.addField("Guardian", guardian);
  await msg.edit(embed);
}
