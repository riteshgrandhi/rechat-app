import ChatServer from "./ChatServer";

// create server
const server: ChatServer = new ChatServer(3001);

// start server
server.start();
