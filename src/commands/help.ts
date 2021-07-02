import * as Discord from "discord.js";

import { createBasicEmbed } from "../discord";

export async function help(message: Discord.Message, args: Array<String>) {
  const embed = createBasicEmbed(message);

  embed.setTitle("Phantoms Loss - Help Page");
  embed.setURL("https://discord.com/oauth2/authorize?client_id=860281562972291082&scope=bot&permissions=330752");
  embed.setColor(0xffd089);

  embed.addField(
    "Commands",
    "help - help panel\naddcode - Adds a code\ngetcode - Get a code to help\nrecovered - Marks the current code as rescued (will be verified)\ngiveup - Skips the current code (also used if failed attemp)\ncodes - Lists your active codes"
  );

  //TODO Add Infos
  embed.addField("Infos", "Nothing here yet.");

  embed.addField(
    "Disclaimer and Dataprivacy Notice",
    "You need to setup an account for almost everything on this bot. This also stores data about your user account (this includes Discord), connections on your Discord account and sharecodes that you give the bot. As well as timestamps of certain actions. I also ban unfair or cheating players. For this premise I use a verification System that display your Steam Username to somebody random.\nIf you don't want to get false detected keep your steam connection on your Discord account up to date.\n\nThe bot also primarly is used in dm's so please keep them open to the Bot."
  );

  embed.addField(
    "Credits",
    "Thanks for some friends of mine testing stuff and also some people helping me with a bit of game knowledge this includes qwertaii#1184 - <@315879989612511234> and Moulberry#0001 - <@211288288055525376>."
  );

  const dm = await message.author.createDM();
  dm.send(embed)
    .then((msg) => {
      if (msg.deletable) msg.delete({ timeout: 120000 });
    })
    .catch(() => {
      message.channel
        .send(embed)
        .then((msg) => {
          if (msg.deletable) msg.delete({ timeout: 120000 });
        })
        .catch(() => {});
    });
}
