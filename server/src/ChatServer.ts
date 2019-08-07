import express, { Application } from "express";
import ChatController from "./controllers/ChatController";

export default class ChatServer {
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
    let controllers = [new ChatController()];
    controllers.forEach(controller => {
      this.app.use("/api", controller.router);
    });
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}...`);
    });
  }
}
