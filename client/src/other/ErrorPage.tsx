import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";

interface IErrorPageProps extends RouteComponentProps {}
interface IErrorPageState {
  error?: Error;
  message?: string;
}

export default class ErrorPage extends React.Component<
  IErrorPageProps,
  IErrorPageState
> {
  /**
   *
   */
  constructor(props: IErrorPageProps) {
    super(props);
    this.state = {
      message:
        this.props.location && this.props.location.state
          ? this.props.location.state.message
          : null,
      error:
        this.props.location && this.props.location.state
          ? this.props.location.state.error
          : null
    };
  }
  render() {
    return (
      <div>
        <div>An Error has occured</div>
        {this.state.message && <div>{this.state.message}</div>}
        {this.state.error && (
          <div>{JSON.stringify(this.state.error, null, 4)}</div>
        )}
      </div>
    );
  }
}
