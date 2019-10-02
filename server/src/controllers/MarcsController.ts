import { Router, Request } from "express";
import { Logger, IMarc, IUser } from "remarc-app-common";

import { TypedResponse } from "../helpers/Helpers";
import { IDataResponse } from "remarc-app-common";
import MarcsService from "../services/MarcsService";

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

  private async getMarcs(
    req: Request,
    resp: TypedResponse<IDataResponse<IMarc[]>>
  ) {
    try {
      return resp.json({
        data: await this.marcsService.getMarcs(req.user as IUser),
        message: "Success"
      });
    } catch (err) {
      return resp.status(500).json({ error: err, message: "Failed" });
    }
  }

  private async getMarcById(
    req: Request,
    resp: TypedResponse<IDataResponse<IMarc>>
  ) {
    try {
      var marc = await this.marcsService.getMarcById(
        req.params.id,
        req.user as IUser
      );
      if (marc == null) {
        return resp
          .status(404)
          .json({ error: "Marc with given Id not found!", message: "Failed" });
      }

      return resp.json({ data: marc, message: "Success" });
    } catch (err) {
      return resp.status(500).json({ error: err, message: "Failed" });
    }
  }

  private async createMarc(
    req: Request,
    resp: TypedResponse<IDataResponse<IMarc>>
  ) {
    try {
      if (!req.body || !req.body.title) {
        return resp.status(400).json({
          error: "'title' field is missing from request",
          message: "Failed"
        });
      }

      var marc = await this.marcsService.createMarc(
        req.body.title,
        req.user as IUser
      );
      if (marc == null) {
        return resp.status(500).json({
          error: "Marc with given title could not be created",
          message: "Failed"
        });
      }

      return resp.json({ data: marc, message: "Success" });
    } catch (err) {
      return resp.status(500).json({ error: err, message: "Failed" });
    }
  }

  private async editMarc(req: Request, resp: TypedResponse<IDataResponse<{}>>) {
    try {
      if (!req.body || !req.body.title) {
        return resp.status(400).json({
          error: "'title' field is missing from request",
          message: "Failed"
        });
      }

      await this.marcsService.editMarc(
        req.params.id,
        req.body.title,
        req.user as IUser
      );

      return resp.json({ message: "Success" });
    } catch (err) {
      return resp.status(500).json({ error: err, message: "Failed" });
    }
  }
}
