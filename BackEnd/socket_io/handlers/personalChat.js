module.exports = (socket, io) => {
  const userId = Number(socket.user.id);

  // Each authenticated user joins their own private room.
  const userRoom = `user:${userId}`;

  socket.join(userRoom);

  console.log("Socket connected:", socket.id);
  console.log("Authenticated user ID:", userId);
  console.log("User joined room:", userRoom);

  console.log(
    "Sockets in this user's room:",
    io.sockets.adapter.rooms.get(userRoom)?.size,
  );

  console.log(`${socket.user.username} joined private room: ${userRoom}`);

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(socket.user.username, "joined room: ", roomName);
  });

  socket.on("new-message", ({ message, roomName }) => {
    console.log("User ", socket.user.username, " said ", message);

    io.to(roomName).emit("new-message", {
      username: socket.user.username,
      message,
    });
  });
};
