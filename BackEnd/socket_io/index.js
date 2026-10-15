const { Server } = require("socket.io");

const socketAuth = require("../socket_io/middleware");
const chatHandler = require("../socket_io/handlers/chat");
const personalchatHandler=require("../socket_io/handlers/personalChat")

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"],
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    console.log("User Connected")
    chatHandler(socket, io);
    personalchatHandler(socket,io)
  });

  return io;
};
