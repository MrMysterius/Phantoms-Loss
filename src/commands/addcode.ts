import * as Discord from "discord.js";

import { createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";
import { dbAddCode, dbCodeSetMessageID, dbGetUsersCodes, userData } from "../database";

import { bot } from "..";

export async function addCode(message: Discord.Message, args: Array<string>, user: userData) {
  if (!args[0] || args[0].length < 50) {
    const dm = await message.author.createDM();
    const embed = createFailedEmbed(message, "Code Missing");
    dm.send(embed)
      .then((msg) => {
        if (msg.deletable) msg.delete({ timeout: 120000 });
      })
      .catch();
    return;
  }

  const dm = await message.author.createDM();
  dm.send(await createLoadingEmbed(message, " Adding Code"))
    .then(async (msg) => {
      const codes = await dbGetUsersCodes(user.user_id);

      if (codes.length >= Math.floor(user.level / parseInt(process.env.LVL_SLOT_PER as string, 10)) + 1) {
        await msg.edit(
          createFailedEmbed(message, "Too many codes added already").setDescription(
            `Your limit ${Math.floor(user.level / parseInt(process.env.LVL_SLOT_PER as string, 10)) + 1}`
          )
        );
        if (msg.deletable) msg.delete({ timeout: 120000 });
        return;
      }

      const code_id = await dbAddCode(message.author.id, args[0]);
      if (!code_id) {
        msg.edit(createFailedEmbed(message, "Something Went Wrong"));
      }
      msg.edit(createSuccessEmbed(message, "Added Code. Code ID: " + code_id).setDescription("Use the `setinfo` command to add additional infos to your code"));
      if (msg.deletable) msg.delete({ timeout: 120000 });
    })
    .catch();
}
