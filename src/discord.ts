import * as Discord from "discord.js";

export async function onMessage(message: Discord.Message) {
  if (!message.content.startsWith(process.env.PREFIX || "#") || message.author.bot) return;
  const args = message.content.slice(0, (process.env.PREFIX || "#").length).split(" ");
  const command = args.shift();

}
