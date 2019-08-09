import React from "react";
import io from "socket.io-client";
import styles from "./../styles/RemarcApp.module.scss";
import { InfoPanel } from "./InfoPanel";

interface IAppState {
  title: string;
  document: string;
}

interface IAppProps {}

class RemarcApp extends React.Component<IAppProps, IAppState> {
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

    this.socket.on("server_text_update", this.onServerTextUpdate);
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

  onServerTextUpdate(data: any) {
    console.log(`recieving "${data.text}" from server`);
    this.setState({ document: data.text });
  }

  onSelfTextUpdate(updatedText: string) {
    console.log(`sending "${updatedText}" to server`);
    this.socket.emit("client_text_update", { text: updatedText });
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

export default RemarcApp;
