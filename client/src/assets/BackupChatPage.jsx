import { useEffect, useState } from "react";
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

  const [chatRoomInfo, setChatRoomInfo] = useState({}); // holds processed chat data if selectedCurrentChat is in array format

  useEffect(() => {
    if (selectedCurrentChat) {
      // When chat is selected and it's an array (from MyChat list)
      if (!selectedCurrentChat._id && Array.isArray(selectedCurrentChat)) {
        const [senderName, chatDetails] = selectedCurrentChat;

        const formattedChatData = {
          sender: senderName,
          chatId: Array.from(chatDetails.chatRoomIds).join(", "),
          chatName: Array.from(chatDetails.chatRoomNames).join(", "),
        };

        setChatRoomInfo(formattedChatData);
      }
    }
  }, [selectedCurrentChat]);

  // Get chat name to display in header
  const displayedChatName =
    selectedCurrentChat?.chat_name ||
    (Array.isArray(selectedCurrentChat)
      ? Array.from(selectedCurrentChat[1].chatRoomNames).join(", ")
      : chatRoomInfo.chatName);

  // Get chat ID to pass into ChatMessage component
  const currentChatId =
    selectedCurrentChat?._id ||
    (Array.isArray(selectedCurrentChat)
      ? Array.from(selectedCurrentChat[1].chatRoomIds).join(", ")
      : chatRoomInfo.chatId);

  return (
    <main>
      <div style={{ width: "100%" }}>
        {/* Only show chat UI if user is logged in */}
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
