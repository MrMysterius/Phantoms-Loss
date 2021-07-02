import { OAuth2Data, connectionsData, dbAddOAuth2, userObject } from "./database";

import { URLSearchParams } from "url";
import { default as fetch } from "node-fetch";

export async function newOAuth2(code: string) {
  const body = {
    client_id: process.env.CLIENT_ID || process.exit(11),
    client_secret: process.env.CLIENT_SECRET || process.exit(11),
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.OAUTH_REDIRECT_URI || process.exit(11),
  };

  const resOAuth2 = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  const oauth2Data: OAuth2Data = await resOAuth2.json();

  if (!oauth2Data.access_token) return;

  const meData = await getUserInfo(oauth2Data.token_type, oauth2Data.access_token);

  if (!meData.id) return;

  const filteredConnections = await getSteamConnections(oauth2Data.token_type, oauth2Data.access_token);

  dbAddOAuth2(oauth2Data, meData, filteredConnections);
}

export async function getUserInfo(token_type: string, access_token: string) {
  const resMe = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

  const meData: userObject = await resMe.json();

  return meData;
}

export async function getSteamConnections(token_type: string, access_token: string) {
  const resConnections = await fetch("https://discord.com/api/users/@me/connections", {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

  const connectionsData: Array<connectionsData> = await resConnections.json();

  const filteredConnections = connectionsData.filter((data) => data.type == "steam");

  return filteredConnections;
}
