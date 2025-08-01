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
import { useChatContext } from "../utils/ChatContext";
import socket from "../utils/socket-client";

function ChatNotification() {
  const { authUserInfo } = useAuthUserInfo();
  const { setSelectedCurrentChat } = useChatContext();
  const [count, setCount] = useState(0);
  const [notificationFrequency, setNotificationFrequency] = useState([]);


  // Get notifications from the server
  const { data: notificationsData, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      userId: authUserInfo.user?._id || authUserInfo.user?.userId,
    },
    skip: !authUserInfo.user,
  });

  const [removeNotificationsByChatRoom] = useMutation(
    REMOVE_NOTIFICATIONS_BY_CHAT_ROOM,
    {
      refetchQueries: [
        {
          query: GET_NOTIFICATIONS,
        },
      ],
      awaitRefetchQueries: true, // ✅ ensure refetch completes before continuing
    }
  );

  useEffect(() => {
    const handleNewNotification = async () => {
      try {
        // Fetch the latest notifications from the server
        // every time a new notification is received,
        // we will refetch the notifications to update the UI
        if (!refetch) return;
        const { data } = await refetch();

      if (!data?.getNotifications) return;

      console.log("Notifications data:", data.getNotifications);

      const frequencyMap = {};

      for (const notif of data.getNotifications) {
        const sender = notif.notify_sender.username;
        const chatRoomId = notif.chatRoom?._id || notif.chatRoomId;
        const chatRoomName = notif.chatRoom?.chat_name || notif.chatRoomName;

        if (!frequencyMap[sender]) {
          frequencyMap[sender] = {
            sender,
            notificationCount: 0,
            chatRoomId,
            chatRoomName,
          };
        }
      

        frequencyMap[sender].notificationCount++;

        if (chatRoomId) frequencyMap[sender].chatRoomId = chatRoomId;
        if (chatRoomName) frequencyMap[sender].chatRoomName = chatRoomName;
        }
        

      console.log("Formatted notifications:", Object.values(frequencyMap));
      setNotificationFrequency(Object.values(frequencyMap));
      setCount(Object.values(frequencyMap).length);
    } catch (err) {
      console.error("Error handling newNotification:", err);
    }
  };

  socket.on("newNotification", handleNewNotification);

  return () => {
    socket.off("newNotification", handleNewNotification);
  };
}, [refetch]);



  // Handle clicking a notification group (from a sender)
  const handleClick = async (event, notificationEntry) => {
    event.stopPropagation();

    try {
      // Set the selected chat
      setSelectedCurrentChat(notificationEntry);

      // Remove the sender group from local state
      setNotificationFrequency((prev) =>
        prev.filter((item) => item.sender !== notificationEntry.sender)
      );

      // Decrease the total notification count
      setCount((prev) => prev - 1);

      // Remove notifications for that chat room
      await removeNotificationsByChatRoom({
        variables: { chatRoomId: notificationEntry.chatRoomId },
      });
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Mark all notifications as read
  const handleClearAll = async () => {
    try {
      // Loop through each notification group by chatRoomId
      for (const { chatRoomId } of notificationFrequency) {
        if (chatRoomId) {
          await removeNotificationsByChatRoom({
            variables: { chatRoomId },
          });
        }
      }

      // Clear the local notification state
      setNotificationFrequency([]);
      setCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
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
                        • {notification.sender}{" "}
                        <span style={{ color: "gray.500" }}>
                          sent you {notification.notificationCount} message
                          {notification.notificationCount > 1 ? "s" : ""}
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
