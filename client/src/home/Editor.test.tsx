import React from "react";
import ReactDOM from "react-dom";
import Editor from "./Editor";
import { Logger, LogLevel } from "@common";
import ApiService from "../services/ApiService";
import AuthService from "../services/AuthService";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const logger = new Logger(LogLevel.VERBOSE);
  const authService = new AuthService(logger);
  const apiService = new ApiService(logger, authService);
  ReactDOM.render(
    <Editor marcId="test" logger={logger} apiService={apiService} />,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
