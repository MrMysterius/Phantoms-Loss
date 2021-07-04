import * as Discord from "discord.js";
import * as dotenv from "dotenv";
import * as path from "path";

import { default as bsql } from "better-sqlite3";
import { default as express } from "express";
import { expressMain } from "./express";
import { onMessage } from "./discord";

dotenv.config();

export const db = new bsql(path.join(__dirname, "phantom_loss.db"));

db.prepare(
  "CREATE TABLE IF NOT EXISTS users (user_id TEXT, username TEXT, steam_username TEXT, access_token TEXT, refresh_token TEXT, scope TEXT, token_type TEXT, level NUMERIC, xp NUMERIC, strikes INTEGER, status INTEGER, PRIMARY KEY (user_id))"
).run();
db.prepare(
  "CREATE TABLE IF NOT EXISTS codes (code_id INTEGER, code TEXT, message_id, requester TEXT, assignee TEXT, added_at TEXT, resolved_at TEXT, status TEXT, uncommon INTEGER, rare INTEGER, epic INTEGER, legendary INTEGER, guardian TEXT, attempts INTEGER, strikes INTEGER, already_cleared INTEGER, PRIMARY KEY (code_id AUTOINCREMENT), FOREIGN KEY (requester) REFERENCES users(user_id), FOREIGN KEY (assignee) REFERENCES users(user_id))"
).run();

export const bot = new Discord.Client();
const app = express();

app.use("/", expressMain);

bot.on("ready", () => {
  console.log("Discord Bot Ready!", "Connected to", bot.guilds.cache.array().length, "guild.");

  setInterval(() => {
    bot.user?.setPresence({
      status: "online",
      activity: {
        name: `${process.env.PREFIX || "#"}help | ${bot.guilds.cache.array().length} Guilds`,
        url: "https://discord.com/oauth2/authorize?client_id=860281562972291082&scope=bot&permissions=330752",
        type: "WATCHING",
      },
    });
  }, 60000);
});

bot.on("message", onMessage);

bot.login(process.env.DISCORD_TOKEN || process.exit(10));
app.listen(process.env.PORT || 3000, () => {
  console.log("Express Ready!");
});

process.on("beforeExit", () => {
  db.close();
});
