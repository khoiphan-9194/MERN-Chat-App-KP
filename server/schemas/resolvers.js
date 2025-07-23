
const { User, Chat, Message } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    users: async () => {
      return User.find().select("-__v -password");
    },

    user: async (parent, { userId }) => {
      if (!userId) {
        throw new Error("User ID is required to fetch user details");
      }
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid user ID format");
      }
      // Validate user ID
      const user = await User.findById(userId).select("-__v -password");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },

    chats: async () => {
      return Chat.find()
        .populate("users", "-__v -password")
        .populate({
          path: "latestMessage",
          populate: {
            path: "message_sender",
            select: "-__v -password",
          },
        });
    },

    chatsByUser: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to view chats");
      }
      // we will return all chats that the user is part of
      // and that the user can see (userVisibility is true)
      // this will ensure that the user can only see chats that they are part of and that
      // they have visibility to, preventing them from seeing chats they are not part of
      // and that they have visibility to
      // this is important because we want to ensure that the user can only see chats that they
      // are part of and that they have visibility to, preventing them from seeing chats they are not part of
      // and that they have visibility to
      return Chat.find({
        users: context.user._id,
        [`userVisibility.${context.user._id}`]: true,
      }) // Only show chat if it's visible to the user
        .populate("users", "-__v -password")
        .populate({
          path: "latestMessage",
          populate: {
            select: "-__v -password createdAt isSeen message_content",
            path: "message_sender",
            select: "-__v -password",
          },
        });
    },

    chat: async (parent, { _id }) => {
      return Chat.findById(_id)
        .populate("users", "-__v -password")
        .populate("latestMessage");
    },

    messages: async (_, { chatId }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to view messages"
        );
      }
      if (!chatId) {
        throw new Error("Chat ID is required to fetch messages");
      }
      if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid chat ID format");
      }
      // Validate chat ID
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      // Check if the user is part of the chat
      // To ensure that the .includes check works correctly with Mongoose ObjectIds,
      // convert both chat.users and context.user._id to strings before comparison.
      if (
        !chat.users
          .map((u) => u.toString())
          .includes(context.user._id.toString())
      ) {
        throw new Error("You are not a member of this chat");
      }
      return Message.find({ chatRoom: chatId })
        .populate({
          path: "message_sender",
          select: "-__v -password",
        })
        .populate({
          path: "chatRoom",
          select: "-__v",
          populate: [
            {
              path: "users",
              select: "-__v -password",
            },
            {
              path: "latestMessage",
              select: "-__v",
            },
          ],
        });
    },
  },
  Mutation: {
    addUser: async (
      parent,
      { username, user_email, password, profile_picture }
    ) => {
      const user = await User.create({
        username,
        user_email,
        password,
        profile_picture,
      });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { user_email, password }) => {
      const user = await User.findOne({ user_email });
      if (!user) {
        throw new AuthenticationError(
          "No user found with this user_email address"
        );
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }

      const token = signToken(user);

      return { token, user };
    },
    updateUser: async (
      _,
      { _id, username, user_email, password, profile_picture },
      context
    ) => {
      if (!context.user || context.user._id.toString() !== _id) {
        throw new AuthenticationError("You can only update your own profile");
      }

      const update_user = await User.findByIdAndUpdate(
        _id,
        { username, user_email, password, profile_picture },
        { new: true, runValidators: true }
      ).select("-__v -password");
      if (!update_user) {
        throw new Error("User not found");
      }
      return update_user;
    },

    verifyCurrentUserPassword: async (
      parent,
      { userId, currentPassword },
      context
    ) => {
      if (context.user) {
        const user = await User.findById(userId);
        if (!user) {
          throw new AuthenticationError();
        }
        const isValid = await user.isCorrectPassword(currentPassword);
        if (!isValid) {
          return false;
        }
        return true;
      }

      throw new AuthenticationError();
    },

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

      // Initialize userVisibility map: creator sees it, others do not
      // because we want to ensure that the creator of the chat can see the chat, not the other users
      // and the other users will not see the chat until a message is sent
      const userVisibility = new Map(); // will create an empty map
      userVisibility.set(context.user._id.toString(), true); //set the creator's visibility to true, that means the creator can see the chat
      for (const userId of users) {
        // the rest of the users will not see the chat until it is true ( message is sent)
        userVisibility.set(userId.toString(), false);
      }

      const chat = await Chat.create({
        chat_name,
        isGroupChat: false,
        users: [context.user._id, ...users],
        groupAdmin: context.user._id,
        userVisibility,
      });

      return chat;
    },

    deleteChat: async (parent, { chatId }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to delete a chat"
        );
      }
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }
      // if (chat.groupAdmin.toString() !== context.user._id.toString()) {
      //   throw new AuthenticationError(
      //     "You are not authorized to delete this chat"
      //   );
      // }

      if (chat.userVisibility.get(context.user._id.toString()) !== true) {
        throw new AuthenticationError(
          "You are not authorized to delete this chat"
        );
      } // means that the user must be part of the chat and have visibility to true to delete it
      // before deleting the chat, we need to delete all messages in the chat
      await Message.deleteMany({ chatRoom: chatId }); // Delete all messages associated with the chat
      // Now delete the chat itself
      const deletedChat = await Chat.findByIdAndDelete(chatId);
      if (!deletedChat) {
        throw new Error("Chat not found");
      }
      // Emit to all users in the chat that the chat has been deleted
    },

    updateChat: async (parent, { chatId, chat_name, users }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update a chat"
        );
      }
      if (!chatId?.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid chat ID format");
      }
      if (!chat_name && (!users || users.length === 0)) {
        throw new Error(
          "At least one field (chat_name or users) is required to update a chat"
        );
      }

      // Find the chat to update
      const Update_chat = await Chat.findById(chatId);
      if (!Update_chat) {
        throw new Error("Chat not found");
      }

      // Check if the user is the group admin
      if (Update_chat.groupAdmin.toString() !== context.user._id.toString()) {
        throw new AuthenticationError(
          "You are not authorized to update this chat"
        );
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
      /*
      const isFirstMessage = !chat.latestMessage;
      will set isFirstMessage to:
      true → if there are no messages yet in the chat.
      false → if there's already a previous message.

      !chat.latestMessage:
      chat.latestMessage	      !chat.latestMessage	                     What it means
      null or undefined	              true	                  No messages yet – this is the first message
      message ID (truthy)	            false	                  There is already at least one message
       */
      const isFirstMessage = !chat.latestMessage;

      // 5. Save the new message
      const message = await Message.create({
        message_sender: user._id,
        message_content: message_content.trim(),
        chatRoom: chatId,
        // isSeen: false, // Default to false, meaning the message is not seen
      });

      // 6. Update the chat's latest message
      chat.latestMessage = message._id;

      /*
      ✅ if (isFirstMessage)
      This code only runs if it's the first message ever sent in the chat.

      🔁 for (const userId of chat.users)
      Iterates over all users in the chat, including the sender and the receiver(s).

      🚫 if (userId.toString() !== user._id.toString())
      Skips the current sender (the one sending the first message), because they already have visibility.

      ✅ chat.userVisibility.set(userId.toString(), true);
      Updates the userVisibility map to make the chat visible to the other user(s) in the chat (e.g., user B).
      So now user B will see the chat in their chat list.
      
      📦 Final Result:
      If user A starts a chat with user B, initially only user A sees it. 
      But after the first message is sent, this code sets:

      chat.userVisibility = {
              "userA": true,
              "userB": true,
                };
    Now both A and B see the chat.
      */

      if (isFirstMessage) {
        for (const userId of chat.users) {
          if (userId.toString() !== user._id.toString()) {
            chat.userVisibility.set(userId.toString(), true);
          }
        }
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
      // ✅ Emit to the users involved in the chat
      // what it does is that it will emit the new chat to all users in the chat room,
      // so that they can receive the new chat in real-time without having to refresh the page

      if (isFirstMessage) {
        for (const userId of chat.users) {
          if (userId.toString() !== user._id.toString()) {
            io.to(userId.toString()).emit("notifyNewChatRoom", chat);
            io.to(userId.toString()).emit("messageReceived", {
              chatId,
              messageData: populatedMessage,
            });
            console.log(
              `✅ Notified User ${userId} of new chat room and first message.`
            );
          }
        }
      }

      // ✅ Also emit a messageReceived event (same data) for notification purposes
      // This sends an event from the frontend (client) to the backend (server) over a WebSocket connection.
      // It’s like saying: "Hey server! I’ve just sent a message in this chat. Let others know."
      io.to(chatId).emit("messageReceived", {
        chatId,
        messageData: populatedMessage,
      });

      console.log(`✅ Socket emitted messageReceived for chat ${chatId}`);

      return populatedMessage;
    },
    update_MessageAsSeen: async (_, { messageId }, context) => {
      const { user } = context;
      if (!user) throw new AuthenticationError("Not logged in");

      const message = await Message.findById(messageId);
      if (!message) throw new Error("Message not found");

      const chat = await Chat.findById(message.chatRoom);
      if (!chat) throw new Error("Chat not found");

      const isSender =message.message_sender.toString() === user._id.toString();
      const isParticipant = chat.users.some(
        (id) => id.toString() === user._id.toString()
      ); // Check if the user is part of the chat

      if (!isParticipant || isSender) {
        throw new Error("Only the recipient can mark this message as seen.");
      }

      message.isSeen = true;
      await message.save();

      return message;
    },

    //  markMessageAsSeen(messageId: ID!): Boolean
    // it will return true or false depending on whether the message was marked as seen or not
    markMessageAsSeen: async (_, { messageId }, context) => {
      const { user } = context;
      if (!user) throw new AuthenticationError("Not logged in");
       const message = await Message.findById(messageId);
      if (!message) throw new Error("Message not found");
      if (message.isSeen) //
      {
        return false; // If true, we skip updating and return false to indicate no change was made.
      }
      //If it was not previously seen, set isSeen = true.
      // Save the updated message back to the database.
      message.isSeen = true;
      await message.save();
      return true; // Successfully marked as seen

    },
      
    isOnlineUser: async (_, { userId, isOnline }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to check online status"
        );
      }
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid user ID format");
      }

      return await User.findByIdAndUpdate(userId, { isOnline }, { new: true });
    },

    markUserOnline: async (_, { userId }, context) => {
      if (!context.user || context.user._id !== userId) {
        throw new AuthenticationError("Unauthorized.");
      }
      return await User.findByIdAndUpdate(
        userId,
        { isOnline: true },
        { new: true }
      );
    },

    markUserOffline: async (_, { userId }, context) => {
      if (!context.user || context.user._id !== userId) {
        throw new AuthenticationError("Unauthorized.");
      }
      return await User.findByIdAndUpdate(
        userId,
        { isOnline: false },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;

/*
const userVisibility = new Map(); // will create an empty map
userVisibility.set(context.user._id.toString(), true);
for (const userId of users) {
  userVisibility.set(userId.toString(), false);
}

🔍 Explanation:
✅ const userVisibility = new Map();

    This creates an empty Map object.

    You’ll use this to store visibility status for each user in the chat.

✅ userVisibility.set(context.user._id.toString(), true);

    Sets visibility to true for the chat creator (the logged-in user).

    Why? Because the creator should always be able to see the chat right away.

✅ for (const userId of users) { ... }

    This loop goes through all the other users you're adding to the chat (usually just 1 other user for one-on-one chats).

Inside the loop:

userVisibility.set(userId.toString(), false);

    It sets visibility to false for each of the other users in the chat.

    Why? So that the chat doesn't show up in their chat list yet — until a message is sent.

💡 Example:

Suppose:

    context.user._id = "123" (this is you)

    users = ["456", "789"] (you’re creating a group chat with two other users)

After running the code:

userVisibility = {
  "123": true,   // You can see the chat
  "456": false,  // These users can't yet
  "789": false
}

🔚 Why it's useful:

    Ensures a private chat isn’t visible to others until interaction happens.

    Prevents confusion for users receiving random empty chats.

    Keeps your UI clean and intentional — no chat appears unless there's context (like a message).

*/
