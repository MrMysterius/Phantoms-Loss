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
  "CREATE TABLE IF NOT EXISTS users (user_id TEXT, username TEXT, steam_username TEXT, access_token TEXT, refresh_token TEXT, scope TEXT, token_type TEXT, level NUMERIC, xp NUMERIC, PRIMARY KEY (user_id))"
).run();
db.prepare(
  "CREATE TABLE IF NOT EXISTS codes (code_id INTEGER, code TEXT, created_by TEXT, resolved_by TEXT, resolved INTEGER, created_at TEXT, resolved_at TEXT, verified INTEGER, PRIMARY KEY (code_id AUTOINCREMENT), FOREIGN KEY (resolved_by) REFERENCES users(user_id), FOREIGN KEY (created_by) REFERENCES users(user_id))"
).run();

const bot = new Discord.Client();
const app = express();

app.use("/", expressMain);

bot.on("message", onMessage);

bot.login(process.env.DISCORD_TOKEN || process.exit(10));
app.listen(process.env.PORT || 3000);

process.on("beforeExit", () => {
  db.close();
});
