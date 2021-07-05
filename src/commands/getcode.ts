import * as Discord from "discord.js";

import { codeData, codeStatus, dbCodeAssign, dbCodeAssignsGet, dbCodesGetOpen, userData } from "../database";
import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed, dmRestricted } from "../discord";

export async function getCode(message: Discord.Message, args: Array<string>, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(await createLoadingEmbed(message, "Getting Code")).catch();
  if (!msg) return;

  const assignedCodes = await dbCodeAssignsGet(message.author.id, codeStatus.assigned);

  if (assignedCodes.length > 0) {
    const embed = await createSuccessEmbed(message, "Your current code:");
    embed.addField(`Code - ${assignedCodes[0].code_id}`, "```" + assignedCodes[0].code + "```");
    embed.addField("Attempts", assignedCodes[0].attempts);
    switch (code.code.length) {
      case 236:
        embed.addField("Run died in", "**Ruins**");
        break;
      case 256:
        embed.addField("Run died in", "**Caverns**");
        break;
      case 280:
        embed.addField("Run died in", "**Inferno**");
        break;
    }
    let guardian = "-";
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
    embed.addField(
      "Keys",
      `${process.env.E_UNCOMMON}: ${assignedCodes[0].uncommon}\n${process.env.E_RARE}: ${assignedCodes[0].rare}\n${process.env.E_EPIC}: ${assignedCodes[0].epic}\n${process.env.E_LEGENDARY}: ${assignedCodes[0].legendary}`
    );
    await msg.edit(embed);
    return;
  }

  const openCodes = await dbCodesGetOpen(user.user_id);

  if (openCodes.length == 0) return await msg.edit(createFailedEmbed(message, "No codes available :/"));

  const averageAttempts = openCodes.reduce((p, c) => (p += c.attempts), 0) / openCodes.length;

  let code: codeData;
  code = { ...openCodes[0] };
  code.attempts = -1;

  while (code.attempts < averageAttempts) {
    code = openCodes[Math.floor(Math.random() * openCodes.length)];
  }

  await dbCodeAssign(user.user_id, code.code_id);

  const embed = await createSuccessEmbed(message, "Your current code:");
  embed.addField(`Code - ${code.code_id}`, "```" + code.code + "```");
  embed.addField("Attempts", code.attempts);
  switch (code.code.length) {
    case 236:
      embed.addField("Run died in", "**Ruins**");
      break;
    case 256:
      embed.addField("Run died in", "**Caverns**");
      break;
    case 280:
      embed.addField("Run died in", "**Inferno**");
      break;
  }
  let guardian = "-";
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
  embed.addField(
    "Keys",
    `${process.env.E_UNCOMMON}: ${code.uncommon}\n${process.env.E_RARE}: ${code.rare}\n${process.env.E_EPIC}: ${code.epic}\n${process.env.E_LEGENDARY}: ${code.legendary}`
  );
  await msg.edit(embed);
}
