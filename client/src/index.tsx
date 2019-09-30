import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import { Logger, LogLevel } from "@common";

import { Config } from "./config/appConfig";
import AuthService from "./services/AuthService";
import App from "./App";
import ApiService from "./services/ApiService";

(async () => {
  try {
    let _level: LogLevel = LogLevel[Config.logLevel as keyof typeof LogLevel];
    let _logger = new Logger(_level);
    let _authService = new AuthService(_logger);
    let _apiService = new ApiService(_logger, _authService);

    ReactDOM.render(
      <App
        logger={_logger}
        authService={_authService}
        apiService={_apiService}
      />,
      document.getElementById("root")
    );
  } catch (err) {
    console.log(err);
  }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
