import * as Discord from "discord.js";

import { dbAddOAuth2, dbCodeGetByMessageID, dbCodeSetInfos, dbCodeSetMessageID, dbGetUser, userData } from "./database";
import { getSteamConnections, getUserInfo, refreshToken } from "./oauth2";

import { addCode } from "./commands/addcode";
import { codes } from "./commands/codes";
import { getCode } from "./commands/getcode";
import { giveUp } from "./commands/giveup";
import { help } from "./commands/help";
import { recovered } from "./commands/recovered";
import { register } from "./commands/register";
import { userInfo } from "./commands/userinfo";
import { verify } from "./commands/verify";

export async function onMessage(message: Discord.Message) {
  if (!message.content.startsWith(process.env.PREFIX || "#") || message.author.bot) return;
  const args = message.content.slice((process.env.PREFIX || "#").length).split(" ");
  const command = args.shift();

  const user = await dbGetUser(message.author.id);

  if (user) {
    updateConnections(user);
  }

  switch (command) {
    case "help":
      help(message, args);
      break;
    case "addcode":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      addCode(message, args, user);
      break;
    case "getcode":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      getCode(message, args, user);
      break;
    case "giveup":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      giveUp(message, args, user);
      break;
    case "register":
      if (!(await dmRestricted(message))) return;
      register(message);
      break;
    case "recovered":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      recovered(message, user);
      break;
    case "verify":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      verify(message, args, user);
      break;
    case "codes":
      if (!user) return await notRegistered(message);
      if (!(await dmRestricted(message))) return;
      codes(message, user);
      break;
    case "userinfo":
      userInfo(message, args);
      break;
  }
}

export async function onMessageReactionAdd(reaction: Discord.MessageReaction, partialUser: Discord.PartialUser) {
  const code = await dbCodeGetByMessageID(reaction.message.id);

  if (!code) return;

  switch (reaction.emoji.name) {
    case process.env.E_UNCOMMON:
      code.uncommon++;
      break;
    case process.env.E_RARE:
      code.rare++;
      break;
    case process.env.E_EPIC:
      code.epic++;
      break;
    case process.env.E_LEGENDARY:
      code.legendary++;
      break;
    case process.env.E_GUARDIAN_MASK:
      if (code.guardian) break;
      code.guardian = "MASK";
      break;
    case process.env.E_GUARDIAN_EYE:
      if (code.guardian) break;
      code.guardian = "EYE";
      break;
    case process.env.E_GUARDIAN_DEVOUR:
      if (code.guardian) break;
      code.guardian = "DEVOUR";
      break;
    case process.env.E_SUCCESS:
      await dbCodeSetMessageID(code.code_id, "-");
      break;
  }

  await dbCodeSetInfos(code.code_id, code.uncommon, code.rare, code.epic, code.legendary, code.guardian);
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

  embed.setColor(0x82ff94);

  return embed;
}

export function createFailedEmbed(message: Discord.Message, title: string) {
  const embed = createBasicEmbed(message);

  embed.setTitle(`${process.env.E_FAILED || "FAILED"} ${title}`);

  embed.setColor(0xff4949);

  return embed;
}

export async function dmRestricted(message: Discord.Message) {
  if (message.channel.type != "dm") {
    const dm = await message.author.createDM();
    const embed = createFailedEmbed(message, "Command restricted to DM's");
    dm.send(embed)
      .then((msg) => {
        if (msg.deletable) msg.delete({ timeout: 30000 });
      })
      .catch(() => {
        message.channel
          .send(embed)
          .then((msg) => {
            if (msg.deletable) msg.delete({ timeout: 10000 });
          })
          .catch(() => {});
      });
    return false;
  }
  return true;
}

export async function notRegistered(message: Discord.Message) {
  const dm = await message.author.createDM();
  const embed = createFailedEmbed(message, "You are not registered. Use the register command.");
  dm.send(embed)
    .then((msg) => {
      if (msg.deletable) msg.delete({ timeout: 30000 });
    })
    .catch(() => {
      message.channel
        .send(embed)
        .then((msg) => {
          if (msg.deletable) msg.delete({ timeout: 10000 });
        })
        .catch(() => {});
    });
}

export async function updateConnections(user: userData) {
  try {
    const userData = await getUserInfo(user.token_type, user.access_token);
    const connections = await getSteamConnections(user.token_type, user.access_token);

    await dbAddOAuth2(
      { access_token: user.access_token, expires_is: 0, refresh_token: user.refresh_token, scope: user.scope, token_type: user.token_type },
      userData,
      connections
    );
  } catch (err) {
    console.log(err);
    const refreshData = await refreshToken(user.user_id);

    if (!refreshData) return;

    const userData = await getUserInfo(refreshData.token_type, refreshData.access_token);
    const connections = await getSteamConnections(refreshData.token_type, refreshData.access_token);

    await dbAddOAuth2(refreshData, userData, connections);
  }
}
