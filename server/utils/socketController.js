module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    socket.on("joinChat", (chatId) => {
      if (typeof chatId !== "string") return;
      socket.join(chatId); // Join the chat room with the given chatId
      console.log(`✅ Socket ${socket.id} joined chat room: ${chatId}`);
    });

    //socket.on ("sendMessaage") plays a role that
    // when a message is sent from the client,
    // it will emit the "newMessage" event to all clients in the chat room
    // in this case io.to(chatId) means that it will emit the event to all clients in the chat room with the given chatId
    socket.on("sendMessage", ({ chatId, messageData }) => {
      if (!chatId || !messageData) return;
      // Emit the new message to all clients in the chat room
      io.to(chatId).emit("newMessage", messageData);
      console.log(`✅ New message to chat ${chatId}:`, messageData);
    });

    socket.on("disconnect", (reason) => {
      // this event means that if the client disconnects, it will log the reason

      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};
