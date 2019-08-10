import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";

interface IHomeProps extends RouteComponentProps {}
interface IHomeState {}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  render() {
    return (
      <div>
        <button
          onClick={() => {
            navigate("/edit/1");
          }}
        >
          Edit Marc 1
        </button>
      </div>
    );
  }
}
