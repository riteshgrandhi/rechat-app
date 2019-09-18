import { Router, Request, Response } from "express";
import MarcsService from "../services/MarcsService";

export default class MarcsController {
  public path = "/marcs";
  public router: Router = Router();
  private marcsService: MarcsService;

  constructor(marcsService: MarcsService) {
    this.marcsService = marcsService;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(this.path, (req, resp) => {
      this.getMarcs(req, resp);
    });
    this.router.get(`${this.path}/:id`, (req, resp) => {
      this.getMarcById(req, resp);
    });
  }

  private getMarcs(req: Request, resp: Response) {
    try {
      return resp.send({ data: this.marcsService.getMarcs() });
    } catch (ex) {
      return resp.status(500);
    }
  }

  private getMarcById(req: Request, resp: Response) {
    try {
      var marc = this.marcsService.getMarcById(req.params.id);
      if (marc == null) {
        return resp
          .send({ error: "Marc with given Id not found!" })
          .status(404);
      }
      return resp.send({ data: marc });
    } catch (ex) {
      return resp.status(500);
    }
  }
}
