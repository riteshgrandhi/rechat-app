import React from "react";
import AuthService from "../services/AuthService";
import { Logger } from "@common";
import { RouteComponentProps } from "@reach/router";

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
      throw err;
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label>Username</label>
          <input
            type="text"
            onChange={e => {
              this.setState({ userName: e.target.value });
            }}
          />
          <input
            type="password"
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
          <input type="submit" onClick={this.onSubmit} />
        </form>
      </div>
    );
  }
}
