import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";
import ServiceContext, { defaultContextValue } from "./services/ServiceContext";

(async () => {
  try {
    ReactDOM.render(
      <ServiceContext.Provider value={defaultContextValue}>
        <App />
      </ServiceContext.Provider>,
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
