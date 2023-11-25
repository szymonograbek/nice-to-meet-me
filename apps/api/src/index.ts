import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "validation";
import { ExpressPeerServer } from "peer";

const app = express();

const server = http.createServer(app);
const port = parseInt(process.env.API_PORT ?? "8080", 10);

const peerServer = ExpressPeerServer(server);

server.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

app.use("/peer-server", peerServer);

const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, {}>(
  server,
  {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(","),
    },
  }
);

io.on("connection", (socket) => {
  socket.on("join", (roomName, peerId) => {
    const { rooms } = io.sockets.adapter;
    const room = rooms.get(roomName);

    // room == undefined when the room doesn't exist
    if (room === undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size === 1) {
      // room.size == 1 when one person is inside the room
      socket.join(roomName);
      socket.broadcast.to(roomName).emit("userJoined", peerId);
    } else {
      // when there are already two people inside the room.
      socket.emit("full");
    }
  });
});
