import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../utils/queries";
import { REMOVE_NOTIFICATIONS_BY_CHAT_ROOM } from "../utils/mutations";
import socket from "../utils/socket-client";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedCurrentChat, setSelectedCurrentChat] = useState(null);
  const { authUserInfo } = useAuthUserInfo();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsDataFrequency, setNotificationsDataFrequency] = useState(
    []
  );

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
          variables: {
            userId: authUserInfo.user?._id || authUserInfo.user?.userId,
          },
        },
      ],
      awaitRefetchQueries: true, // ✅ ensure refetch completes before continuing
    }
  );

  // Function to remove notifications by chat room ID
  const remove_notification = useCallback(
    async (chatRoomId) => {
      try {
        await removeNotificationsByChatRoom({
          variables: {
            chatRoomId,
          },
        });

        // Remove the chat room from the notificationsDataFrequency
        setNotificationsDataFrequency((prevData) => {
          const updated = prevData.filter(
            (item) => item.chatRoomId !== chatRoomId
          );

          // Sync the count to the length of remaining data
          setNotificationCount(updated.length);

          return updated;
        });
      } catch (err) {
        console.error("Error removing notifications:", err);
      }
    },
    [removeNotificationsByChatRoom]
  );
  useEffect(() => {
    const processNotifications = (notifications) => {
      if (!notifications) return;

      const frequencyMap = {};
      /*
adding a simple Set to track unique notification IDs to avoid counting duplicates,
which explains why counts incremented by 2 before:
We use a Set called countedNotificationIds to track notification IDs we've already counted.
Before incrementing notificationCount for a sender, we check if the notification _id is already counted.
This prevents double counting the same notification when your notifications array contains duplicates or 
the same notification appears more than once.
It preserves your original logic and grouping by sender without changing the shape of your output.
*/
      const countedNotificationIds = new Set(); // Track unique notifications to avoid double counting

      // Loop through each notification and group by sender
      for (const notif of notifications) {
        const sender = notif.notify_sender?.username;
        const chatRoomId = notif.chatRoom?._id || notif.chatRoomId;
        const chatRoomName = notif.chatRoom?.chat_name || notif.chatRoomName;

        // Skip if no sender or chatRoomId
        if (!sender || !chatRoomId) continue;

        // Skip if this notification was already counted to prevent double increments
        if (countedNotificationIds.has(notif._id)) continue;
        countedNotificationIds.add(notif._id);

        // if sender doesn't exist in the map, create a new entry
        // with notification count 0 and chatRoomId/chatRoomName
        // otherwise increment the count
        if (!frequencyMap[sender]) {
          frequencyMap[sender] = {
            sender,
            notificationCount: 0,
            chatRoomId,
            chatRoomName,
          };
        }
        // if the above conditions are met, just increment the count
        frequencyMap[sender].notificationCount++;

        // Update chatRoomId and chatRoomName if they exist
        // This ensures we always have the latest chatRoomId and chatRoomName
        // in case they change
        if (chatRoomId) frequencyMap[sender].chatRoomId = chatRoomId;
        // Update chatRoomName only if it exists
        // This prevents overwriting with undefined values
        if (chatRoomName) frequencyMap[sender].chatRoomName = chatRoomName;
      }

      // frequencyMap data structure:
      // {
      //   sender1: { sender: 'sender1', notificationCount: 2, chatRoomId: 'room1', chatRoomName: 'Chat Room 1' },
      //   sender2: { sender: 'sender2', notificationCount: 1, chatRoomId: 'room2', chatRoomName: 'Chat Room 2' },
      //   ...
      // }
      console.log("Processed notifications:", frequencyMap);

      // Convert the frequencyMap to an array
      // the values will be in the format:
      // [
      //   { sender: 'sender1', notificationCount: 2, chatRoomId: 'room1', chatRoomName: 'Chat Room 1' },
      //   { sender: 'sender2', notificationCount: 1, chatRoomId: 'room2', chatRoomName: 'Chat Room 2' },
      //   ...
      // ]
      setNotificationsDataFrequency(Object.values(frequencyMap));

      // Set the notification count to the number of unique senders
      // which is the length of the frequencyMap
      setNotificationCount(Object.values(frequencyMap).length);
      console.log("Notification count:", Object.values(frequencyMap).length);
    };

    // Initial render using existing notification data
    if (notificationsData?.getNotifications) {
      processNotifications(notificationsData.getNotifications);
    }

    // Socket listener for new notifications
    const handleNewNotification = async () => {
      try {
        // first check if refetch is available
        // if not, we can't refetch notifications
        // so we just return
        console.log("Handling new notification...");
        if (!refetch) return;
        // Refetch notifications from the server
        const { data } = await refetch();
        // If no data or no notifications, return early
        if (!data?.getNotifications) return;

        console.log("Notifications data:", data.getNotifications);
        // then we call processNotifications
        processNotifications(data.getNotifications);
        console.log(
          "🟢 Notifications updated:",
          Object.values(data.getNotifications)
        );
      } catch (err) {
        console.error("Error handling newNotification:", err);
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [notificationsData, refetch]);

  useEffect(() => {
    // Log the selected chat ID whenever it changes
    console.log("Selected Chat ID:", selectedCurrentChat);
  }, [selectedCurrentChat]);

  const ChatContextValue = useMemo(
    () => ({
      selectedCurrentChat,
      setSelectedCurrentChat,
      remove_notification,
      notificationCount,
      notificationsDataFrequency,
    }),
    [
      selectedCurrentChat,
      setSelectedCurrentChat,
      remove_notification,
      notificationCount,
      notificationsDataFrequency,
    ]
  );

  return (
    <ChatContext.Provider value={ChatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};
export default ChatProvider;

export const useChatContext = () => {
  return useContext(ChatContext);
};
