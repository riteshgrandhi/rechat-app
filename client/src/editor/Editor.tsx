import React from "react";
import io from "socket.io-client";
import styles from "./app.module.scss";
import { InfoPanel } from "./InfoPanel";
import { RouteComponentProps } from "@reach/router";
// import { Events, OpType, ICharOpSequence, CFRString } from "remarc-app-common";
import { ICharOpSequence, CFRString, Events } from "@common";
import { Key } from "ts-keycode-enum";

interface IEditorState {
  title: string;
  document: string;
}

interface IEditorProps extends RouteComponentProps {}

class Editor extends React.Component<IEditorProps, IEditorState> {
  private socket: SocketIOClient.Socket;
  private CFRDocument: CFRString;

  constructor(props: IEditorProps) {
    super(props);

    this.state = {
      title: "",
      document: ""
    };

    this.onServerTextUpdate = this.onServerTextUpdate.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.socket = io();
    this.CFRDocument = new CFRString();
    this.initSocketListeners();
  }

  private initSocketListeners() {
    this.socket.on("connect", (data: any) => {
      console.log(data);
    });

    this.socket.on(Events.SERVER_TEXT_UPDATE, this.onServerTextUpdate);
  }

  private onServerTextUpdate(opSequence: ICharOpSequence) {
    console.log(opSequence);
    this.CFRDocument.applyOpSequence(opSequence);
    this.setState({ document: this.CFRDocument.getText() });
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

  private onKeyDown(e: React.KeyboardEvent) {
    if (
      (e.ctrlKey && (e.which == Key.Delete || e.which == Key.Backspace)) ||
      (e.ctrlKey && e.which == Key.Z)
    ) {
      e.preventDefault();
    }
    // console.log(e.which, e.shiftKey, e.keyCode);

    if (
      e.which == 0 ||
      (e.shiftKey && e.which == Key.Shift) ||
      e.ctrlKey ||
      e.altKey ||
      e.which == Key.Tab ||
      e.which == Key.LeftArrow ||
      e.which == Key.RightArrow ||
      e.which == Key.UpArrow ||
      e.which == Key.DownArrow ||
      e.which == Key.PageDown ||
      e.which == Key.PageUp ||
      e.which == Key.Insert ||
      e.which == Key.End ||
      e.which == Key.Home ||
      e.which == Key.CapsLock ||
      e.which == Key.F1 ||
      e.which == Key.F2 ||
      e.which == Key.F3 ||
      e.which == Key.F4 ||
      e.which == Key.F5 ||
      e.which == Key.F6 ||
      e.which == Key.F7 ||
      e.which == Key.F8 ||
      e.which == Key.F9 ||
      e.which == Key.F10 ||
      e.which == Key.F11 ||
      e.which == Key.F12 //||
      //e.key.length > 1
    ) {
      return false;
    }

    let text: string;
    let val = this.state.document;
    let target = e.target as HTMLTextAreaElement;

    let _start = target.selectionStart;
    let _end = target.selectionEnd;

    let deleteOpSequence: ICharOpSequence = [];
    let insertOpSequence: ICharOpSequence = [];
    let opSequence: ICharOpSequence = [];

    if (!(e.ctrlKey && e.which == Key.V)) {
      switch (e.which) {
        case Key.Backspace: {
          let _s: number = _start == _end ? _start - 1 : _start;
          text = val.slice(_s, _end);
          deleteOpSequence = this.CFRDocument.deleteString({
            text: text,
            userId: this.socket.id,
            globalPos: _s
          });
          break;
        }
        case Key.Delete: {
          text = val.slice(_start, _start == _end ? _end + 1 : _end);
          deleteOpSequence = this.CFRDocument.deleteString({
            text: text,
            userId: this.socket.id,
            globalPos: _start
          });
          break;
        }
        default: {
          if (_start != _end) {
            text = val.slice(_start, _end);
            deleteOpSequence = this.CFRDocument.deleteString({
              text: text,
              userId: this.socket.id,
              globalPos: _start
            });
          }
          if (e.which == Key.Enter) {
            text = "\n";
          } else {
            text = e.key;
          }
          insertOpSequence = this.CFRDocument.insertString({
            text: text,
            userId: this.socket.id,
            globalPos: _start
          });
        }
      }
      this.CFRDocument.print();
      opSequence = deleteOpSequence.concat(insertOpSequence);
      console.log(opSequence);
      this.sendOperationList(opSequence);
    }
  }

  private onPaste(e: React.ClipboardEvent) {
    let text: string;

    let val = this.state.document;
    let target = e.target as HTMLTextAreaElement;

    let _start = target.selectionStart;
    let _end = target.selectionEnd;

    let deleteOpSequence: ICharOpSequence = [];
    let opSequence: ICharOpSequence = [];

    if (_start != _end) {
      text = val.slice(_start, _end);
      deleteOpSequence = this.CFRDocument.deleteString({
        text: text,
        userId: this.socket.id,
        globalPos: _start
      });
    }
    text = e.clipboardData.getData("text/plain");
    let insertOpSequence: ICharOpSequence = this.CFRDocument.insertString({
      text: text,
      userId: this.socket.id,
      globalPos: _start
    });

    this.CFRDocument.print();
    opSequence = deleteOpSequence.concat(insertOpSequence);
    console.log(opSequence);
    this.sendOperationList(opSequence);
  }

  private sendOperationList(opSequence: ICharOpSequence) {
    this.socket.emit(Events.CLIENT_TEXT_UPDATE, opSequence);
  }

  render() {
    return (
      <div className={styles.app}>
        <InfoPanel />
        <div className={styles.editor}>
          <textarea
            className={styles.textarea}
            value={this.state.document}
            onChange={e => this.setState({ document: e.target.value })}
            onKeyDown={this.onKeyDown}
            onPaste={this.onPaste}
          />
        </div>
      </div>
    );
  }
}

export default Editor;
