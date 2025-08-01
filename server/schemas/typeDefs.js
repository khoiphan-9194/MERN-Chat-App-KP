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
  type Notification {
  _id: ID
  notify_recipient: User
  notify_sender: User
  chatRoom: Chat
  notificationMessageIds: Message
  createdAt: String
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
  getNotifications(userId: ID!): [Notification]
}

type Mutation {
  addUser(username: String!, user_email: String!, password: String!, profile_picture: String!): Auth
  updateUser(_id: ID!, username: String, user_email: String, password: String, profile_picture: String): User
  login(user_email: String!, password: String!): Auth
  createChat(chat_name: String!, users: [ID!]!): Chat
  addMessage(chatId: ID!, message_content: String!): Message
  update_MessageAsSeen(messageId: ID!): Message
  markMessageAsSeen(messageId: ID!): Boolean
  updateChat(chatId: ID!, chat_name: String, users: [ID!]): Chat
  deleteChat(chatId: ID!): Chat
  verifyCurrentUserPassword(userId: ID!, currentPassword: String!): Boolean
  isOnlineUser(userId: ID!, isOnline: Boolean!): User
  markUserOnline(userId: ID!): User
  markUserOffline(userId: ID!): User
  addNotification(notify_recipient: ID!, notify_sender: ID, chatRoom: ID!, notificationMessageIds: ID!): Notification
  removeNotification(notificationId: ID!): Notification
  removeNotificationsByChatRoom(chatRoomId: ID!): [Notification]
  updateNotification(notificationId: ID!, notify_recipient: ID, notify_sender: ID, chatRoom: ID, notificationMessageIds: [ID!]!): Notification

}
`;
module.exports = typeDefs;
