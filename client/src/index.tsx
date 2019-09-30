import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Router, Redirect, Location } from "@reach/router";

import Home from "./home/Home";
import Editor from "./editor/Editor";
import ErrorPage from "./other/ErrorPage";
import initAxios, { axiosAuth } from "./services/AxiosInstance";
import { IMarc, Logger, LogLevel, IDataResponse } from "@common";
import { SideBar } from "./home/SideBar";

import styles from "./styles/app.module.scss";
import { Config } from "./config/appConfig";
import AuthService from "./services/AuthService";

interface IAppProps {
  logger: Logger;
  authService: AuthService;
}
interface IAppState {
  marcs: IMarc[];
}

/**
 * Main Application Component
 */
class App extends React.Component<IAppProps, IAppState> {
  private logger: Logger;
  // private authService: AuthService;

  /**
   * App Constructor
   * @param props
   */
  constructor(props: IAppProps) {
    super(props);

    this.logger = props.logger;
    // this.authService = props.authService;

    this.getMarcs = this.getMarcs.bind(this);
    this.refreshMarcs = this.refreshMarcs.bind(this);
    this.state = {
      marcs: []
    };
  }

  public componentDidMount() {
    this.refreshMarcs();
  }

  private async refreshMarcs() {
    try {
      let resp: IMarc[] = await this.getMarcs();
      this.setState({ marcs: resp });
    } catch (err) {
      this.logger.log(App.name, "Error", LogLevel.ERROR, err);
    }
  }

  private async getMarcs(): Promise<IMarc[]> {
    try {
      let res: IDataResponse<IMarc[]> = await axiosAuth
        .get<IDataResponse<IMarc[]>>("/api/marcs", { params: { auth: true } })
        .then(r => r.data)
        .catch(err => {
          throw err;
        });
      if (!res.data) {
        throw res.error || "'data' is missing";
      }
      this.logger.log(App.name, "Response", LogLevel.VERBOSE, res);
      return res.data;
    } catch (err) {
      throw `Failed to fetch: ${err}`;
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
                refreshCallback={this.refreshMarcs}
                logger={this.logger}
              />
              <Router style={{ width: "100%" }}>
                <Home path="/" />
                <Editor
                  path="/edit/:marcId"
                  key={location.pathname}
                  logger={this.logger}
                />
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

(async () => {
  let _level: LogLevel = LogLevel[Config.logLevel as keyof typeof LogLevel];
  let _logger = new Logger(_level);
  let _authService = new AuthService(_logger);

  if (!_authService.isAuthenticated) {
    await _authService.login("admin", "rigrandh").then(() => {
      initAxios(_authService);
    });
  }

  ReactDOM.render(
    <App logger={_logger} authService={_authService} />,
    document.getElementById("root")
  );
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
