import React from "react";
import logo from "./../logo.svg";
import "./ReChatApp.css";

interface IAppState {
  title: string;
}

interface IAppProps {}

class ReChatApp extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      title: ""
    };
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
    return fetch("/api/chat").then(resp => resp.json());
  }
}

export default ReChatApp;
