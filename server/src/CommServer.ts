import express, { Application } from "express";
import MarcsController from "./controllers/MarcsController";
import socketio from "socket.io";
import ChangeHandler from "./controllers/ChangeHandler";

export default class CommServer {
  private app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initMiddleware();
    this.initControllers();
  }

  private initMiddleware() {
    this.app.use(express.json());
  }

  private initControllers() {
    let controllers = [new MarcsController()];
    controllers.forEach(controller => {
      this.app.use("/api", controller.router);
    });
  }

  public start() {
    const server = this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}...`);
    });

    const io = socketio(server);
    const chatHandler = new ChangeHandler(io);
    chatHandler.init();
  }
}
