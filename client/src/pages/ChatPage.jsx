// TODO: Add a comment explaining how we are able to extract the key value pairs from props
//this currentPage and handlePageChange were destructed from props

import { useQuery } from "@apollo/client";
import React from "react";
import PageHeader from "./PageHeader";
import MyChat from "./MyChat";
import ChatMessage from "./ChatMessage";




import { Box, Container, Text, Tabs, Stack } from "@chakra-ui/react";
import auth from "../utils/auth";


function ChatPage() {
  return (
    <main>
      <div style={{ width: "100%" }}>
        <p>
          {auth.loggedIn() ? "You are logged in!" : "You are not logged in."}
        </p>
        {auth.loggedIn() ? (
          <>
            <p>Your user ID is: {auth.getProfile().data._id}</p>
            <PageHeader />

            <Stack
              direction="row"
              gap={5}
              justify="center"
              mt={4}
              height={"75vh"}
              overflowY="auto"
              width="100%"
              padding="1rem"
            >
              <Box flex={0.3} bg="whiteAlpha.900" p={4} borderRadius="lg">
                <Text fontSize="2xl" textAlign="center">
                  My Chat
                </Text>
                <MyChat />
              </Box>

              <Box flex={1} bg="whiteAlpha.900" p={4} borderRadius="lg">
                <Text fontSize="4xl" textAlign="center">
                  Chat App Column 2
                </Text>
                <ChatMessage />
              </Box>
            </Stack>
          </>
        ) : (
          <p>Please log in to see your user ID.</p>
        )}
      </div>
    </main>
  );
}

export default ChatPage;
