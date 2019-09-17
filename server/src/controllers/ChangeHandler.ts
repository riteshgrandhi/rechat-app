import {
  Events,
  IChangeEventData,
  ICaretEventData,
  IClientJoinData
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

    // this.io.sockets.emit("new_notification", {
    //   message: `You are connected!`
    // });

    // socket.join()

    socket.on(Events.CLIENT_JOIN_MARC, (data: IClientJoinData) => {
      socket.join("room_" + data.marcId);
      console.log(socket.adapter.rooms);
    });

    socket.on(Events.CLIENT_TEXT_UPDATE, (data: IChangeEventData) => {
      console.log(`recieveing ${data}`);
      // setTimeout(() => {
      socket.to("room_" + data.marcId).emit(Events.SERVER_TEXT_UPDATE, data);
      // }, 5000);
    });

    socket.on(Events.CARET_POSITION_CHANGE, (data: ICaretEventData) => {
      socket.to("room_" + data.marcId).emit(Events.CARET_POSITION_CHANGE, data);
    });
  }
}
