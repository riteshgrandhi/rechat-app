export default class ChatHandler {
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server) {
    this.onConnection = this.onConnection.bind(this);
    this.io = io;
    this.io.on("connection", this.onConnection);
  }

  public onConnection(socket: SocketIO.Socket) {
    console.log("New Connection Estabished!");
    var i = 0;
    setInterval(() => {
      this.io.sockets.emit("new_notification", {
        message: `You have been connected: ${i++} seconds ago`
      });
    }, 1000);
  }
}
