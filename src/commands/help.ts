import * as Discord from "discord.js";

import { createBasicEmbed } from "../discord";

export async function help(message: Discord.Message, args: Array<String>) {
  const embed = createBasicEmbed(message);

  embed.setTitle("Phantoms Loss - Help Page");
  embed.setURL("https://discord.com/oauth2/authorize?client_id=860281562972291082&scope=bot&permissions=330752");

  embed.setDescription("This bot is for sharing share codes from the game Phantom Abyss, it is made so over people can recover your lost goods.");

  embed.setColor(0xffd089);

  embed.addField(
    "Commands",
    "`help` - help panel\n`register` - register your account\n`addcode <code>` - Adds a code\n`getcode` - Get a code to help\n`recovered` - Marks the current code as rescued (will be verified)\n`giveup` - Skips the current code (also used if failed attemp)\n`report <invalid/already_cleared>` - reports the code as either not valid (spam? missuse?) or as already cleared (temple was cleared already)\n`codes` - Lists your active codes\n`userinfo <mention or userid>` - shows infos about a user\n`verify <code_id> <yes/no/wrong_name>` - For verifying a code\n`setinfo <code_id> <uncommon/rare/epic/legendary/guardian> <number for keys/devour, mask or eye for guardian>` - Adds more info to a code"
  );

  //TODO Add Infos
  embed.addField("Infos", "< > - means required argument\n[ ] - means optional argument");

  embed.addField(
    "Leveling",
    `Everybody starts at Level 1 with 0 XP. You get for a verified recovery ${process.env.LVL_REWARD_XP} XP. You need for a levelup \`${process.env.LVL_BASE_XP} * CURRENT_LEVEL * ${process.env.LVL_XP_SCALE}\`. Every ${process.env.LVL_SLOT_PER} Levels you get an extra slot of concurrent codes you can get help on.`
  );

  embed.addField(
    "Disclaimer and Dataprivacy Notice",
    "You **need** to setup an account for almost everything on this bot. This also stores data about your user account (this includes Discord), connections on your Discord account and sharecodes that you give the bot. As well as timestamps of certain actions. I also ban unfair or cheating players. For this premise I use a verification System that display your Steam Username to somebody random.\nIf you **don't want to get false detected** keep your **steam connection** on your Discord account **up to date**.\n\nThe bot also **primarly is used in dm's** so please **keep them open** to the Bot."
  );

  embed.addField(
    "Credits",
    "Thanks for some friends of mine testing stuff and also some people helping me with a bit of game knowledge this includes **qwertaii#1184** - <@315879989612511234> and **Moulberry#0001** - <@211288288055525376>."
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
