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

    socket.on("client_text_update", (data: { text: string }) => {
      console.log(`recieveing ${data.text}`);
      socket.broadcast.emit("server_text_update", data);
    });
  }
}
