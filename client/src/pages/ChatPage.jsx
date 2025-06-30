// TODO: Add a comment explaining how we are able to extract the key value pairs from props
//this currentPage and handlePageChange were destructed from props

import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import PageHeader from "./PageHeader";
import MyChat from "./MyChat";
import ChatMessage from "./ChatMessage";

import { Box, Container, Text, Tabs, Stack } from "@chakra-ui/react";
import auth from "../utils/auth";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";

function ChatPage() {
  const { authUserInfo, updateUserInfo } = useAuthUserInfo();



  useEffect(() => {
    if (auth.loggedIn()) {
      const userId = auth.getProfile().data._id;
      const username = auth.getProfile().data.username;
      const userEmail = auth.getProfile().data.email; // Assuming email is part of the profile data
      // Update user info in context
      updateUserInfo({
        userId: userId,
        username: username,
        email: userEmail, // Include email in the update
        
        
      });
      console.log("User info updated in context:", authUserInfo);
    }
  }, [authUserInfo, updateUserInfo]); // [authUserInfo, updateUserInfo] as dependencies to ensure 
  // the effect runs when authUserInfo or updateUserInfo changes

console.log("ChatPage: authUserInfo", authUserInfo);




  return (
    <main>
      <div style={{ width: "100%" }}>
        {/* <p>
          {auth.loggedIn() ? "You are logged in!" : "You are not logged in."}
        </p> */}
        {auth.loggedIn() ? (
          <>
            {/* <p>Your user ID is: {auth.getProfile().data._id}</p> */}
      
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
                <ChatMessage chatId={authUserInfo.selectedChat?._id} />
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
