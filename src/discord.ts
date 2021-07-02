import * as Discord from "discord.js";

import { bot } from ".";
import { help } from "./commands/help";

export async function onMessage(message: Discord.Message) {
  if (!message.content.startsWith(process.env.PREFIX || "#") || message.author.bot) return;
  const args = message.content.slice((process.env.PREFIX || "#").length).split(" ");
  const command = args.shift();

  switch (command) {
    case "help":
      help(message, args);
      break;
  }
}

export function createBasicEmbed(message: Discord.Message) {
  const embed = new Discord.MessageEmbed();

  embed.setAuthor(
    message.author.username,
    message.author.avatarURL() as string,
    "https://discord.com/oauth2/authorize?client_id=860281562972291082&scope=bot&permissions=330752"
  );

  embed.setColor(0x89c8ff);

  embed.setTimestamp(new Date());

  return embed;
}

export function createLoadingEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`<a:processing:835931849363554345> ${title}`);

  return embed;
}

export function createSuccessEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`<a:TickGreen:834559457266106388> ${title}`);

  return embed;
}

export function createFailedEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`<a:TickRed605591595441455109:834559457069498368> ${title}`);

  return embed;
}
