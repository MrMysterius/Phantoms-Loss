import * as Discord from "discord.js";
import * as dotenv from "dotenv";

import { default as express } from "express";

dotenv.config();

const bot = new Discord.Client();
const app = express();

app.get("/", (req, res) => {});

bot.login(process.env.DISCORD_TOKEN || process.exit(10));
app.listen(process.env.PORT || 3000);
