import socketioJwt from "socketio-jwt";
import {
  Events,
  IChangeEventData,
  ICaretEventData,
  IClientJoinData,
  Logger,
  LogLevel,
  IUser,
  ISearchUsersData,
  ISearchUsersResults
} from "remarc-app-common";
import MarcsService from "../services/MarcsService";
import UsersService from "../services/UsersService";
import { Config } from "../config/serverConfig";

export default class ChangeHandler {
  private logger: Logger;
  private io: SocketIO.Server;
  private marcsService: MarcsService;
  private usersService: UsersService;

  constructor(
    io: SocketIO.Server,
    marcsService: MarcsService,
    usersService: UsersService,
    logger: Logger
  ) {
    this.logger = logger;
    this.onConnection = this.onConnection.bind(this);
    this.marcsService = marcsService;
    this.usersService = usersService;
    this.io = io;
  }

  public init(): void {
    this.io.use(
      socketioJwt.authorize({
        secret: Config.jwtSecret,
        decodedPropertyName: "currentUser",
        handshake: true
      })
    );

    this.io.on("connection", this.onConnection);
  }

  private onConnection(socket: SocketIO.Socket & { currentUser: IUser }) {
    this.logger.log(
      ChangeHandler.name,
      "New Connection",
      LogLevel.VERBOSE,
      socket.currentUser
    );

    socket.on(Events.CLIENT_JOIN_MARC, (data: IClientJoinData) => {
      socket.leaveAll();
      socket.join("room_" + data.marcId);

      this.logger.log(
        ChangeHandler.name,
        `Rooms`,
        LogLevel.VERBOSE,
        socket.adapter.rooms
      );
    });

    socket.on(Events.CLIENT_TEXT_UPDATE, (data: IChangeEventData) => {
      this.logger.log(
        ChangeHandler.name,
        `Recieving ${Events.CLIENT_TEXT_UPDATE}`,
        LogLevel.VERBOSE
      );
      try {
        this.marcsService.updateMarc(data).then(() => {
          socket
            .to("room_" + data.marcId)
            .emit(Events.SERVER_TEXT_UPDATE, data);
        });
      } catch (err) {
        this.logger.log(
          ChangeHandler.name,
          `Failed ${Events.CLIENT_TEXT_UPDATE}`,
          LogLevel.ERROR,
          err
        );
      }
    });

    socket.on(Events.CARET_POSITION_CHANGE, (data: ICaretEventData) => {
      socket.to("room_" + data.marcId).emit(Events.CARET_POSITION_CHANGE, data);
    });

    socket.on(Events.CLIENT_SEARCH_USERS, async (data: ISearchUsersData) => {
      let results = await this.usersService.findUsers(data.query);
      socket.emit(Events.SERVER_SEARCH_RESULTS, {
        results: results
      } as ISearchUsersResults);
    });
  }
}
