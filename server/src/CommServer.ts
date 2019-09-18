import express, { Application } from "express";
import cors from "cors";
import socketio from "socket.io";
import MarcsController from "./controllers/MarcsController";
import ChangeHandler from "./controllers/ChangeHandler";
import MarcsService from "./services/MarcsService";
import { Config } from "./config/appConfig";

export default class CommServer {
  private app: Application;
  private port: number;
  private marcsService: MarcsService;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.marcsService = new MarcsService();
    this.initMiddleware();
    this.initControllers();
  }

  private initMiddleware() {
    this.app.use(cors({ origin: Config.clientUrl, optionsSuccessStatus: 200 }));
    this.app.use(express.json());
  }

  private initControllers() {
    let controllers = [new MarcsController(this.marcsService)];
    controllers.forEach(controller => {
      this.app.use("/api", controller.router);
    });
  }

  public start() {
    const server = this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}...`);
    });

    const io = socketio(server, {
      path: "/socket.io",
      transports: ["websocket"]
    });
    const chatHandler = new ChangeHandler(io, this.marcsService);
    chatHandler.init();
  }
}
