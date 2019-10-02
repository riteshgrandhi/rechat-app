import React from "react";
import AuthService from "../services/AuthService";
import { Logger, IUser, ISignUpResponse } from "@common";
import { RouteComponentProps, Link, navigate } from "@reach/router";

import styles from "./../styles/app.module.scss";

interface ISignUpProps extends RouteComponentProps<{}> {
  logger: Logger;
  authService: AuthService;
}
interface ISignUpState {
  userDetails: IUser;
  password: string;
  confirmPwd: string;
  error: string;
  isSuccess: boolean;
}

/**
 * Login page component
 */
export class SignUp extends React.Component<ISignUpProps, ISignUpState> {
  private authService: AuthService;
  /**
   * constructor
   */
  constructor(props: ISignUpProps) {
    super(props);

    this.authService = props.authService;
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      isSuccess: false,
      userDetails: {
        // userName: "",
        firstName: "",
        lastName: "",
        email: ""
      },
      password: "",
      confirmPwd: "",
      error: ""
    };
  }

  private validateForm(): boolean {
    if (this.state.confirmPwd != this.state.password) {
      this.setState({
        error: "Passwords don't match"
      });
      return false;
    }
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
        this.state.userDetails.email
      )
    ) {
      this.setState({
        error: "Email is invalid"
      });
      return false;
    }
    if (!this.state.userDetails.firstName.trim()) {
      this.setState({
        error: "First Name is required"
      });
      return false;
    }
    return true;
  }

  private async onSubmit(event: React.MouseEvent | React.FormEvent) {
    event.preventDefault();
    if (!this.validateForm()) {
      return;
    }
    this.authService
      .signup(this.state.userDetails, this.state.password)
      .then(() => {
        this.setState({ isSuccess: true });
      })
      .catch((err: ISignUpResponse) => {
        this.setState({
          isSuccess: false,
          error: err.error ? err.error.errmsg || err.error : err.message
        });
      });
  }

  render() {
    return (
      <div className={styles.loginPage}>
        <form onSubmit={this.onSubmit} className={styles.form}>
          <div className={styles.title}>
            <span className={styles.secondary}>SIGN UP</span>
          </div>
          <label>EMAIL *</label>
          <input
            type="email"
            onChange={e => {
              this.setState({
                userDetails: {
                  ...this.state.userDetails,
                  email: e.target.value
                },
                error: ""
              });
            }}
            required
          />
          <label>FIRST NAME *</label>
          <input
            type="text"
            onChange={e => {
              this.setState({
                userDetails: {
                  ...this.state.userDetails,
                  firstName: e.target.value.trim()
                },
                error: ""
              });
            }}
            required
          />
          <label>LAST NAME</label>
          <input
            type="text"
            onChange={e => {
              this.setState({
                userDetails: {
                  ...this.state.userDetails,
                  lastName: e.target.value.trim()
                },
                error: ""
              });
            }}
          />
          <label>PASSWORD *</label>
          <input
            type="password"
            onChange={e => {
              this.setState({ password: e.target.value, error: "" });
            }}
            required
          />
          <label>CONFIRM PASSWORD *</label>
          <input
            type="password"
            onChange={e => {
              this.setState({
                confirmPwd: e.target.value,
                error: ""
              });
            }}
            required
          />
          {this.state.error && (
            <label className={styles.errorMessage}>{this.state.error}</label>
          )}
          {this.state.isSuccess && (
            <label className={styles.successMessage}>
              Sign Up Successful. <Link to="/login">Login</Link>
            </label>
          )}
          <input
            type="submit"
            className={styles.loginButton}
            onClick={this.onSubmit}
            value="SIGNUP"
          />
          <input
            type="button"
            className={styles.signupButton}
            onClick={() => {
              navigate("/login");
            }}
            value="LOGIN"
          />
        </form>
      </div>
    );
  }
}
