import React from "react";
import { Router, navigate } from "@reach/router";
import { IMarc, Logger } from "@common";

import ApiService from "./services/ApiService";
import Home from "./home/Home";
import { Login } from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthService from "./services/AuthService";

import styles from "./styles/app.module.scss";
import { SignUp } from "./auth/SignUp";

interface IAppProps {
  logger: Logger;
  authService: AuthService;
  apiService: ApiService;
}

interface IAppState {
  marcs: IMarc[];
}

export default class App extends React.Component<IAppProps, IAppState> {
  private logger: Logger;
  private authService: AuthService;
  private apiService: ApiService;

  /**
   * constructor
   */
  constructor(props: IAppProps) {
    super(props);
    this.logger = props.logger;
    this.authService = props.authService;
    this.apiService = props.apiService;

    this.state = {
      marcs: []
    };
  }

  private onLogin() {
    navigate("/");
  }

  render() {
    return (
      <Router className={styles.app}>
        <ProtectedRoute
          path="/"
          authService={this.authService}
          redirectPath="/login"
        >
          <Home
            marcs={this.state.marcs}
            path="/edit/:currentMarcId"
            logger={this.logger}
            apiService={this.apiService}
          />
          <Home
            path="/"
            marcs={this.state.marcs}
            logger={this.logger}
            apiService={this.apiService}
          />
        </ProtectedRoute>
        <Login
          path="/login"
          authService={this.authService}
          logger={this.logger}
          onLoginCallback={() => {
            this.onLogin();
          }}
        />
        <SignUp
          path="/signup"
          authService={this.authService}
          logger={this.logger}
        />
      </Router>
    );
  }
}
