import { gql } from "@apollo/client";

export const GET_USERS = gql` 
query users {
  users {
    _id
    username
    user_email
    profile_picture
    isOnline
  }
}
`;

export const GET_CHATS_BY_USER = gql`
query chatsByUser($userId: ID!) {
  chatsByUser(userId: $userId) {
    _id
    chat_name
    users {
      _id
      username
      user_email
      profile_picture
    }
    latestMessage {
      _id
      message_content
      message_sender {
        _id
        username
        user_email
        profile_picture
      }
      createdAt
    }
  }
}
`;

export const GET_CHAT_MESSAGES = gql`
  query chatMessages($chatId: ID!) {
    messages(chatId: $chatId) {
      _id
      message_content
      message_sender {
        _id
        username
        user_email
        profile_picture
      }
      chatRoom {
        _id
        chat_name
        users {
          _id
          username
          user_email
          profile_picture
        }
      }
    }
  }
`;

export const QUERY_SINGLE_USER = gql`
query user($userId: ID!) {
user(userId: $userId) {
  _id
  username
  user_email
  profile_picture
  isOnline
}
}
`;