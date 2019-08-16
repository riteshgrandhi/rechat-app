import React from "react";
import io from "socket.io-client";
import styles from "./app.module.scss";
import { InfoPanel } from "./InfoPanel";
import { RouteComponentProps } from "@reach/router";
import {
  TextOpService,
  IOpSequence,
  Events,
  OpType,
  ITextOp
} from "remarc-app-common";
import { Key } from "ts-keycode-enum";

interface IEditorState {
  title: string;
  document: string;
}

interface IEditorProps extends RouteComponentProps {}

class Editor extends React.Component<IEditorProps, IEditorState> {
  private socket: SocketIOClient.Socket;

  constructor(props: IEditorProps) {
    super(props);

    this.state = {
      title: "",
      document: ""
    };

    this.onServerTextUpdate = this.onServerTextUpdate.bind(this);
    // this.onTextChangeEvent = this.onTextChangeEvent.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.socket = io();
    this.initSocketListeners();
  }

  private initSocketListeners() {
    this.socket.on("new_notification", (data: any) => {
      console.log(data);
    });

    this.socket.on(Events.SERVER_TEXT_UPDATE, this.onServerTextUpdate);
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

  onServerTextUpdate(data: IOpSequence) {
    console.log(`recieving "${data}" from server`);
    // this.setState({ document: data.text });
  }

  // private onSelfTextUpdate(updatedText: string) {
  //   console.log(`sending "${updatedText}" to server`);
  //   var ops: IOpSequence = {
  //     opList: [
  //       {
  //         type: OpType.DELETE,
  //         text: "xyz",
  //         position: 2
  //       },
  //       {
  //         type: OpType.ADD,
  //         text: "1234",
  //         position: 2
  //       }
  //     ],
  //     id: "1"
  //   };
  //   // var textOpService: TextOpService = new TextOpService();
  //   // var newText = textOpService.performOpsOnText("abcdefs", ops);

  //   this.socket.emit(Events.CLIENT_TEXT_UPDATE, ops);
  // }

  // private onTextChangeEvent(event: React.ChangeEvent<HTMLTextAreaElement>) {
  //   var val = (event.target as HTMLTextAreaElement).value;
  //   var textOpService: TextOpService = new TextOpService();

  //   console.log(event.target.selectionStart);
  //   console.log(event.target.selectionEnd);
  //   this.setState({ document: val });
  //   this.onSelfTextUpdate(val);
  // }

  private onKeyDown(e: React.KeyboardEvent) {
    if (
      (e.ctrlKey && (e.which == Key.Delete || e.which == Key.Backspace)) ||
      (e.ctrlKey && e.which == Key.Z)
    ) {
      e.preventDefault();
    }

    if (
      e.which == 0 ||
      e.shiftKey ||
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
      e.which == Key.F12
    ) {
      return false;
    }

    var text: string;
    var val = this.state.document;
    var target = e.target as HTMLTextAreaElement;

    var _start = target.selectionStart;
    var _end = target.selectionEnd;

    var op: ITextOp[] = [];

    if (!(e.ctrlKey && e.which == Key.V)) {
      switch (e.which) {
        case Key.Backspace: {
          text = val.slice(_start == _end ? _start - 1 : _start, _end);
          op.push({ type: OpType.DELETE, position: _start, text: text });
          break;
        }
        case Key.Delete: {
          text = val.slice(_start, _start == _end ? _end + 1 : _end);
          op.push({ type: OpType.DELETE, position: _start, text: text });
          break;
        }
        default: {
          if (_start != _end) {
            text = val.slice(_start, _end);
            op.push({ type: OpType.DELETE, position: _start, text: text });
          }
          text = e.key;
          op.push({ type: OpType.ADD, position: _start, text: text });
        }
      }
      if (text) {
        console.log(text, _start, _end, op);
      }
    }
  }

  private onPaste(e: React.ClipboardEvent) {
    var text: string;

    var val = this.state.document;
    var target = e.target as HTMLTextAreaElement;

    var _start = target.selectionStart;
    var _end = target.selectionEnd;
    var op: ITextOp[] = [];

    if (_start != _end) {
      text = val.slice(_start, _end);
      op.push({ type: OpType.DELETE, position: _start, text: text });
    }
    text = e.clipboardData.getData("text/plain");
    op.push({ type: OpType.ADD, position: _start, text: text });
    console.log(op);
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
