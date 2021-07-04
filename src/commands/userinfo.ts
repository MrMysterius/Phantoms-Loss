import * as Discord from "discord.js";

import { createFailedEmbed, createSuccessEmbed } from "../discord";
import { dbGetUser, userData } from "../database";

export async function userInfo(message: Discord.Message, args: Array<string>) {
  if (!args[0]) return message.channel.send(createFailedEmbed(message, "Missing Arguments")).catch(() => {});

  const user_id = args[0].match(/^\d+$/g)?.[0] || args[0].match(/(?<=^\<\@|\!)\d+(?=\>$)/g)?.[0] || undefined;

  if (!user_id) return message.channel.send(createFailedEmbed(message, "Argument isn't a user")).catch(() => {});

  const user = await dbGetUser(user_id);

  if (!user) return message.channel.send(createFailedEmbed(message, "This user is not in my database")).catch(() => {});

  const embed = createSuccessEmbed(message, `User Info - ${user.username}`);

  embed.addField("Level", `Level: ${user.level}\nXP: ${user.xp}`);
  embed.addField("Status", user.status);
  if (message.author.id == user_id) embed.addField("Strikes", user.strikes);

  message.channel.send(embed).catch(() => {});
}
