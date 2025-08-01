import {
  Box,
  Text,
  IconButton,
  Button,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../utils/queries";
import { REMOVE_NOTIFICATIONS_BY_CHAT_ROOM } from "../utils/mutations";
import Mychat from "../pages/MyChat";
import ChatMessage from "../pages/ChatMessage";
import { useChatContext } from "../utils/ChatContext";

function ChatNotification() {
  const { authUserInfo } = useAuthUserInfo();
  const { setSelectedCurrentChat } = useChatContext();
  const [count, setCount] = useState(0);
  const [notificationFrequency, setNotificationFrequency] = useState([]);
  const [isClicked, setIsClicked] = useState(false);  

  // Get notifications from the server
  const { data: notificationsData } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      userId: authUserInfo.user?._id || authUserInfo.user?.userId,
    },
    skip: !authUserInfo.user,
  });

  const [removeNotificationsByChatRoom] = useMutation(
    REMOVE_NOTIFICATIONS_BY_CHAT_ROOM
  );

  // Format and group notifications by sender
  useEffect(() => {
    if (notificationsData?.getNotifications) {
      console.log("Notifications data:", notificationsData.getNotifications);
      const frequencyMap = notificationsData.getNotifications.reduce(
        (acc, notif) => {
          const sender = notif.notify_sender.username;
          const chatRoomId = notif.chatRoom?._id || notif.chatRoomId;
          const chatRoomName = notif.chatRoom?.chat_name || notif.chatRoomName;

          if (!acc[sender]) {
            acc[sender] = { notificationCount: 0, chatRoomIds: new Set(), chatRoomNames: new Set() };
          }

          acc[sender].notificationCount++;
          if (chatRoomId) acc[sender].chatRoomIds.add(chatRoomId);
          if (chatRoomName) acc[sender].chatRoomNames.add(chatRoomName);
          return acc;
        },
        {}
      );

      const formatted = Object.entries(frequencyMap); // [ [username, { count, chatRoomIds }], ... ]
      console.log("Notification Frequency Map:", formatted);
      setNotificationFrequency(formatted);
      setCount(formatted.length);
    }
  }, [notificationsData]);

  // Handle clicking a notification group (from a sender)
  const handleClick = (e, notificationEntry) => {
    e.stopPropagation();
    const senderUsername = notificationEntry[0];
    console.log(notificationEntry)
    
    if (notificationEntry) {
      setSelectedCurrentChat(notificationEntry);
    }
    


    // Remove sender from the UI and reduce count
    setNotificationFrequency((prev) =>
      prev.filter(([username]) => username !== senderUsername)
    );
    setCount((prev) => prev - 1);
    // call Mychat to update the current chat
    



    
  };

  // Mark all as read
  const handleClearAll = () => {
    setNotificationFrequency([]);
    setCount(0);
  };

  return (
    <Box position="relative" display="inline-block">
      <Popover.Root lazyMount unmountOnExit>
        <Popover.Trigger asChild>
          <IconButton
            as={FiBell}
            w={9}
            h={12}
            color="gray.700"
            bg="none"
            aria-label="Chat Notification"
          />
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body>
                <Popover.Title fontWeight="medium">
                  {count > 0
                    ? `You have ${count} new notification${count > 1 ? "s" : ""}`
                    : "No new notifications"}
                </Popover.Title>

                <Box mb={4}>
                  {notificationFrequency.map((notification, index) => (
                    <Button
                      key={index}
                      variant="link"
                      display="block"
                      onClick={(e) => handleClick(e, notification)}
                    >
                      <Text mb={1} color="gray.700">
                        • {notification[0]}{" "}
                        <span style={{ color: "gray.500" }}>
                          sent you {notification[1].notificationCount} message
                          {notification[1].notificationCount > 1 ? "s" : ""}
                        </span>
                      </Text>
              
                    </Button>
                  ))}
                </Box>

                <Box display="flex" justifyContent="center" mt={4}>
                  <Button
                    onClick={handleClearAll}
                    size="md"
                    fontSize="sm"
                    leftIcon={<FiBell />}
                    borderRadius="full"
                    fontWeight="bold"
                    padding="8px 16px"
                    boxShadow="0 4px 14px 0 rgba(0,0,0,0.10)"
                    bg="blue.500"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, orange.400, pink.400)",
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 20px 0 rgba(210, 25, 25, 0.15)",
                    }}
                    transition="all 0.2s"
                    letterSpacing="wide"
                  >
                    🎉 Mark all as read
                  </Button>
                  
                </Box>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>

      {/* 🔴 Red count badge */}
      {count > 0 && (
        <Box
          position="absolute"
          top="-1"
          right="-1"
          bg="red.500"
          color="white"
          borderRadius="full"
          w={6}
          h={6}
          fontSize="xs"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          boxShadow="0 0 0 1px white"
        >
          {count > 99 ? "99+" : count}
        </Box>
      )}
    </Box>
  );
}

export default ChatNotification;
