import * as Discord from "discord.js";

import { createFailedEmbed, createSuccessEmbed } from "../discord";
import { dbGetUsersCodes, userData } from "../database";

export async function codes(message: Discord.Message, user: userData) {
  const dm = await message.author.createDM();

  const codes = await dbGetUsersCodes(user.user_id);
  if (codes.length == 0) return await dm.send(createFailedEmbed(message, "Couldn't get any codes."));

  codes.forEach(async (code) => {
    const embed = createSuccessEmbed(message, "One of your codes:");
    embed.addField(`Code - ${code.code_id}`, "```" + code.code + "```");
    embed.addField("Attempts", code.attempts);
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

    await dm.send(embed).catch((err) => {
      console.log(err);
    });
  });
}
