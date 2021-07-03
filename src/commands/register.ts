import * as Discord from "discord.js";

import { createBasicEmbed } from "../discord";

export async function register(message: Discord.Message) {
  const dm = await message.author.createDM();
  const embed = await createBasicEmbed(message);

  embed.setTitle("Click Me to register!");
  embed.setURL((process.env.OAUTH_LINK as string) || "");

  embed.addField(
    "Disclaimer and Dataprivacy Notice",
    "You **need** to setup an account for almost everything on this bot. This also stores data about your user account (this includes Discord), connections on your Discord account and sharecodes that you give the bot. As well as timestamps of certain actions. I also ban unfair or cheating players. For this premise I use a verification System that display your Steam Username to somebody random.\nIf you **don't want to get false detected** keep your **steam connection** on your Discord account **up to date**.\n\nThe bot also **primarly is used in dm's** so please **keep them open** to the Bot."
  );

  await dm.send(embed).catch();
}
