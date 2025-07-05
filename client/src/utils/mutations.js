import { gql } from '@apollo/client';

export const USER_LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
       
      }
    }
  }
`;

export const USER_SIGNUP = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
       
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation addMessage($chatId: ID!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
      _id
      content
      sender {
        _id
        username
      }
    }
  }
`;

export const CREATE_CHAT = gql`
mutation createChat ($chat_name: String!, $users: [ID!]!) {
  createChat(chat_name: $chat_name, users: $users) {
    _id
    chat_name
    users {
      _id
      username
    }
    latestMessage {
      _id
      content
      sender {
        _id
        username
      }
    }
  }
}
`;