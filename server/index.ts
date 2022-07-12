import http from "http";
import express from "express";
import cors from "cors";
import { Server, LobbyRoom } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { RoomType } from "../server/types/Rooms";

// import socialRoutes from "@colyseus/social/express"

import { Office } from "../server/server/rooms/Office";

const port = Number(process.env.PORT || 3001);
const app = express();

app.use(cors());
app.use(express.json());
// app.use(express.static('dist'))

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom);
gameServer.define(RoomType.PUBLIC, Office, {
  name: "Public Lobby",
  description:
    "For making friends and familiarizing yourself with the controls",
  password: null,
  autoDispose: false,
});
gameServer.define(RoomType.CUSTOM, Office).enableRealtimeListing();

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
