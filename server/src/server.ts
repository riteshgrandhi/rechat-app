import express, { Application, Request, Response } from "express";
import * as path from "path";
const port: number = 3001;

const app: Application = express();

app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});

app.get("/api/data", (req: Request, res: Response) => {
  res.send({ express: "Express server is connected!" });
});
