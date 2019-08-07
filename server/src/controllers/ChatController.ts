import { Router, Request, Response } from "express";

export default class ChatController {
  public path = "/chat";
  public router: Router = Router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(this.path, this.getData);
  }

  private getData(req: Request, resp: Response) {
    try {
      return resp.send({ express: "Express Backend is Connected!" });
    } catch (ex) {
      return resp.status(500);
    }
  }
}
