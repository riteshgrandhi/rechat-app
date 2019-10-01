import React from "react";
import AuthService from "../services/AuthService";
import { Logger, LogLevel } from "@common";
import { RouteComponentProps, navigate } from "@reach/router";

import styles from "./../styles/app.module.scss";

interface ILoginProps extends RouteComponentProps<{}> {
  logger: Logger;
  authService: AuthService;
  onLoginCallback: () => void;
}
interface ILoginState {
  userName: string;
  password: string;
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
  }

  private async onSubmit(event: React.MouseEvent | React.FormEvent) {
    event.preventDefault();
    try {
      this.authService
        .login(this.state.userName, this.state.password)
        .then(() => {
          this.props.onLoginCallback();
        });
    } catch (err) {
      this.logger.log(Login.name, "ERROR", LogLevel.ERROR, err);
      throw err;
    }
  }

  render() {
    return (
      <div className={styles.loginPage}>
        <form onSubmit={this.onSubmit} className={styles.form}>
          <div className={styles.title}>
            <span className={styles.secondary}>LOG INTO</span>
            <span className={styles.primary}>REMARC</span>
          </div>
          <label>USERNAME</label>
          <input
            type="text"
            onChange={e => {
              this.setState({ userName: e.target.value });
            }}
            autoFocus
          />
          <label>PASSWORD</label>
          <input
            type="password"
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
          <input type="submit" onClick={this.onSubmit} value="LOGIN" />
        </form>
      </div>
    );
  }
}
