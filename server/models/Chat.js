const { Schema, model } = require("mongoose");
const chatSchema = new Schema(
  {
    chat_name: {
      type: String,
      required: true,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [ // this will be used to store the users in the chat
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // this will be used to store the latest message in the chat
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    //
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    wasSeen: {
      type: Boolean,
      default: false, // default to false, chat is not seen
    },
    
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }

);





const Chat = model("Chat", chatSchema);

module.exports = Chat;
