import React from "react";
import io from "socket.io-client";
import styles from "./app.module.scss";
import { InfoPanel } from "./InfoPanel";
import { RouteComponentProps } from "@reach/router";
import * as Common from "remarc-app-common";

interface IAppState {
  title: string;
  document: string;
}

interface IAppProps extends RouteComponentProps {}

class Editor extends React.Component<IAppProps, IAppState> {
  private socket: SocketIOClient.Socket;

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      title: "",
      document: ""
    };
    this.onServerTextUpdate = this.onServerTextUpdate.bind(this);

    this.socket = io();
    this.initSocketListeners();
  }

  private initSocketListeners() {
    this.socket.on("new_notification", (data: any) => {
      console.log(data);
    });

    this.socket.on(Common.Events.SERVER_TEXT_UPDATE, this.onServerTextUpdate);
  }

  componentDidMount() {
    this.getData().then(data => {
      this.setState({
        title: data.express
      });
    });
  }

  getData() {
    return fetch("/api/data").then(resp => resp.json());
  }

  onServerTextUpdate(data: Common.IOpSequence) {
    console.log(`recieving "${data}" from server`);
    // this.setState({ document: data.text });
  }

  onSelfTextUpdate(updatedText: string) {
    console.log(`sending "${updatedText}" to server`);
    this.socket.emit(Common.Events.CLIENT_TEXT_UPDATE, {
      text: updatedText
    });
  }

  render() {
    return (
      <div className={styles.app}>
        <InfoPanel />
        <div className={styles.editor}>
          <textarea
            className={styles.textarea}
            value={this.state.document}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              var val = (event.target as HTMLTextAreaElement).value;
              this.setState({ document: val });
              this.onSelfTextUpdate(val);
            }}
          />
        </div>
      </div>
    );
  }
}

export default Editor;
