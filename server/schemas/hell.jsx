const { User } = require("../models");

    createChat: async (parent, { chat_name, users }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to create a chat"
        );
      }

      if (!chat_name || !users || users.length === 0) {
        throw new Error("Chat name and users are required to create a chat");
      }

      // Validate user IDs
      for (const userId of users) {
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid user ID format");
        }
      }

      // Check if a one-on-one chat already exists with the same users
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [context.user._id, ...users], $size: users.length + 1 },
      }); // syntax{$all and $size} is from MongoDB query language
      // this means that,
      // first, $all will check if the chat contains all the users in the array,
      // and then $size will check if the number of users in the chat is equal to the number of users in the array plus the current user.

      if (existingChat) {
        return existingChat;
      }

      // Create a new chat
      const chat = await Chat.create({
        chat_name,
        isGroupChat: false,
        users: [context.user._id],
        groupAdmin: context.user._id,
      });

     
      return chat;
    },

  

    updateChat: async ( parent, { chatId, chat_name, users }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update a chat"
        );
      }
      if (!chatId?.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid chat ID format");
      }
      if (!chat_name && (!users || users.length === 0)) {
        throw new Error("At least one field (chat_name or users) is required to update a chat");
      }

      // Find the chat to update
      const Update_chat = await Chat.findById(chatId);
      if (!Update_chat) {
        throw new Error("Chat not found");
      }

      // Check if the user is the group admin
      if (Update_chat.groupAdmin.toString() !== context.user._id.toString()) {
        throw new AuthenticationError("You are not authorized to update this chat");
      }

      // Update the chat
      Update_chat.chat_name = chat_name || Update_chat.chat_name;
      Update_chat.users = users || Update_chat.users;

      await Update_chat.save();

      return Update_chat;
    },

    addMessage: async (parent, { chatId, message_content }, context) => {
      const { user, io } = context;

      // 1. Authentication check
      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to send a message."
        );
      }

      // 2. Input validation
      if (!chatId?.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid chat ID format.");
      }
      if (!message_content || message_content.trim() === "") {
        throw new Error("Message content cannot be empty.");
      }

      // Optional: Limit message length
      if (message_content.length > 1000) {
        throw new Error(
          "Message is too long. Maximum 1000 characters allowed."
        );
      }

      // 3. Chat existence and permission check
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found.");
      }
      if (!chat.users.includes(user._id)) {
        throw new Error("You are not a member of this chat.");
      }

      // 4. Check if it's the first message in the chat
      const isFirstMessage = !chat.latestMessage;

      // 5. Save the new message
      const message = await Message.create({
        message_sender: user._id,
        message_content: message_content.trim(),
        chatRoom: chatId,
      });

      // 6. Update the chat's latest message
        chat.latestMessage = message._id;
        
        if( isFirstMessage && chat.users.length === 1) {
          await Chat.updateOne({ _id: chatId }, 
{ $set: { users: [...chat.users, user._id] } }
          );
        }

        

      await chat.save();

      // 7. Populate message sender info
      const populatedMessage = await message.populate(
        "message_sender",
        "username"
      );

      // 8. Emit the new message to the chat room
      io.to(chatId).emit("newMessage", {
        _id: populatedMessage._id,
        chatId,
        message_content: populatedMessage.message_content,
        message_sender: {
          _id: populatedMessage.message_sender._id,
          username: populatedMessage.message_sender.username,
        },
        createdAt: populatedMessage.createdAt,
      });

      console.log(`✅ New message sent to chat ${chatId}:`, populatedMessage);

      // 9. If first message, notify other users of new chat room
      if (isFirstMessage) {
        for (const userId of chat.users) {
          if (userId.toString() !== user._id.toString()) {
            io.to(userId.toString()).emit("newChatRoom", chat);
            console.log(`✅ Notified User ${userId} of new chat room.`);
          }
        }
      }

      return populatedMessage;
},
        