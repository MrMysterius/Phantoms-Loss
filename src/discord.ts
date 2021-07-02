import * as Discord from "discord.js";

import { bot } from ".";

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

export async function help(message: Discord.Message, args: Array<String>) {}
