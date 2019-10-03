import React, { Fragment } from "react";
import { Redirect, RouteComponentProps } from "@reach/router";
import ServiceContext, { IServiceContext } from "../services/ServiceContext";

interface IProtectedRouteProps extends RouteComponentProps<{}> {
  redirectPath: string;
}

export default class ProtectedRoute extends React.Component<
  IProtectedRouteProps,
  { isAuthenticated: boolean }
> {
  static contextType = ServiceContext;
  public context!: React.ContextType<typeof ServiceContext>;

  constructor(props: IProtectedRouteProps, context: IServiceContext) {
    super(props, context);
    this.state = {
      isAuthenticated: context.authService.isAuthenticated
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
