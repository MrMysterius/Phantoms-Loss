import * as Discord from "discord.js";

import { addCode } from "./commands/addcode";
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
    case "addcode":
      addCode(message, args);
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

  embed.setTitle(`${process.env.E_PROCESSING || "PROCESSING"} ${title}`);

  return embed;
}

export function createSuccessEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`${process.env.E_SUCCESS || "SUCCESS"} ${title}`);

  return embed;
}

export function createFailedEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`${process.env.E_SUCCESS || "FAILED"} ${title}`);

  return embed;
}
