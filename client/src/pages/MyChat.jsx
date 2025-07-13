import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHATS_BY_USER } from "../utils/queries";
import auth from "../utils/auth";
import { Box, Text } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import socket from "../utils/socket-client"; // Import the Socket.IO client instance
import { displayTime } from "../utils/helpers";

function MyChat({ userId, setCurrentChat }) {
  const { updateSelectedChat, authUserInfo } = useAuthUserInfo();
  const { loading, error, data, refetch } = useQuery(GET_CHATS_BY_USER, {
    variables: { userId },
    skip: !userId,
  });

  const chats = data?.chatsByUser || [];
  console.log("Fetched chats:", chats);
  const selectedChatIds = authUserInfo.selectedChats.map((chat) => chat._id);

  // ✅ Auto-add all fetched chats into context
  useEffect(() => {
    if (chats.length > 0) {
      chats.forEach((chat) => updateSelectedChat(chat)); // Keep adding to context
    }
  }, [chats, updateSelectedChat]);

  const joinedChatIds = useRef(new Set()); // To track joined chat IDs
  useEffect(() => {
    if (!chats || chats.length === 0) return;
    // Join each chat room via Socket.IO

    //This prevents joining the same chat room multiple times.
    // since a user can be part of multiple chats,
    // we loop through each chat and check if the chat ID is already in the joinedChatIds set.
    // If not, we join the chat room and add the chat ID to the set.
    // joinedChatIds.current.has is used to check if the chat ID is already in the set.
    //.current is a property of the useRef hook that holds the mutable object.
    // what .current does in general is that it allows you to access the current value of the ref object.
    // useRef is a hook that allows you to create a mutable object which holds a `.current` property.
    // without rendering the component again.
    // note that we would have to include socket.emit("joinChat", chat._id) in the useEffect hook
    // so that it will join the chat room when the component mounts or when the chats change
    // without socket.emit("joinChat", chat._id), the user will not be able to receive messages from server

    chats.forEach((chat) => {
      if (!joinedChatIds.current.has(chat._id)) {
        socket.emit("joinChat", chat._id);
        joinedChatIds.current.add(chat._id);
      }
    });

    // Listen for new messages in the chat rooms
    const handleNewMessage = (messageData) => {
      console.log("New message received:", messageData);

      // Refetch if the message is for any selected chat
      if (selectedChatIds.includes(messageData.chatId)) {
        refetch();
      }
    };

    // after joining the chat rooms, we listen for new messages
    // and if the new message is from the selected chat room, we refetch the chats
    socket.on("newMessage", handleNewMessage);

    return () => {
      // sockt.off is used to remove the event listener when the component unmounts
      // to prevent memory leaks and avoid multiple listeners being added
      socket.off("newMessage", handleNewMessage);
    };
  }, [chats, selectedChatIds, refetch]);

  

  useEffect(() => {
    const handleNewChatRoom = (chatData) => {
      // we check as long as user sent a message to the chat room, we will refetch the chats
      if (!chatData || !chatData._id) return;
      console.log("New chat room created:", chatData);
      refetch();
    };

    // every time this component will always listen for new chat rooms
    // and if a new chat room is created, we will refetch the chats
    socket.on("newChatRoom", handleNewChatRoom);

    return () => {
      socket.off("newChatRoom", handleNewChatRoom);
    };
  }, [refetch]);

  const handleViewChat = (chat) => {
    setCurrentChat(chat); // Only updates the currently *viewed* chat

    refetch(); // Refetch to ensure latest messages are loaded
  };

  if (loading) return <Text>Loading chats...</Text>;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  return (
    <Box
      bg="gray.700"
      borderRadius="md"
      maxW="400px"
      mx="auto"
      w="100%"
      p="4"
      color="white"
      height="450px"
      overflowY="auto"
      border={"3px solid rgb(28, 99, 222,0.5)"}
      boxShadow="3px 3px 10px rgba(232, 241, 248, 0.5)"
    >
      {chats.length > 0 ? (
        chats.map((chat) => (
          <Box
            key={chat._id}
            p="3"
            mb="2"
            bg="gray.600"
            borderRadius="10px"
            cursor="pointer"
            _hover={{ bg: "teal.500" }}
            onClick={() => handleViewChat(chat)}
          >
            <Text fontWeight="bold">{chat.chat_name}</Text>
            <Text fontSize="sm">
              {chat.latestMessage ? (
                <>
                  <b>{chat.latestMessage.message_sender?.username}:</b>{" "}
                  {chat.latestMessage.message_content}
                </>
              ) : (
                <span>No message content</span>
              )}
            </Text>
          </Box>
        ))
      ) : (
        <Text>No chats found.</Text>
      )}
    </Box>
  );
}

export default MyChat;

//This prevents joining the same chat room multiple times.
// since a user can be part of multiple chats,
// we loop through each chat and check if the chat ID is already in the joinedChatIds set.
// If not, we join the chat room and add the chat ID to the set.
//joinedChatIds.current.has is used to check if the chat ID is already in the set.
//.current is a property of the useRef hook that holds the mutable object.
// what .current does in general is that it allows you to access the current value of the ref object.
// useRef is a hook that allows you to create a mutable object which holds a `.current` property.
// without rendering the component again.
// note that we would have to include socket.emit("joinChat", chat._id) in the useEffect hook
// so that it will join the chat room when the component mounts or when the chats change
// without socket.emit("joinChat", chat._id), the user will not be able to receive messages from server

// chats.forEach((chat) => {
//   if (!joinedChatIds.current.has(chat._id)) {
//     socket.emit("joinChat", chat._id);
//     joinedChatIds.current.add(chat._id);
//   }
// });

/*
    
       <Text
              fontSize="2xs"
              color="gray.400"
              fontFamily="sans-serif"
              letterSpacing="wider"
              fontStyle="normal"
              lineHeight="shorter"
            >
              {chat.latestMessage?.createdAt && (
                <span>{displayTime(chat.latestMessage.createdAt)}</span>
              )}
            </Text>
    */
