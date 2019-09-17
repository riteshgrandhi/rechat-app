import { Router, Request, Response } from "express";
import { IMarc } from "@common";

const _marcs: IMarc[] = [
  {
    id: "mydoc"
  },
  {
    id: "this-is-doc"
  }
];

export default class MarcsController {
  public path = "/marcs";
  public router: Router = Router();

  constructor() {
    this.initRoutes();
    // this.getMarcs = this.getMarcs.bind(this);
    // this.getMarcById = this.getMarcById.bind(this);
  }

  private initRoutes() {
    this.router.get(this.path, this.getMarcs);
    this.router.get(`${this.path}/:id`, this.getMarcById);
  }

  private getMarcs(req: Request, resp: Response) {
    try {
      console.log(_marcs);
      return resp.send({ data: _marcs });
    } catch (ex) {
      return resp.status(500);
    }
  }

  private getMarcById(req: Request, resp: Response) {
    try {
      var index = _marcs.findIndex(m => {
        return req.params.id ? m.id == req.params.id : false;
      });
      if (index < 0) {
        return resp
          .send({ error: "Marc with given Id not found!" })
          .status(404);
      }
      return resp.send({ data: _marcs[index] });
    } catch (ex) {
      return resp.status(500);
    }
  }
}
