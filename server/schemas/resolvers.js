

const {User, Chat, Message} = require('../models');
const auth = require('../utils/auth');

const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find().select("-__v -password");
    },
    user: async (parent, { _id }) => {
      return User.findById(_id).select("-__v -password");
    },
    chats: async () => {
      return Chat.find()
        .populate("users", "-__v -password")
        .populate("latestMessage");
    },

    chatsByUser: async (parent, { userId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to view chats");
      }
      return Chat.find({ users: context.user._id })
        .populate("users", "-__v -password")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
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
      if (!chat.users.includes(context.user._id)) {
        throw new Error("You are not a member of this chat");
      }
      return Message.find({ chat: chatId })
        .populate("sender", "-__v -password")
        .populate({
          path: "chat",
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
        })
        
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }
      const token = signToken(user);
      return { token, user };
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

      // Create a new chat
      const chat = await Chat.create({
        chat_name,
        isGroupChat: false,
        users: [context.user._id, ...users],
        groupAdmin: context.user._id,
      });
      return chat;
    },

    addMessage: async (parent, { chatId, content }, context) => {
      const { user, io } = context; 

      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to send a message"
        );
      }

      if (!chatId || !content) {
        throw new Error("Chat ID and content are required to send a message");
      }

      if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid chat ID format");
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      if (!chat.users.includes(user._id)) {
        throw new Error("You are not a member of this chat");
      }

      // ✅ Save the new message
      const message = await Message.create({
        sender: user._id,
        content,
        chat: chatId,
      });

      // ✅ Update latest message in chat
      chat.latestMessage = message._id;
      await chat.save();

      // ✅ Populate sender info for real-time clients
      const populatedMessage = await message.populate("sender", "username");

      // ✅ Emit newMessage to this chat room

      // why do we need to use io here?
      // Because we need to send the new message to all clients in the chat room
      // for example, if a user sends a new message from a chat room,
      // resolvers will handle the logic to save the message to the database,
      // and then emit the newMessage event to all clients in the chat room
      // so that they can receive the new message in real-time without having to refresh the page
      // do we have to use io.to(chatId).emit("newMessage", ...) in frontend?
      io.to(chatId).emit("newMessage", {
        _id: populatedMessage._id,
        chatId,
        content: populatedMessage.content,
        sender: {
          _id: populatedMessage.sender._id,
          username: populatedMessage.sender.username,
        },
        createdAt: populatedMessage.createdAt,
      });
      console.log(
        `✅ Resolver New message sent to chat ${chatId}:`,
        populatedMessage
      );

      return populatedMessage;
    },
  },
};

 




 module.exports = resolvers;