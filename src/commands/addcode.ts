import * as Discord from "discord.js";

import { createFailedEmbed } from "../discord";

import { userData } from "../database";

export async function addCode(message: Discord.Message, args: Array<string>, user: userData) {
  if (!args[0] || args[0].length != 172) {
    const dm = await message.author.createDM();
    const embed = createFailedEmbed(message, "Code Missing");
    dm.send(embed)
      .then((msg) => {
        if (msg.deletable) msg.delete({ timeout: 120000 });
      })
      .catch();
    return;
  }
}
