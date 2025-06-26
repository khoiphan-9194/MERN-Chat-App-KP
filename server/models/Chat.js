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
        users: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        latestMessage: // this will be used to store the latest message in the chat
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: //
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);  

const Chat = model("Chat", chatSchema);

module.exports = Chat;
