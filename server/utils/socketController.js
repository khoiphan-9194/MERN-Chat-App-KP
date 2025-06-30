module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    socket.on("joinChat", (chatId) => {
      if (typeof chatId !== "string") return;
      socket.join(chatId);
      console.log(`✅ Socket ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on("sendMessage", ({ chatId, messageData }) => {
      if (!chatId || !messageData) return;
      io.to(chatId).emit("newMessage", messageData);
      console.log(`✅ New message to chat ${chatId}:`, messageData);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};
