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
            select: "-__v -password createdAt",
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

      // ✅ Emit to the users involved in the chat
      // what it does is that it will emit the new chat to all users in the chat room,
      // so that they can receive the new chat in real-time without having to refresh the page
      // IMPORTANT: Access io from context! because io will be passed from the server to the context
      // when the user connects to the server, so that we can use it in the resolvers
      // without this, we cannot access io in the resolvers
      // const io = context.io;

      // if (io) {
      //   // Emit to the users involved in the chat
      //   for (const userId of users) {
      //     io.to(userId).emit("newChatRoom", chat); // notify the target users
      //     console.log(`from resolvers: New chat room created for user ${userId}`);
      //   }
      //   io.to(context.user._id).emit("newChatRoom", chat); // Also emit to creator
      //   console.log(
      //     `from resolvers: creator, New chat room created for user ${context.user._id}`
      //   );
      // } else {
      //   console.warn("No io instance in context, skipping emit");
      // }
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
      if (chat.groupAdmin.toString() !== context.user._id.toString()) {
        throw new AuthenticationError(
          "You are not authorized to delete this chat"
        );
      }
      // Delete the chat
      const deletedChat = await Chat.findByIdAndDelete(chatId);
      if (!deletedChat) {
        throw new Error("Chat not found");
      }
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
            io.to(userId.toString()).emit("newChatRoom", chat);
            console.log(`✅ Notified User ${userId} of new chat room.`);
          }
        }
      }

      return populatedMessage;
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
