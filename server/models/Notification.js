const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    notify_recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Who the notification is for
    },
    notify_sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional — who triggered it (e.g., message sender)
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    notificationMessageIds: 
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const Notification = model("Notification", notificationSchema);
module.exports = Notification;
