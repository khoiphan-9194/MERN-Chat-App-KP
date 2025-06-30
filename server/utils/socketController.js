module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // ✅ Client joins a specific chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`✅ Socket ${socket.id} joined chat room: ${chatId}`);
    });

    // ✅ Handle new message sent from client
    socket.on("sendMessage", ({ chatId, messageData }) => {
      console.log(`✅ New message to chat ${chatId}:`, messageData);

      // ✅ Broadcast to ALL users in the chat room, including sender
      io.to(chatId).emit("newMessage", messageData);
    });

    // ✅ Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};
