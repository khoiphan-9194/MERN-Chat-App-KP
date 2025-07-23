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
      // this will be used to store the users in the chat
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

    userVisibility: // PLEASE SEE ADDITIONAL CONTEXT BELOW
 
      {
        type: Map,
        of: Boolean,
        default: {},
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
     /*
    ✅ userVisibility — Purpose

userVisibility: {
  type: Map,
  of: Boolean,
  default: {},
}

🔍 What it does:

This field is used to track whether each user should see the chat in their chat list.
🧠 Why it’s needed:

You want to:

    ✅ Create a chat between two users (e.g., User A and User B).

    ✅ Let User A (creator) see the chat right away.

    ❌ But User B should NOT see it until a message is actually sent.

This field makes that possible without needing extra models or flags.
🗂 How the data looks in MongoDB:

Assume a chat between two users:
User ID	Visibility
65a1... (User A)	true
65a2... (User B)	false

Internally in MongoDB, it's stored like:

"userVisibility": {
  "65a1...": true,
  "65a2...": false
}

  IS IT AN OBJECT OR A MAP OR AN ARRAY?
      IN THIS CASE, IT IS A MAP OF USER IDs TO BOOLEAN VALUES
      IT MAY BE DISPLAYED LIKE THIS:
      {
        userId1: true,
        userId2: false,
        userId3: true,
      }
      BY DEFAULT, IT IS AN EMPTY OBJECT
    */
