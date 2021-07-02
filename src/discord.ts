import * as Discord from "discord.js";

export async function onMessage(message: Discord.Message) {
  if (!message.content.startsWith(process.env.PREFIX || "#") || message.author.bot) return;
  const args = message.content.slice(0, (process.env.PREFIX || "#").length).split(" ");
  const command = args.shift();

  switch (command) {
    case "help":
      help(message, args);
      break;
  }
}

export async function help(message: Discord.Message, args: Array<String>) {}
