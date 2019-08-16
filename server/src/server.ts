import CommServer from "./CommServer";

// create server
const server: CommServer = new CommServer(3001);

// start server
server.start();
