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



/*
socket.on("sendMessage", ({ chatId, messageData }) => {
  if (!chatId || !messageData) return;
  // The server **receives** a "sendMessage" event from a client
  // Then the server broadcasts the new message to everyone in the chat room as a "newMessage"
  io.to(chatId).emit("newMessage", messageData);
});

This means:

    Clients emit "sendMessage" when they want to send a new chat message to the server.

    The server listens for "sendMessage" events from clients.

    When the server receives a "sendMessage", it broadcasts a "newMessage" event with the message data to all clients in that chat room (including the sender).

Therefore, on the client side:

    You emit "sendMessage" to send a new message.

    You listen for "newMessage" to get notified when anyone (you or other users) sends a new message in that chat room.


    So, on the frontend:

    You cannot call io.to(...) — that’s only available on the server.

    You do call socket.on("newMessage", callback) to listen for new messages sent by the server.

    You call socket.emit("sendMessage", data) to send a message to the server.
*/ 