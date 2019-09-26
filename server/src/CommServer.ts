import express, { Application } from "express";
import cors from "cors";
import socketio from "socket.io";
import mongoose from "mongoose";
import passport from "passport";
import { configurePassport } from "./services/configurePassport";

import MarcsController from "./controllers/MarcsController";
import ChangeHandler from "./controllers/ChangeHandler";
import MarcsService from "./services/MarcsService";
import { Config } from "./config/serverConfig";
import { Logger, LogLevel } from "remarc-app-common";
import AuthController from "./controllers/AuthController";

export default class CommServer {
  private app: Application;
  private port: number;
  private marcsService: MarcsService;
  private logger: Logger;

  constructor(port: number) {
    let _level: LogLevel = LogLevel[Config.logLevel as keyof typeof LogLevel];
    this.logger = new Logger(_level);
    this.app = express();
    this.port = port;
    this.marcsService = new MarcsService(this.logger);
    this.initMiddleware();
    this.initControllers();
  }

  private initMiddleware() {
    this.app.use(cors({ origin: Config.clientUrl, optionsSuccessStatus: 200 }));
    this.app.use(express.json());
    configurePassport(passport);
    this.app.use(passport.initialize());
  }

  private initControllers() {
    let _marcsController = new MarcsController(this.marcsService, this.logger);
    this.app.use("/api", _marcsController.router);
    
    let _authController = new AuthController(this.logger);
    this.app.use("/", _authController.router);
  }

  public start() {
    mongoose.connect(Config.connectionString, { useNewUrlParser: true });
    let db = mongoose.connection;

    db.on("error", err => {
      this.logger.log(
        CommServer.name,
        "Connection Error",
        LogLevel.VERBOSE,
        err
      );
    });

    db.once("open", () => {
      this.logger.log(
        CommServer.name,
        "Connection Successful",
        LogLevel.VERBOSE
      );
      const server = this.app.listen(this.port, () => {
        this.logger.log(
          `${CommServer.name}`,
          `Listening on port ${this.port}`,
          LogLevel.VERBOSE
        );
      });

      const io = socketio(server, {
        path: "/socket.io"
        // transports: ["websocket"]
      });
      const chatHandler = new ChangeHandler(io, this.marcsService, this.logger);
      chatHandler.init();
    });
  }
}
