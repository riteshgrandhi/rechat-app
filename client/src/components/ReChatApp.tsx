import React from "react";
import logo from "./../logo.svg";
import io from "socket.io-client";
import "./ReChatApp.css";

interface IAppState {
  title: string;
}

interface IAppProps {}

class ReChatApp extends React.Component<IAppProps, IAppState> {
  private socket: SocketIOClient.Socket;

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      title: ""
    };

    this.socket = io();
    this.initSocketListeners();
  }

  private initSocketListeners() {
    this.socket.on("new_notification", (data: any) => {
      console.log(data);
    });
  }

  componentDidMount() {
    this.getData().then(data => {
      this.setState({
        title: data.express
      });
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{this.state.title}</p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }

  getData() {
    return fetch("/api/data").then(resp => resp.json());
  }
}

export default ReChatApp;
