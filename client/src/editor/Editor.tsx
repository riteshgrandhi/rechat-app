import React, { Fragment } from "react";
import io from "socket.io-client";
import styles from "../styles/app.module.scss";
import { RouteComponentProps, navigate } from "@reach/router";
import { Config } from "./../config/appConfig";
import {
  ICharOpSequence,
  CFRString,
  Events,
  ICaretEventData,
  IClientJoinData,
  IChangeEventData,
  IMarc,
  Logger,
  LogLevel
} from "@common";
import { Key } from "ts-keycode-enum";
import getCaretCoordinates from "textarea-caret";

interface IEditorState {
  document: string;
  floatingCarets: ICaretEventData[];
  isLoading: boolean;
}

interface IEditorProps
  extends RouteComponentProps<{ marcId: string; logger: Logger }> {}

class Editor extends React.Component<IEditorProps, IEditorState> {
  private logger: Logger;
  private socket: SocketIOClient.Socket;
  private CFRDocument: CFRString;
  private textareaElem: HTMLTextAreaElement;
  private caretPosition: number;

  constructor(props: IEditorProps) {
    super(props);

    this.textareaElem = {} as HTMLTextAreaElement;
    this.caretPosition = 0;

    let _level: LogLevel = LogLevel[Config.logLevel as keyof typeof LogLevel];
    this.logger = this.props.logger || new Logger(_level);
    this.checkCaret = this.checkCaret.bind(this);
    this.addCaretListeners = this.addCaretListeners.bind(this);
    this.onServerTextUpdate = this.onServerTextUpdate.bind(this);
    this.updateUserCarets = this.updateUserCarets.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.onCut = this.onCut.bind(this);
    this.socket = {} as SocketIOClient.Socket;
    this.CFRDocument = {} as CFRString;
    this.state = {
      document: "",
      floatingCarets: [],
      isLoading: true
    };
  }

  componentDidMount() {
    if (!this.props.marcId) {
      throw "Id Cannot be null";
    }
    this.getMarcById(this.props.marcId)
      .then((_marc: IMarc) => {
        this.CFRDocument = new CFRString(this.logger, _marc.document);
        this.setState(
          { isLoading: false, document: this.CFRDocument.getText() },
          () => {
            if (this.textareaElem) {
              this.textareaElem.selectionStart = this.state.document.length;
            }
            this.socket = io(Config.serverUrl, {
              // transports: ["websocket"]
            });
            this.initSocketListeners();
          }
        );
      })
      .catch(err => {
        navigate("/error", {
          state: {
            error: err,
            message: `Failed to Fetch Marc: ${this.props.marcId}`
          }
        });
      });
  }

  componentWillUnmount() {
    this.logger.log(Editor.name, "Disconnecting..", LogLevel.VERBOSE);
    if (this.socket.close) {
      this.socket.close();
    }
  }

  private initSocketListeners() {
    if (!this.props.marcId) {
      throw "Id Cannot be null";
    }
    this.socket.on("connect", (data: any) => {
      this.logger.log(Editor.name, "Connected", LogLevel.VERBOSE, data);
    });

    this.socket.on(Events.SERVER_TEXT_UPDATE, this.onServerTextUpdate);
    this.socket.on(Events.CARET_POSITION_CHANGE, this.updateUserCarets);

    let _joinData: IClientJoinData = {
      marcId: this.props.marcId
    };
    this.socket.emit(Events.CLIENT_JOIN_MARC, _joinData);
  }

  private async getMarcById(marcId: string): Promise<IMarc> {
    try {
      let res: { data: IMarc; error?: any } = await fetch(
        `${Config.serverUrl}/api/marcs/${marcId}`
      ).then(res => res.json());
      if (res.error) {
        throw res;
      }
      return res.data;
    } catch (ex) {
      this.logger.log(Editor.name, "Failed to fetch", LogLevel.ERROR, ex);
      throw ex;
    }
  }

  private onServerTextUpdate(data: IChangeEventData) {
    let opSequence: ICharOpSequence = data.opSequence;
    this.logger.log(
      Editor.name,
      Events.SERVER_TEXT_UPDATE,
      LogLevel.VERBOSE,
      opSequence
    );
    let currentSelection:
      | {
          start: number;
          end: number;
        }
      | undefined;

    if (this.textareaElem) {
      currentSelection = {
        start: this.textareaElem.selectionStart,
        end: this.textareaElem.selectionStart
      };
    }

    this.CFRDocument.applyOpSequence(opSequence, currentSelection);
    this.CFRDocument.print();

    if (this.textareaElem) {
      this.setState({ document: this.CFRDocument.getText() }, () => {
        if (currentSelection) {
          this.textareaElem.selectionStart = currentSelection.start;
          this.textareaElem.selectionEnd = currentSelection.end;
        }
      });
    }
  }

  private onKeyDown(e: React.KeyboardEvent) {
    if (
      (e.ctrlKey && (e.which == Key.Delete || e.which == Key.Backspace)) ||
      (e.ctrlKey && e.which == Key.Z)
    ) {
      e.preventDefault();
    }

    if (
      e.which == 0 ||
      (e.shiftKey && e.which == Key.Shift) ||
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
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

    if (!((e.ctrlKey && e.which == Key.V) || (e.ctrlKey && e.which == Key.X))) {
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
    this.sendOperationList(opSequence);
  }

  private onCut(e: React.ClipboardEvent) {
    let target = e.target as HTMLTextAreaElement;
    let _start = target.selectionStart;
    let _end = target.selectionEnd;

    if (_start == _end) {
      return;
    }

    let text: string;
    text = this.state.document.slice(_start, _end);
    let opSequence: ICharOpSequence = [];

    opSequence = this.CFRDocument.deleteString({
      text: text,
      userId: this.socket.id,
      globalPos: _start
    });

    this.CFRDocument.print();
    this.sendOperationList(opSequence);
  }

  private sendOperationList(opSequence: ICharOpSequence) {
    if (!this.props.marcId) {
      throw "Id Cannot be null";
    }
    this.logger.log(
      Editor.name,
      `Sending ${Events.CLIENT_TEXT_UPDATE}`,
      LogLevel.VERBOSE,
      opSequence
    );
    let data: IChangeEventData = {
      opSequence: opSequence,
      marcId: this.props.marcId
    };
    this.socket.emit(Events.CLIENT_TEXT_UPDATE, data);
  }

  private updateUserCarets(data: ICaretEventData) {
    let _carets = this.state.floatingCarets;
    let i = _carets.findIndex(c => c.userId == data.userId);
    if (i >= 0) {
      _carets[i].caret = data.caret;
    } else {
      _carets.push(data);
    }
    this.setState({ floatingCarets: _carets });
  }

  private checkCaret() {
    if (!this.props.marcId) {
      throw "Id Cannot be null";
    }
    const newPos = this.textareaElem.selectionStart;
    if (newPos !== this.caretPosition) {
      this.caretPosition = newPos;
      let caretCoordinates = getCaretCoordinates(
        this.textareaElem,
        this.caretPosition //,
        // {
        //   debug: true
        // }
      );
      let data: ICaretEventData = {
        marcId: this.props.marcId,
        userId: this.socket.id,
        caret: caretCoordinates
      };
      this.logger.log(
        Editor.name,
        `Caret change to ${newPos}`,
        LogLevel.VERBOSE,
        caretCoordinates
      );
      this.socket.emit(Events.CARET_POSITION_CHANGE, data);
    }
  }

  private addCaretListeners() {
    this.textareaElem.addEventListener("keypress", this.checkCaret); // Every character written
    // this.textareaElem.addEventListener("mousedown", this.checkCaret); // Click down
    // this.textareaElem.addEventListener("touchstart", this.checkCaret); // Mobile
    this.textareaElem.addEventListener("input", this.checkCaret); // Other input events
    this.textareaElem.addEventListener("paste", this.checkCaret); // Clipboard actions
    this.textareaElem.addEventListener("cut", this.checkCaret);
    // this.textareaElem.addEventListener("mousemove", this.checkCaret); // Selection, dragging text
    // this.textareaElem.addEventListener("select", this.checkCaret); // Some browsers support this event
    // this.textareaElem.addEventListener("selectstart", this.checkCaret); // Some browsers support this event
  }

  render() {
    return (
      <Fragment>
        {!this.state.isLoading && (
          <div className={styles.app}>
            <div className={styles.editor}>
              {this.state.floatingCarets.map(userCaret => (
                <span
                  style={{
                    position: "absolute",
                    left: this.textareaElem.offsetLeft + userCaret.caret.left,
                    top: this.textareaElem.offsetTop + userCaret.caret.top + 20,
                    backgroundColor: "black"
                  }}
                >
                  {userCaret.userId}
                </span>
              ))}
              <textarea
                className={styles.textarea}
                value={this.state.document}
                onChange={e => this.setState({ document: e.target.value })}
                onKeyDown={this.onKeyDown}
                onPaste={this.onPaste}
                onCut={this.onCut}
                ref={(e: HTMLTextAreaElement) => {
                  this.textareaElem = e;
                  if (this.textareaElem) {
                    this.addCaretListeners();
                    // if (document.activeElement != this.textareaElem) {
                    //   this.textareaElem.focus();
                    // }
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default Editor;
