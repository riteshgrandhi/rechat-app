import React, { Fragment } from "react";
import AuthService from "../services/AuthService";
import { Redirect, RouteComponentProps } from "@reach/router";

interface IProtectedRouteProps extends RouteComponentProps<{}> {
  redirectPath: string;
  authService: AuthService;
}

export default class ProtectedRoute extends React.Component<
  IProtectedRouteProps,
  { isAuthenticated: boolean }
> {
  private authService: AuthService;

  constructor(props: IProtectedRouteProps) {
    super(props);
    this.authService = props.authService;
    this.state = {
      isAuthenticated: this.authService.isAuthenticated
    };
  }

  render() {
    return (
      <Fragment>
        {this.state.isAuthenticated ? (
          this.props.children
        ) : (
          <Redirect
            from={this.props.location ? this.props.location.pathname : ""}
            to={this.props.redirectPath}
            noThrow
          />
        )}
      </Fragment>
    );
  }
}
