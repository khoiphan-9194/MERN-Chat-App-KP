import  { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHATS_BY_USER } from "../utils/queries";
import auth from "../utils/auth";
import { Box, Text, Button } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import  io  from "socket.io-client";
import { use } from "react";

const socket = io("http://localhost:3001"); // this should match your server URL

function MyChat() {
  const { authUserInfo, updateSelectedChat } = useAuthUserInfo();
  const userProfile = auth.getProfile()?.data;
  const userId = userProfile?._id;

  const { loading, error, data } = useQuery(GET_CHATS_BY_USER, {
    variables: { userId },
    skip: !userId,
  });

  const chats = data?.chatsByUser || [];




  const handleViewChat = (chat) => {
    alert(`Viewing chat: ${chat.chat_name}`);
    updateSelectedChat(chat);
    console.log("Selected Chat:", chat);
    // Optional: Navigate to chat page here if using React Router
    // navigate(`/chat/${chat._id}`);
  };

  if (loading) return <Text>Loading chats...</Text>;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  return (
    <Box
      bg="gray.700"
      borderRadius="md"
      boxShadow="md"
      maxW="400px"
      mx="auto"
      w="100%"
      p="4"
      color="white"
    >
      {chats.length > 0 ? (
        chats.map((chat) => (
          <Box
            key={chat._id}
            p="3"
            mb="2"
            bg="gray.600"
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "teal.500" }}
            onClick={() => handleViewChat(chat)}
          >
            <Text fontWeight="bold">{chat.chat_name}</Text>
            <Text fontSize="sm">
              <b>{chat.latestMessage?.sender?.username}:</b>{" "}
              {chat.latestMessage?.content}
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
