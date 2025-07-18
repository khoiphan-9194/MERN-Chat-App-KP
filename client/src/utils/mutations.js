import { gql } from '@apollo/client';

export const USER_LOGIN = gql`
  mutation login($user_email: String!, $password: String!) {
    login(user_email: $user_email, password: $password) {
      token
      user {
        _id
        username
        user_email
       
      }
    }
  }
`;

export const USER_SIGNUP = gql`
  mutation addUser($username: String!, $user_email: String!, $password: String!, $profile_picture: String!) {
    addUser(username: $username, user_email: $user_email, password: $password, profile_picture: $profile_picture) {
      token
      user {
        _id
        username
        user_email
       
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation addMessage($chatId: ID!, $message_content: String!) {
    addMessage(chatId: $chatId, message_content: $message_content) {
      _id
      message_content
      message_sender {
        _id
        username
      }
      chatRoom {
        chat_name
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
      message_content
      message_sender {
        _id
        username
      }
    }
  }
}
`;


export const VERIFY_CURRENT_PASSWORD = gql`
  mutation verifyCurrentUserPassword($userId: ID!, $currentPassword: String!) {
    verifyCurrentUserPassword(
      userId: $userId
      currentPassword: $currentPassword
    )
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation updateUser($userId: ID!, $username: String, $user_email: String, $password: String, $profile_picture: String) {
    updateUser(_id: $userId, username: $username, user_email: $user_email, password: $password, profile_picture: $profile_picture) {
      _id
      username
      user_email
      profile_picture
    }
  }
`;  

export const DELETE_CHAT = gql`
  mutation deleteChat($chatId: ID!) {
    deleteChat(chatId: $chatId) {
      _id
      chat_name
      users {
        _id
        username
      }
    }
  }
`;

export const MARK_MESSAGE_AS_SEEN = gql`
  mutation markMessageAsSeen($messageId: ID!) {
    markMessageAsSeen(messageId: $messageId) {
      _id
      isSeen
    }
  }
`;
export const IS_ONLINE_USER = gql`
  mutation isOnlineUser($userId: ID!) {
    isOnlineUser(userId: $userId) {
      _id
      isOnline
    }
  }
`;