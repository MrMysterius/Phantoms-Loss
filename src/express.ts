import { Router } from "express";

const expressMain = Router();
expressMain.get("/", (req, res) => {
  if (!req.query.code) return res.setHeader("Location", (process.env.REDIRECT_URI as string) || req.baseUrl + "/nocode").sendStatus(301);
  res.setHeader("Location", (process.env.REDIRECT_URI as string) || req.baseUrl + "/done").sendStatus(301);
});

expressMain.get("/done", (req, res) => {
  res.status(200).send("Authorized!");
});

expressMain.get("/nocode", (req, res) => {
  res.status(400).send("No code :(");
});

export { expressMain };
