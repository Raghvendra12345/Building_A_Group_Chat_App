const onlineUsers = new Map();

module.exports = (socket, io) => {
  const userId = Number(socket.user.id);

  // Track this user's active socket connections
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);

  // Send the current online-user list to the newly connected socket
  socket.emit(
    "onlineUsers",
    Array.from(onlineUsers.keys()).map((id) => Number(id)),
  );

  console.log(`User ${userId} is online`);

  io.emit("userStatus", {
    userId,
    username: socket.user.username,
    isOnline: true,
  });

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

  // NEW: Handle private-chat typing indicators.
  socket.on("privateTyping", (data) => {
    const receiverId = Number(data?.receiverId);

    if (
      !Number.isInteger(receiverId) ||
      receiverId <= 0 ||
      receiverId === userId
    ) {
      return;
    }

    // Send only to the intended recipient's private room.
    io.to(`user:${receiverId}`).emit("privateTyping", {
      senderId: userId,
      isTyping: Boolean(data.isTyping),
    });
  });
  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(socket.id);

      // Mark offline only when all tabs/devices disconnect
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} is offline`);
        io.emit("userStatus", {
          userId,
          username: socket.user.username,
          isOnline: false,
        });
      }
    }
  });
};
