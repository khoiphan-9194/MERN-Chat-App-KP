module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    socket.on("joinChat", (chatId) => {
      if (typeof chatId !== "string") return;
      socket.join(chatId); // Join the chat room with the given chatId
      console.log(`✅ Socket ${socket.id} joined chat room: ${chatId}`);
    });


    // socket.on("setup") is used to set up the socket connection
    // it is used to listen for the "setup" event from the client
    // when the client creates a new chat with a user,
    socket.on("setupNewChat", (userData) => {
      if (!userData || !userData._id) return;
      socket.join(userData._id);
      console.log(`User ${userData.username} joined room ${userData._id}`);
      // Emit an event to notify that the user has joined their personal room
      io.to(userData._id).emit("userJoined", {
        _id: userData._id,
        username: userData.username,
      });

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







/*
so what it means between socket.on and io.emit



✅ Difference Between socket.on and io.emit (or socket.emit)
Concept	Purpose	Where Used
socket.on	Listen for an event sent by client or server.	On server or client
socket.emit	Send an event to the current socket/client.	Server or client
io.emit	Broadcast an event to all connected clients.	Server (only)
✅ 1. socket.on → Listen for Events

Used to listen for events:

// Server-side
socket.on("message", (data) => {
  console.log("Message received from client:", data);
});

    The client emits → Server listens using socket.on

✅ 2. socket.emit → Send to Current Socket Only

Used to send data back to just that specific connected client:

socket.emit("welcome", "Welcome to the server!");

    Only this specific client gets the event.

✅ 3. io.emit → Broadcast to All Connected Clients

Used to send an event to ALL clients (everyone):

io.emit("announcement", "A new user joined!");

    Every connected socket receives it.

✅ ✅ Example Together:

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  // Listen for message from THIS client
  socket.on("sendMessage", (data) => {
    console.log("Received:", data);

    // Send ONLY to this client:
    socket.emit("messageSent", "Your message was received.");

    // Broadcast to ALL connected clients:
    io.emit("newMessage", data);
  });
});

✅ Real-Life Chat Example:
Action	Method	Explanation
Client sends message	socket.emit	Client → Server (socket.on("sendMessage"))
Server receives message	socket.on	Server listens to "sendMessage"
Server replies to sender	socket.emit	Optional: only reply to this socket
Server notifies ALL clients	io.emit	Broadcast the new message to everyone
✅ Key Insight:

    socket → Specific connection (individual user)

    io → All connections (broadcasting)

    You usually use:

        socket.on to listen.

        socket.emit to reply to that socket.

        io.emit (or io.to(room).emit) to broadcast.


*/ 