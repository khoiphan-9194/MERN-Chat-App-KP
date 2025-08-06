import { useEffect } from "react";
import { Box, Text, Stack } from "@chakra-ui/react";

import PageHeader from "./PageHeader";
import MyChat from "./MyChat";
import ChatMessage from "./ChatMessage";

import auth from "../utils/auth";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { useChatContext } from "../utils/ChatContext";

function ChatPage() {
  const { authUserInfo } = useAuthUserInfo();
  const { selectedCurrentChat, setSelectedCurrentChat } = useChatContext();

  useEffect(() => {
    if (selectedCurrentChat) {
      // Log the selected chat whenever it changes
      console.log("Selected Current Chat:", selectedCurrentChat);
    }
  }, [selectedCurrentChat]);

  // Get chat name to display in header
  const displayedChatName =
    selectedCurrentChat?.chat_name || selectedCurrentChat?.chatRoomName || "";

  // Get chat ID to pass into ChatMessage component
  const currentChatId =
    selectedCurrentChat?._id || selectedCurrentChat?.chatRoomId || "";

  return (
    <main>
      <div className="chat-container">
        {auth.loggedIn() ? (
          <>
            <PageHeader />

            <Stack
              direction="row"
              gap={5}
              justify="center"
              mt={4}
              height="75vh"
              overflowY="auto"
              width="100%"
              padding="1rem"
            >
              {/* Left side: Chat list */}
              <Box flex={0.3} bg="whiteAlpha.500" p={5} borderRadius="lg">
                <Text fontSize="2xl" textAlign="center">
                  My Chat
                </Text>

                <MyChat
                  userId={authUserInfo?.user?.userId || null}
                  setCurrentChat={setSelectedCurrentChat}
                 
                />
              </Box>

              {/* Right side: Chat messages */}
              <Box
                flex={1}
                bg="whiteAlpha.400"
                p={4}
                borderRadius="lg"
                overflowY="auto"
              >
                {/* Show chat messages if a chat is selected */}
                {currentChatId ? (
                  <>
                    <Text
                      textAlign="center"
                      mb={2}
                      fontWeight="bold"
                      color="#333"
                      fontSize="1.5rem"
                      textTransform="uppercase"
                      letterSpacing="1px"
                    >
                      {displayedChatName}
                    </Text>

                    <ChatMessage chatId={currentChatId} />
                  </>
                ) : (
                  <Text textAlign="center">
                    Select a chat to start messaging
                  </Text>
                )}
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
