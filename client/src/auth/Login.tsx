import React from "react";
import AuthService from "../services/AuthService";
import { Logger, ILoginResponse } from "@common";
import { RouteComponentProps, navigate } from "@reach/router";

import styles from "./../styles/app.module.scss";

interface ILoginProps extends RouteComponentProps<{}> {
  logger: Logger;
  authService: AuthService;
  onLoginCallback: () => void;
}
interface ILoginState {
  email: string;
  password: string;
  error: string;
}

/**
 * Login page component
 */
export class Login extends React.Component<ILoginProps, ILoginState> {
  private logger: Logger;
  private authService: AuthService;
  /**
   * constructor
   */
  constructor(props: ILoginProps) {
    super(props);

    this.logger = props.logger;
    this.authService = props.authService;
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      email: "",
      password: "",
      error: ""
    };
  }

  private async onSubmit(event: React.MouseEvent | React.FormEvent) {
    event.preventDefault();
    if (!this.state.email) {
      this.setState({
        error: "Please enter a valid email"
      });
      return;
    }
    if (!this.state.password) {
      this.setState({
        error: "Please enter a password"
      });
      return;
    }
    this.authService
      .login(this.state.email, this.state.password)
      .then(() => {
        this.props.onLoginCallback();
      })
      .catch((err: ILoginResponse) => {
        this.setState({
          error: err.error || err.message
        });
      });
  }

  render() {
    return (
      <div className={styles.loginPage}>
        <form onSubmit={this.onSubmit} className={styles.form}>
          <div className={styles.title}>
            <span className={styles.secondary}>LOG INTO</span>
            <span className={styles.primary}>REMARC</span>
          </div>
          <label>EMAIL</label>
          <input
            type="text"
            onChange={e => {
              this.setState({ email: e.target.value, error: "" });
            }}
            autoFocus
          />
          <label>PASSWORD</label>
          <input
            type="password"
            onChange={e => {
              this.setState({ password: e.target.value, error: "" });
            }}
          />
          {this.state.error && (
            <label className={styles.errorMessage}>{this.state.error}</label>
          )}
          <input
            type="submit"
            className={styles.loginButton}
            onClick={this.onSubmit}
            value="LOGIN"
          />
          {/* <label className={styles.signupLabel}>New User?</label> */}
          <input
            type="button"
            className={styles.signupButton}
            onClick={() => {
              navigate("/signup");
            }}
            value="SIGN UP"
          />
        </form>
      </div>
    );
  }
}
