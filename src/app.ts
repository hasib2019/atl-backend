import { json, urlencoded } from "body-parser";
import cors from "cors";
import express, { Application } from "express";
import fs from "fs";
import * as http from "http";
import moment from "moment-timezone";
import * as path from "path";
import "reflect-metadata";
import { defaultDateFormat, defaultTimezone, getDB } from "./configs/app.config";
import { errorHandler } from "./middlewares/error-handler.middle";
import { requestBodyHTMLEscape } from "./utils/html-escape.utils";
import PGConnection from "./db/connection";

// importing modules
import * as movieRouter from "./modules/movie";

export default async function appFactory(): Promise<Application> {
  // express app init
  const app: Application = express();

  // enabling cors
  app.use(cors());

  //fixed timezone
  moment().tz(defaultTimezone).format(defaultDateFormat);

  // body parser config
  const jsonParser: any = json({
    inflate: true,
    limit: "10mb",
    type: "application/json",
    verify: (req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string) => {
      // place for sniffing raw request
      return true;
    },
  });
  await PGConnection.connect(getDB());
  // using json parser and urlencoder
  app.use(jsonParser);
  app.use(urlencoded({ extended: true }));

  // enabling loggin of HTTP request using morgan
  // create a write stream (in append mode)
  const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

  //to prevent scripting
  app.use(requestBodyHTMLEscape);

  // for handling uncaught exception from application
  process.on("uncaughtException", (err) => {
    console.error("[ERROR] Uncaught Exception : ", err.message);
    // throw new Error(`[ERROR] Uncaught Exception : ${err.message}`);
  });

  process.on("unhandledRejection", (error: any) => {
    //@ts-ignore
    console.error("[ERROR] From event: ", error?.toString());
    // throw new Error(`[ERROR] From event: ${error?.toString()}`);
  });

  /**
   * Register Modules
   */
  movieRouter.init(app);
  /**
   * Register Error Handler
   */
  app.use(errorHandler);

  return app;
}
