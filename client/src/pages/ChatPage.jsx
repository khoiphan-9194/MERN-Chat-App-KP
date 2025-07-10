import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import MyChat from "./MyChat";
import ChatMessage from "./ChatMessage";
import { Box, Text, Stack } from "@chakra-ui/react";
import auth from "../utils/auth";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";

function ChatPage() {
  

  const { authUserInfo, updateUserInfo } = useAuthUserInfo();
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    if (auth.loggedIn()) {
      const { _id: userId, username, user_email, profile_picture } = auth.getProfile().data;
      updateUserInfo({ userId, username, user_email, profile_picture });
    }
  }, [updateUserInfo]);

  return (
    <main>
      <div style={{ width: "100%" }}>
        {auth.loggedIn() ? (
          <>
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
              {/* My Chat List */}
              <Box flex={0.3} bg="whiteAlpha.500" p={5} borderRadius="lg"
              >
                <Text fontSize="2xl" textAlign="center">
                  My Chat
                </Text>
                <MyChat
                  userId={authUserInfo.user?.userId}
                  setCurrentChat={setCurrentChat}
                />
              </Box>

              {/* Active Chat Messages */}
              <Box
                flex={1}
                bg="whiteAlpha.400"
                p={4}
                borderRadius="lg"
                overflowY="auto"


              >
                {currentChat ? (
                  <>
                    <Text  textAlign="center" mb={2}
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        fontSize: "1.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}>
                      {currentChat.chat_name}
                    </Text>
                    <ChatMessage chatId={currentChat._id} />
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
