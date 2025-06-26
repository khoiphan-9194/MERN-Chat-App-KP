const typeDefs = `
type User {
  _id: ID
  username: String
  email: String
  password: String
  profile_picture: String
}
 type Chat {
  _id: ID
  chat_name: String
  isGroupChat: Boolean
  users: [User]
  latestMessage: Message
  groupAdmin: User
}

type Message {
  _id: ID
  sender: User 
  content: String
  chat: Chat 
}

type Auth {
  token: ID!
  user: User
}
type Query {
  users: [User]
  user(_id: ID!): User
  chats: [Chat]
  chat(_id: ID!): Chat
  messages(chatId: ID!): [Message]
}

type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
  createChat(chat_name: String users: [ID]): Chat
  addMessage(chatId: ID!, content: String!): Message
 
}
`;
module.exports = typeDefs;
