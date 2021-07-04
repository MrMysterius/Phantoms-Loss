import { db } from ".";

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
  strikes: number;
  status: userStatus;
}

export enum userStatus {
  active = "ACTIVE",
  banned = "BANNED",
}

export interface codeData {
  code_id: string;
  code: string;
  message_id: string;
  requester: string;
  assignee: string;
  added_at: string;
  resolved_at: string;
  status: codeStatus;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
  guardian: string;
  attempts: number;
  strikes: number;
  already_cleared: number;
}

export enum codeStatus {
  open = "OPEN",
  assigned = "ASSIGNED",
  verification_pending = "PENDING",
  verified = "VERIFIED",
  verified_wrongname = "VERIFIED-WRONGNAME",
}

export async function dbAddOAuth2(oAuth2Data: OAuth2Data, userData: userObject, steamConnections: Array<connectionsData>) {
  let sql = `INSERT INTO users (user_id, username, steam_username, access_token, refresh_token, scope, token_type, level, xp, strikes, status) VALUES ('${
    userData.id
  }', '${userData.username}', '${steamConnections.reduce((p, c) => (p += c.name + " "), "")}', '${oAuth2Data.access_token}', '${oAuth2Data.refresh_token}', '${
    oAuth2Data.scope
  }', '${oAuth2Data.token_type}', 1, 0, 0, '${userStatus.active}')`;
  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    //console.log(sql);
    //console.log(err);
  }

  console.log("Trying Update...");
  const user = await dbGetUser(userData.id);
  if (!user) return;

  sql = `UPDATE users SET username = '${userData.username}', steam_username = '${steamConnections.reduce(
    (p, c) => (p += c.name + " "),
    ""
  )}', access_token = '${oAuth2Data.access_token}', refresh_token = '${oAuth2Data.refresh_token}', scope = '${oAuth2Data.scope}', token_type = '${
    oAuth2Data.token_type
  }' WHERE user_id = '${userData.id}'`;

  try {
    db.prepare(sql).run();
    console.log("updated");
    return;
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

export async function dbUserSetStrikes(user_id: string, newStrikes: number, status: userStatus) {
  let sql = `UPDATE users SET strikes = ${newStrikes}, status = '${status}' WHERE user_id = '${user_id}'`;

  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbUpdateTokens(user_id: string, access_token: string, refresh_token: string) {
  let sql = `UPDATE users SET access_token = '${access_token}', refresh_token = '${refresh_token}' WHERE user_id = '${user_id}'`;

  try {
    db.prepare(sql).run();
    return true;
  } catch (err) {
    console.log(sql);
    console.log(err);
  }
  return false;
}

export async function dbAddCode(user_id: string, code: string) {
  let sql = `INSERT INTO codes (code, requester, added_at, status, uncommon, rare, epic, legendary, attempts, strikes) VALUES ('${code}', '${user_id}', '${new Date()}', 'OPEN', 0, 0, 0, 0, 0, 0)`;

  try {
    return await db.prepare(sql).run().lastInsertRowid;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return undefined;
  }
}

export async function dbCodeSetMessageID(code_id: string, message_id: string) {
  let sql = `UPDATE codes SET message_id = '${message_id}' WHERE code_id = ${code_id}`;

  try {
    return db.prepare(sql).run();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbGetUsersCodes(user_id: string): Promise<Array<codeData>> {
  if (!user_id) return [];
  let sql = `SELECT * FROM codes WHERE requester = '${user_id}' and (status = 'OPEN' or status = 'ASSIGNED' or status = 'PENDING')`;

  try {
    return db.prepare(sql).all();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return [];
  }
}

export async function dbCodesGetOpen(user_id: string): Promise<Array<codeData>> {
  let sql = `SELECT * FROM codes WHERE status = 'OPEN' and requester != '${user_id}'`;

  try {
    return db.prepare(sql).all();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return [];
  }
}

export async function dbCodeAssignsGet(user_id: string, status: codeStatus): Promise<Array<codeData>> {
  let sql = `SELECT * FROM codes WHERE assignee = '${user_id}' and status = '${status}'`;

  try {
    return db.prepare(sql).all();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return [];
  }
}

export async function dbCodeAssign(user_id: string, code_id: string): Promise<number> {
  let sql = `UPDATE codes SET assignee = '${user_id}', status = 'ASSIGNED' WHERE code_id = '${code_id}'`;

  try {
    return db.prepare(sql).run().lastInsertRowid as number;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return await dbCodeAssign(user_id, code_id);
  }
}

export async function dbCodeUnassign(code_id: string, newAttempts: number) {
  let sql = `UPDATE codes SET status = 'OPEN', attempts = ${newAttempts} WHERE code_id = '${code_id}'`;

  try {
    return db.prepare(sql).run().lastInsertRowid as number;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbCodesOfRequester(user_id: string): Promise<Array<codeData>> {
  let sql = `SELECT * FROM codes WHERE requester = '${user_id}'`;

  try {
    return db.prepare(sql).all();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return [];
  }
}

export async function dbCodeRecovered(code_id: string) {
  let sql = `UPDATE codes SET status = '${codeStatus.verification_pending}', resolved_at = '${new Date()}' WHERE code_id = '${code_id}'`;

  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbCodeChangeStatus(code_id: string, status: codeStatus) {
  let sql = `UPDATE codes SET status = '${status}' WHERE code_id = '${code_id}'`;

  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbUserUpdateLevelAndXP(user_id: string, level: number, xp: number) {
  let sql = `UPDATE users SET level = ${level}, xp = ${xp} WHERE user_id = '${user_id}'`;

  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}

export async function dbCodeGet(code_id: string): Promise<codeData | undefined> {
  let sql = `SELECT * FROM codes WHERE code_id = ${code_id}`;

  try {
    return db.prepare(sql).get();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return undefined;
  }
}

export async function dbCodeGetByMessageID(message_id: string): Promise<codeData | undefined> {
  let sql = `SELECT * FROM codes WHERE message_id = '${message_id}'`;

  try {
    return db.prepare(sql).get();
  } catch (err) {
    console.log(sql);
    console.log(err);
    return undefined;
  }
}

export async function dbCodeSetInfos(code_id: string, uncommons: number, rares: number, epics: number, legendarys: number, guardian: string) {
  let sql = `UPDATE codes SET uncommon = ${uncommons}, rare = ${rares}, epic = ${epics}, legendary = ${legendarys}, guardian = '${guardian}' WHERE code_id = ${code_id}`;

  try {
    db.prepare(sql).run();
    return;
  } catch (err) {
    console.log(sql);
    console.log(err);
    return;
  }
}
