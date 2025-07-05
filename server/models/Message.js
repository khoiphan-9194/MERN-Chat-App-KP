const { Schema , model } = require("mongoose");

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
           // required: true,
        },
    content: // this will be used to store the content of the message 
    {
            type: String,
          required: true,
          trim: true,
        },
    chat: // this will be used to store the chat in which the message was sent
    {
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
