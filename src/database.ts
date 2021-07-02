import { db } from ".";
import internal from "stream";

export interface OAuth2Data {
  access_token: string;
  token_type: string;
  expires_is: number;
  refresh_token: string;
  scope: string;
}

export interface userObject {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface connectionsData {
  id: string;
  name: string;
  type: string;
  revoked?: boolean;
  integrations?: Array<{ [key: string]: any }>;
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  visibility: number;
}

export interface userData {
  user_id: string;
  username: string;
  steam_username: string;
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  level: number;
  xp: number;
}

export function dbAddOAuth2(oAuth2Data: OAuth2Data, userData: userObject, steamConnections: Array<connectionsData>) {
  let sql = `INSERT INTO users (user_id, username, steam_username, access_token, refresh_token, scope, token_type, level, xp) VALUES ('${userData.id}', '${
    userData.username
  }', '${steamConnections.reduce((p, c) => (p += c.name + " "), "")}', '${oAuth2Data.access_token}', '${oAuth2Data.refresh_token}', '${oAuth2Data.scope}', '${
    oAuth2Data.token_type
  }', 1, 0)`;
  try {
    db.prepare(sql).run();
  } catch (err) {
    console.log(sql);
    console.log(err);
  }
}

export async function dbGetUser(user_id: string): Promise<userData | undefined> {
  let sql = `SELECT * FROM users WHERE user_id = '${user_id}'`;

  try {
    return db.prepare(sql).all()[0];
  } catch (err) {
    console.log(sql);
    console.log(err);
  }
  return undefined;
}
