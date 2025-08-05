import {
  Box,
  Text,
  IconButton,
  Button,
  Popover,
  Portal,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { useEffect } from "react";

import { useChatContext } from "../utils/ChatContext";

function ChatNotification() {
  const {
    setSelectedCurrentChat,
    notificationCount,
    notificationsDataFrequency,
    remove_notification,
  } = useChatContext();

  useEffect(() => {
    // check if notificationsDataFrequency and notificationCount are available
    if (notificationsDataFrequency && notificationCount) {
      // Log the notification count and frequency data

      console.log(notificationCount);
      console.log("Notification Frequency Data:", notificationsDataFrequency);
    }
  }, [notificationCount, notificationsDataFrequency]);

  // Handle clicking a notification group (from a sender)
  const handleNotificationClick = async (event, notificationEntry) => {
    event.stopPropagation();

    try {
      // Set the selected chat
      setSelectedCurrentChat(notificationEntry);
      // Remove the notification for the clicked chat room
      await remove_notification(notificationEntry.chatRoomId);
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Mark all notifications as read
  /*
  const handleClearAll = async () => {
    try {
      // Identify performance issue with using await inside a loop.
      // Loop through each notification group by chatRoomId
      for (const { chatRoomId } of notificationsDataFrequency) {
        if (chatRoomId) {
          await remove_notification(chatRoomId);
          //This processes one notification at a time, waiting 
          //for each mutation to finish before moving to the next 
          //— which is slow and inefficient if you have many notifications.
        }
      }

 
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };
  */
  

  const handleClearAll = async () => {
    try {
      const promises = notificationsDataFrequency.map(({ chatRoomId }) => {
        if (chatRoomId) {
          return remove_notification(chatRoomId);
        }
      });

      await Promise.all(promises);
      /*
    🔁 Why this is better:
    Promise.all() 
    sends out all mutation requests at once and waits for all to finish.
    Much faster if you’re clearing multiple notifications.
    Keeps the UI more responsive since it doesn’t block on each individual mutation.
    */
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
                  {notificationCount > 0
                    ? `You have ${notificationCount} new notification${notificationCount > 1 ? "s" : ""}`
                    : "No new notifications"}
                </Popover.Title>

                <Box mb={4}>
                  {notificationsDataFrequency.map((notification, index) => (
                    <Button
                      key={index}
                      variant="link"
                      display="block"
                      onClick={(e) => handleNotificationClick(e, notification)}
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
      {notificationCount > 0 && Number.isInteger(notificationCount) && (
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
          {notificationCount > 10 ? "10+" : notificationCount}
        </Box>
      )}
    </Box>
  );
}

export default ChatNotification;



/*
🔹 What is a Promise in JavaScript?

A Promise is a built-in JavaScript object that represents a task that hasn't completed yet, but will complete in the future (either successfully or with an error).

You usually deal with promises when you do things like:

    Fetch data from a server

    Read a file

    Wait for a timeout

Example:

const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data received!");
    }, 1000);
  });
};

fetchData().then((result) => console.log(result)); // After 1 sec: "Data received!"

🔹 What does "concurrently" mean?

    Concurrency means running multiple tasks at the same time (or overlapping in time), without waiting for one to finish before starting the next.

🔸 Sequential (not concurrent):

await task1();
await task2();
await task3();

Each taskX() waits for the previous one to finish. Slow if each takes 1s: total = 3s
🔸 Concurrent (better!):

await Promise.all([task1(), task2(), task3()]);

All three taskX() start at the same time, and you wait until all of them finish. If each takes 1s: total = 1s
🔹 Why does this matter?

In your handleClearAll, you were doing this:

for (const chatRoomId of chatRooms) {
  await remove_notification(chatRoomId); // one at a time
}

That means:

    You wait for the first remove_notification to finish

    Then the second

    Then the third

    ...and so on

If each one takes 500ms and you have 5 notifications = 2.5 seconds total

✅ But with:

await Promise.all(
  chatRooms.map(chatRoomId => remove_notification(chatRoomId))
);

All remove_notification(chatRoomId) calls run together at once. You only wait once, and it finishes faster.
🧠 Summary
Concept	Means...
Promise	A value that represents a future async result
await	Wait for a Promise to finish before continuing
Promise.all()	Run many Promises at once, wait for all to complete
Concurrent	Tasks overlap in time (faster than one-by-one)
*/