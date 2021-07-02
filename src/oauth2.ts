import { OAuth2Data } from "./database";
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

  const res = await fetch("https://discord.com/api/v9/oauth2/token", {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  console.log(res);
}
