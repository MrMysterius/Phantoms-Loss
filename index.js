require("dotenv").config();

const Discord = require("discord.js");
const express = require("express");

const bot = new Discord.Client();
const app = new express();

app.get("/", (req, res) => {});

bot.login(process.env.DISCORD_TOKEN || process.exit(10));
app.listen(process.env.PORT || 3000);
