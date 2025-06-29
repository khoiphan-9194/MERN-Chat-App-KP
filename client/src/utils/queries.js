import { gql } from "@apollo/client";

export const GET_USERS = gql` 
query users {
  users {
    _id
    username
    email
    profile_picture
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
      email
      profile_picture
    }
    latestMessage {
      _id
      content
      sender {
        _id
        username
        email
        profile_picture
      }
    }
  }
}
`;

export const GET_CHAT_MESSAGES = gql`
query chatMessages($chatId: ID!) {
messages(chatId: $chatId) {
    _id
    content
    sender {
      _id
      username
      email
      profile_picture
    }
    chat {
      _id
      chat_name
      users {
        _id
        username
        email
        profile_picture
      }
    }
  
  }
}
`;