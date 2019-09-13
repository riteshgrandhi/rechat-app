import {
  Events,
  ICharOpSequence,
  CFRString,
  ICaretEventData
} from "remarc-app-common";

export default class ChangeHandler {
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server) {
    this.onConnection = this.onConnection.bind(this);
    this.io = io;
  }

  public init(): void {
    this.io.on("connection", this.onConnection);
  }

  private onConnection(socket: SocketIO.Socket) {
    console.log("New Connection Estabished!" + socket.id);
    this.io.sockets.emit("new_notification", {
      message: `You are connected!`
    });

    socket.on(Events.CLIENT_TEXT_UPDATE, (data: ICharOpSequence) => {
      console.log(`recieveing ${data}`);
      // doc.convertFromString({ text: "hello", userId: socket.id });
      // setTimeout(() => {
      socket.broadcast.emit(Events.SERVER_TEXT_UPDATE, data);
      // }, 5000);
    });

    socket.on(Events.CARET_POSITION_CHANGE, (data: ICaretEventData) => {
      socket.broadcast.emit(Events.CARET_POSITION_CHANGE, data);
    });
  }
}
