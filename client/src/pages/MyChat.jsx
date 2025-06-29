import React from 'react'
import { useQuery } from '@apollo/client';
import { GET_CHATS_BY_USER } from '../utils/queries';
import auth from '../utils/auth';
import { Box, Text, Stack, Button,ButtonGroup } from '@chakra-ui/react';

function MyChat() {
  const { loading, error, data } = useQuery(GET_CHATS_BY_USER, {
    variables: { userId: auth.getProfile().data._id }

  });
  const chats = data?.chatsByUser || [];
  console.log(chats);
  console.log("User ID:", auth.getProfile().data.username)

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  const handleViewChat = (chatId) => {
    // Logic to navigate to the chat page or display chat messages
    alert(`Viewing chat with ID: ${chatId}`);

  };

  return (
    <div>
      <Box bg="gray" borderRadius="md" boxShadow="md" maxW="400px" mx="auto"
        w="100%" p="4" color="white" _hover={{ bg: "green" }}>
        {chats.length > 0 ? (
          chats.map(chat => (
            <Box key={chat._id}>
              <Text fontWeight="bold">{chat.chat_name}</Text>
              <Text fontSize="sm">
                <b>
                  <span style={{ fontWeight: 'bold' }}>
                    {chat.latestMessage?.sender?.username}
                  </span>
                  {': '}
                </b>
                {chat.latestMessage?.content}
              </Text>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="inline"
                  colorScheme="teal"
                  size="sm"
                  onClick={() => handleViewChat(chat._id)}
                >
                  View Chat
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Text>No chats found.</Text>
        )}
      </Box>
    </div>
  );
}

export default MyChat