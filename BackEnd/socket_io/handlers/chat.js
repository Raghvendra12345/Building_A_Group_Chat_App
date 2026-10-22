module.exports = (socket, io) => {
  console.log("User Connected ", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("User ", socket.user.username, "said: ", data.message);

  

    socket.broadcast.emit("receiveMessage", data);
  });

  // NEW: Group typing indicator
  socket.on("groupTyping", (data) => {
    socket.broadcast.emit("groupTyping", {
      userId: Number(socket.user.id),
      username: socket.user.username,
      isTyping: Boolean(data?.isTyping),
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected ", socket.id);
  });
};
