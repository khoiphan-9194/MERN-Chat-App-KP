import { gql } from "@apollo/client";

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
  mutation addUser(
    $username: String!
    $user_email: String!
    $password: String!
    $profile_picture: String!
  ) {
    addUser(
      username: $username
      user_email: $user_email
      password: $password
      profile_picture: $profile_picture
    ) {
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
  mutation createChat($chat_name: String!, $users: [ID!]!) {
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
  mutation updateUser(
    $userId: ID!
    $username: String
    $user_email: String
    $password: String
    $profile_picture: String
  ) {
    updateUser(
      _id: $userId
      username: $username
      user_email: $user_email
      password: $password
      profile_picture: $profile_picture
    ) {
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

export const UPDATE_MESSAGE_AS_SEEN = gql`
  mutation update_MessageAsSeen($messageId: ID!) {
    update_MessageAsSeen(messageId: $messageId) {
      _id
      isSeen
    }
  }
`;
export const MARK_MESSAGE_AS_SEEN = gql`
  mutation markMessageAsSeen($messageId: ID!) {
    markMessageAsSeen(messageId: $messageId)
  }
`;

export const IS_ONLINE_USER = gql`
  mutation isOnlineUser($userId: ID!, $isOnline: Boolean!) {
    isOnlineUser(userId: $userId, isOnline: $isOnline) {
      _id
      username
      isOnline
    }
  }
`;
export const ADD_NOTIFICATION = gql`
  mutation addNotification(
    $notify_recipient: ID!
    $notify_sender: ID
    $chatRoom: ID!
    $notificationMessageIds: ID!
  ) {
    addNotification(
      notify_recipient: $notify_recipient
      notify_sender: $notify_sender
      chatRoom: $chatRoom
      notificationMessageIds: $notificationMessageIds
    ) {
      _id
      notify_recipient {
        _id
        username
        user_email
      }
      notify_sender {
        _id
        username
        user_email
      }
      chatRoom {
        _id
        chat_name
      }
      notificationMessageIds {
        _id
        message_content
        message_sender {
          _id
          username
          user_email
          profile_picture
        }
      }
      createdAt
    }
  }
`;
export const REMOVE_NOTIFICATION = gql`
  mutation removeNotification($notificationId: ID!) {
    removeNotification(notificationId: $notificationId) {
      _id
      notify_recipient {
        _id
        username
        user_email
      }
      notify_sender {
        _id
        username
        user_email
      }
      chatRoom {
        _id
        chat_name
      }
      notificationMessageIds {
        _id
        message_content
        message_sender {
          _id
          username
          user_email
          profile_picture
        }
      }
      createdAt
    }
  }
`;
export const UPDATE_NOTIFICATION = gql`
  mutation updateNotification(
    $notificationId: ID!
    $notify_recipient: ID
    $notify_sender: ID
    $chatRoom: ID
    $notificationMessageIds: [ID!]!
  ) {
    updateNotification(
      notificationId: $notificationId
      notify_recipient: $notify_recipient
      notify_sender: $notify_sender
      chatRoom: $chatRoom
      notificationMessageIds: $notificationMessageIds
    ) {
      _id
      notify_recipient {
        _id
        username
        user_email
      }
      notify_sender {
        _id
        username
        user_email
      }
      chatRoom {
        _id
        chat_name
      }
      notificationMessageIds {
        _id
        message_content
        message_sender {
          _id
          username
          user_email
          profile_picture
        }
      }
      createdAt
    }
  }
`;
export const REMOVE_NOTIFICATIONS_BY_CHAT_ROOM = gql`
  mutation removeNotificationsByChatRoom($chatRoomId: ID!) {
    removeNotificationsByChatRoom(chatRoomId: $chatRoomId) {
      _id
      notify_recipient {
        _id
        username
        user_email
      }
      notify_sender {
        _id
        username
        user_email
      }
      chatRoom {
        _id
        chat_name
      }
      notificationMessageIds {
        _id
        message_content
        message_sender {
          _id
          username
          user_email
          profile_picture
        }
      }
      createdAt
    }
  }
`;
