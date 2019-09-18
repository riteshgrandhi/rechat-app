import React from "react";
import { RouteComponentProps, navigate } from "@reach/router";
import styles from "./../styles/app.module.scss";

interface IHomeProps extends RouteComponentProps {}
interface IHomeState {}

export default class Home extends React.Component<IHomeProps, IHomeState> {
  render() {
    return (
      <div className={styles.homePage}>
        <div>
          <h2>&nbsp;&nbsp;Select or Create a Marc from the Side Bar!</h2>
        </div>
      </div>
    );
  }
}
