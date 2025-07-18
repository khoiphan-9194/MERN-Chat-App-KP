const typeDefs = `
type User {
  _id: ID
  username: String
  user_email: String
  password: String
  profile_picture: String
  isOnline: Boolean
}
 type Chat {
  _id: ID
  chat_name: String
  isGroupChat: Boolean
  users: [User]
  latestMessage: Message
  groupAdmin: User
  createdAt: String
  wasSeen: Boolean
}

type Message {
  _id: ID
  message_sender: User
  message_content: String
  chatRoom: Chat
  createdAt: String
  isSeen: Boolean

}

type Auth {
  token: ID!
  user: User
}
type Query {
  users: [User]
  user(userId: ID!): User
  chats: [Chat]
  chatsByUser(userId: ID!): [Chat]
  chat(_id: ID!): Chat
  messages(chatId: ID!): [Message]
}

type Mutation {
  addUser(username: String!, user_email: String!, password: String!, profile_picture: String!): Auth
  updateUser(_id: ID!, username: String, user_email: String, password: String, profile_picture: String): User
  login(user_email: String!, password: String!): Auth
  createChat(chat_name: String!, users: [ID!]!): Chat
  addMessage(chatId: ID!, message_content: String!): Message
  markMessageAsSeen(messageId: ID!): Message
  updateChat(chatId: ID!, chat_name: String, users: [ID!]): Chat
  deleteChat(chatId: ID!): Chat
  verifyCurrentUserPassword(userId: ID!, currentPassword: String!): Boolean
  isOnlineUser(userId: ID!): User
 
}
`;
module.exports = typeDefs;
