import { Router, Request, Response } from "express";
import MarcsService from "../services/MarcsService";
import { Logger, LogLevel } from "remarc-app-common";

export default class MarcsController {
  public path = "/marcs";
  public router: Router = Router();
  private logger: Logger;
  private marcsService: MarcsService;

  constructor(marcsService: MarcsService, logger: Logger) {
    this.logger = logger;
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
    this.router.post(`${this.path}`, (req, resp) => {
      this.createMarc(req, resp);
    });
    this.router.put(`${this.path}/:id`, (req, resp) => {
      this.editMarc(req, resp);
    });
  }

  private async getMarcs(req: Request, resp: Response) {
    try {
      return resp.send({ data: await this.marcsService.getMarcs() });
    } catch (err) {
      return resp.send({ error: err }).status(500);
    }
  }

  private async getMarcById(req: Request, resp: Response) {
    try {
      var marc = await this.marcsService.getMarcById(req.params.id);
      if (marc == null) {
        return resp
          .send({ error: "Marc with given Id not found!" })
          .status(404);
      }

      return resp.send({ data: marc });
    } catch (err) {
      return resp.send({ error: err }).status(500);
    }
  }

  private async createMarc(req: Request, resp: Response) {
    try {
      if (!req.body || !req.body.title) {
        return resp
          .send({ error: "'title' field is missing from request" })
          .status(400);
      }

      var marc = await this.marcsService.createMarc(req.body.title);
      if (marc == null) {
        return resp
          .send({ error: "Marc with given title could not be created" })
          .status(500);
      }

      return resp.send({ data: marc });
    } catch (err) {
      return resp.send({ error: err }).status(500);
    }
  }

  private async editMarc(req: Request, resp: Response) {
    try {
      if (!req.body || !req.body.title) {
        return resp
          .send({ error: "'title' field is missing from request" })
          .status(400);
      }

      await this.marcsService.editMarc(req.params.id, req.body.title);

      return resp.send().status(200);
    } catch (err) {
      return resp.send({ error: err }).status(500);
    }
  }
}
