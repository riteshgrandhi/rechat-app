import React from "react";
import { Router, navigate } from "@reach/router";
import { IMarc } from "@common";

import Home from "./home/Home";
import { Login } from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import styles from "./styles/app.module.scss";
import { SignUp } from "./auth/SignUp";

interface IAppProps {}

interface IAppState {
  marcs: IMarc[];
}

export default class App extends React.Component<IAppProps, IAppState> {
  /**
   * constructor
   */
  constructor(props: IAppProps) {
    super(props);

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
          <ProtectedRoute path="/" redirectPath="/login">
            <Home marcs={this.state.marcs} path="/edit/:currentMarcId" />
            <Home path="/" marcs={this.state.marcs} />
          </ProtectedRoute>
          <Login
            path="/login"
            onLoginCallback={() => {
              this.onLogin();
            }}
          />
          <SignUp path="/signup" />
        </Router>
    );
  }
}
