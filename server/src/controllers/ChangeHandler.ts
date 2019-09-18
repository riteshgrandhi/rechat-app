import {
  Events,
  IChangeEventData,
  ICaretEventData,
  IClientJoinData
} from "remarc-app-common";
import MarcsService from "../services/MarcsService";

export default class ChangeHandler {
  private io: SocketIO.Server;
  private marcsService: MarcsService;

  constructor(io: SocketIO.Server, marcsService: MarcsService) {
    this.onConnection = this.onConnection.bind(this);
    this.marcsService = marcsService;
    this.io = io;
  }

  public init(): void {
    this.io.on("connection", this.onConnection);
  }

  private onConnection(socket: SocketIO.Socket) {
    console.log("New Connection: " + socket.id);

    // this.io.sockets.emit("new_notification", {
    //   message: `You are connected!`
    // });

    // socket.join()

    socket.on(Events.CLIENT_JOIN_MARC, (data: IClientJoinData) => {
      socket.leaveAll();
      socket.join("room_" + data.marcId);
      console.log("---------------------------");
      for (let room in socket.adapter.rooms) {
        console.log("Room:" + room);
        console.log(socket.adapter.rooms[room].sockets);
      }
      console.log("---------------------------");
    });

    socket.on(Events.CLIENT_TEXT_UPDATE, (data: IChangeEventData) => {
      console.log(`recieveing ${Events.CLIENT_TEXT_UPDATE}`);
      try {
        this.marcsService.updateMarc(data);
        socket.to("room_" + data.marcId).emit(Events.SERVER_TEXT_UPDATE, data);
      } catch (ex) {
        console.log(`failed at ${Events.CLIENT_TEXT_UPDATE}`);
        console.log(ex);
      }
    });

    socket.on(Events.CARET_POSITION_CHANGE, (data: ICaretEventData) => {
      socket.to("room_" + data.marcId).emit(Events.CARET_POSITION_CHANGE, data);
    });
  }
}
