import * as Discord from "discord.js";
import * as dotenv from "dotenv";

import { default as bsql } from "better-sqlite3";
import { default as express } from "express";
import { expressMain } from "./express";

dotenv.config();

export const db = new bsql("phantom_loss.db");
const bot = new Discord.Client();
const app = express();

app.use("/", expressMain);

bot.login(process.env.DISCORD_TOKEN || process.exit(10));
app.listen(process.env.PORT || 3000);

process.on("beforeExit", () => {
  db.close();
});
