import * as Discord from "discord.js";

import { codeStatus, dbCodeAssignsGet, dbCodeRecovered, dbUserUpdateLevelAndXP, userData } from "../database";
import { createBasicEmbed, createFailedEmbed, createLoadingEmbed, createSuccessEmbed } from "../discord";

import { bot } from "..";

export async function recovered(message: Discord.Message, user: userData) {
  const dm = await message.author.createDM();
  const msg = await dm.send(createLoadingEmbed(message, "Marking Code as recovered..."));

  const assignedCodes = await dbCodeAssignsGet(user.user_id, codeStatus.assigned);

  if (assignedCodes.length == 0) {
    await msg.edit(createFailedEmbed(message, "Your not aiding anybody.").setDescription("Use `getcode` to start helping."));
    return;
  }

  const code = assignedCodes[0];

  await dbCodeRecovered(code.code_id);

  const requester = await bot.users.fetch(code.requester);
  const requester_dm = await requester.createDM();

  const verify_embed = await createBasicEmbed(msg);

  verify_embed.setTitle("One of your codes got recovered. Please Verify!");
  verify_embed.setDescription(
    `Please paste the code ingame for the verification. Then check if the person who completed it is listed below. If so then use the command \`verify ${code.code_id} yes\`, if the username doesn't match use \`verify ${code.code_id} wrong_name\` and if you didn't get help at all type \`verify ${code.code_id} no\`.`
  );

  verify_embed.addField("Username", user.steam_username);
  verify_embed.addField("Code", `\`${code.code}\``);
  verify_embed.addField("Code ID", code.code_id);

  if (!(await requester_dm.send(verify_embed).catch())) {
    msg.edit(createFailedEmbed(message, "Requester not reachable :(").setDescription("Adding some xp for you troulbes"));
    user.xp += Math.floor(parseInt(process.env.LVL_REWARD_XP as string, 10) / 4);
    if (user.xp >= parseInt(process.env.LVL_BASE_XP as string, 10) * parseInt(process.env.LVL_XP_SCALE as string, 10) * user.level) {
      user.level++;
      user.xp -= parseInt(process.env.LVL_BASE_XP as string, 10) * parseInt(process.env.LVL_XP_SCALE as string, 10) * user.level;
    }
    await dbUserUpdateLevelAndXP(user.user_id, user.level, user.xp);
    return;
  }

  await msg.edit(createSuccessEmbed(message, "Code marked as recovered. Verification pending."));
  return;
}
