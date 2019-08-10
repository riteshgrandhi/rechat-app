import * as Common from "remarc-app-common";

export default class ChatHandler {
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server) {
    this.onConnection = this.onConnection.bind(this);
    this.io = io;
    this.io.on("connection", this.onConnection);
  }

  private onConnection(socket: SocketIO.Socket) {
    console.log("New Connection Estabished!");
    this.io.sockets.emit("new_notification", {
      message: `You are connected!`
    });

    socket.on(Common.Events.CLIENT_TEXT_UPDATE, (data: Common.IOpSequence) => {
      console.log(`recieveing ${data}`);
      socket.broadcast.emit(Common.Events.SERVER_TEXT_UPDATE, data);
    });
  }
}
