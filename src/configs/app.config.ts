import fs from "fs";
import path from "path";
import { IPGCredentials } from "../db/db";
const configPath = path.resolve(__dirname + "/../../appconfig.json");
export const appConf: any = JSON.parse(fs.readFileSync(configPath, "utf-8"));

export function getPort() {
  return Number(appConf.port) || 8090;
}

export function getDB(): IPGCredentials {
  return appConf.database;
}

export function getFileUploadPath() {
  return appConf.fileUploadPath;
}

//moment js timezone and time format
export const defaultTimezone = "Asia/Dhaka";
export const defaultDateFormat = "YYYY/MM/DD";
