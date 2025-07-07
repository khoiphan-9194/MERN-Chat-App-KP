const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    // this will be used to store the content of the message
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // this will be used to store the chat in which the message was sent
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      //required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", messageSchema);

module.exports = Message;
