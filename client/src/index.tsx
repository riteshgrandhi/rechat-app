import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Router, Redirect, Location } from "@reach/router";

import Home from "./home/Home";
import Editor from "./editor/Editor";
import ErrorPage from "./other/ErrorPage";
import { IMarc } from "@common";
import { SideBar } from "./home/SideBar";

import styles from "./styles/app.module.scss";
import { Config } from "./config/appConfig";

interface IIndexProps {}
interface IIndexState {
  marcs: IMarc[];
}

class App extends React.Component<IIndexProps, IIndexState> {
  /**
   *
   */
  constructor(props: IIndexProps) {
    super(props);
    this.getMarcs = this.getMarcs.bind(this);
    this.state = {
      marcs: []
    };
  }

  public componentDidMount() {
    this.getMarcs().then(resp => {
      console.log(resp);
      this.setState({ marcs: resp.data });
    });
  }

  private async getMarcs() {
    try {
      return await fetch(`${Config.serverUrl}/api/marcs`).then(res =>
        res.json()
      );
    } catch (ex) {
      throw `Failed to fetch: ${ex}`;
    }
  }

  render() {
    return (
      <div className={styles.app}>
        <Location>
          {({ location }) => (
            <Fragment>
              <SideBar
                marcs={this.state.marcs}
                currentMarcId={location.pathname.split("/edit/")[1]}
              />
              <Router style={{ width: "100%" }}>
                <Home path="/" />
                <Editor path="/edit/:marcId" key={location.pathname} />
                <ErrorPage path="/error" />
                <Redirect default noThrow from="*" to="/" />
              </Router>
            </Fragment>
          )}
        </Location>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
