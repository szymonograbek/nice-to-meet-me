import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "validation";

const app = express();

const server = http.createServer(app);
const port = 5001;

server.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);

const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, {}>(
  server,
  {
    cors: {
      origin: "*",
      // origin: process.env.ALLOWED_ORIGINS?.split(","),
    },
  }
);

io.on("connection", (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  socket.on("join", (roomName) => {
    const { rooms } = io.sockets.adapter;
    const room = rooms.get(roomName);

    // room == undefined when no such room exists.
    if (room === undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size === 1) {
      // room.size == 1 when one person is inside the room.
      socket.join(roomName);
      socket.emit("joined");
    } else {
      // when there are already two people inside the room.
      socket.emit("full");
    }
    console.log(rooms);
  });

  socket.on("ready", (roomName) => {
    socket.broadcast.to(roomName).emit("ready");
  });

  socket.on("ice-candidate", (candidate: RTCIceCandidate, roomName: string) => {
    socket.broadcast.to(roomName).emit("ice-candidate", candidate);
  });

  socket.on("offer", (offer, roomName) => {
    socket.broadcast.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.broadcast.to(roomName).emit("answer", answer);
  });

  socket.on("leave", (roomName) => {
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit("leave");
  });
});
