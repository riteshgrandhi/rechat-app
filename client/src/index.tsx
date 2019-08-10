import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Router, Redirect } from "@reach/router";

import Home from "./home/Home";
import Editor from "./editor/Editor";

class App extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <Home path="/" />
          <Editor path="/edit/:marcid" />
          <Redirect default noThrow from="*" to="/" />
        </Router>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
