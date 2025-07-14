const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    message_sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // this will be used to store the content of the message
    message_content: {
      type: String,
      required: true,
      trim: true,
    },
    // this will be used to store the chat in which the message was sent
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);
// This will allow us to use virtuals in the message model
// messageSchema.set("toJSON", {
//   virtuals: true,
//   versionKey: false,
//   transform: (doc, ret) => {
//     // Remove the _id field from the response
//     ret.id = ret._id;
//     delete ret._id;
//   },
// });

const Message = model("Message", messageSchema);

module.exports = Message;
