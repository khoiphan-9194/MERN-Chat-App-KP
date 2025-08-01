import { useEffect, useRef, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHATS_BY_USER } from "../utils/queries";
import { Box, Text } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import socket from "../utils/socket-client"; // Import the Socket.IO client instance+
import { displayTime } from "../utils/helpers"; // Import the displayTime function
import ChatDeletion from "../components/ChatDeletion"; // Import the ChatDeletion component
import { IoMdArrowRoundForward } from "react-icons/io";

function MyChat({ userId, setCurrentChat }) {
  const { updateSelectedChat, authUserInfo, updateMessageAsSeen } =
    useAuthUserInfo();
  const { loading, error, data, refetch } = useQuery(GET_CHATS_BY_USER, {
    variables: { userId },
    skip: !userId,
  });

  // chats = useMemo(() => data?.chatsByUser || [], [data])
  // useMemo is used to memoize the chats array so that it does not get recalculated on every render
  // means that the chats will only be fetched when the data changes
  // and not on every render of the component
  // it is used to optimize performance by preventing unnecessary re-renders
  const chats = useMemo(() => data?.chatsByUser || [], [data]);
  console.log("Fetched chats:", chats);
  const selectedChatIds = authUserInfo.selectedChats.map((chat) => chat._id);

  // ✅ Auto-add all fetched chats into context
  useEffect(() => {
    if (chats.length > 0) {
      chats.forEach((chat) => updateSelectedChat(chat)); // Keep adding to context
    }
  }, [chats, updateSelectedChat]);

  // NOTE #2
  const joinedChatIds = useRef(new Set()); // To track joined chat IDs

  // NOTE #3
  useEffect(() => {
    /*
    This prevents the effect from running if:
    chats is undefined or null OR There are no chats to join.
    */
    if (!chats || chats.length === 0) return;
    // Join each chat room via Socket.IO

    // This prevents joining the same chat room multiple times.
    // since a user can be part of multiple chats,
    // we loop through each chat and check if the chat ID is already in the joinedChatIds set.
    // If not, we join the chat room and add the chat ID to the set.
    // joinedChatIds.current.has is used to check if the chat ID is already in the set.
    //.current is a property of the useRef hook that holds the mutable object.
    // what .current does in general is that it allows you to access the current value of the ref object.
    // useRef is a hook that allows you to create a mutable object which holds a `.current` property.
    // without rendering the component again.
    // note that we would have to include socket.emit("joinChat", chat._id) in the useEffect hook
    // so that it will join the chat room when the component mounts or when the chats change
    // without socket.emit("joinChat", chat._id), the user will not be able to receive messages from server

    chats.forEach((chat) => {
      if (!joinedChatIds.current.has(chat._id)) {
        socket.emit("joinChat", chat._id);
        joinedChatIds.current.add(chat._id);
      }
    });

    // Listen for new messages in the chat rooms
    const handleNewMessage = async (messageData) => {
      console.log("New message received:", messageData);

      // Refetch if the message is for any selected chat
      if (selectedChatIds.includes(messageData.chatId)) {
        await refetch();
      }
    };

    // after joining the chat rooms, we listen for new messages
    // and if the new message is from the selected chat room, we refetch the chats
    socket.on("newMessage", handleNewMessage);

    return () => {
      // sockt.off is used to remove the event listener when the component unmounts
      // to prevent memory leaks and avoid multiple listeners being added
      socket.off("newMessage", handleNewMessage);
    };
  }, [chats, selectedChatIds, refetch]);

  // Note #4
  useEffect(() => {
    const handleNewChatRoom = async (chatData) => {
      // we check as long as user sent a message to the chat room, we will refetch the chats
      if (!chatData || !chatData._id) return;
      console.log("New chat room created:", chatData);

      await refetch();
      socket.emit("joinChat", chatData._id); // as long as a new chat room is created
      // we will join the chat room
    };

    // every time this component will always listen for new chat rooms
    // and if a new chat room is created, we will refetch the chats
    socket.on("notifyNewChatRoom", handleNewChatRoom);

    return () => {
      socket.off("notifyNewChatRoom", handleNewChatRoom);
    };
  }, [refetch]);

  const handleViewChat = async (chat) => {
    console.log("Viewing chat:", chat);
    setCurrentChat(chat); // Only updates the currently *viewed* chat
    await updateMessageAsSeen(chat.latestMessage._id);
    //alert(`isSeen status updated for chat: ${chat.latestMessage.isSeen}`);
    refetch(); // Refetch to ensure latest messages are loaded
  };

  if (loading) return <Text>Loading chats...</Text>;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  // Import the icon from react-icons

  return (
    <Box
      bg="gray.700"
      borderRadius="md"
      maxW="400px"
      mx={0}
      w="100%"
      p="4"
      color="white"
      height="500px"
      overflowY="auto"
      border={"3px solid rgb(28, 99, 222,0.5)"}
      boxShadow="3px 3px 10px rgba(232, 241, 248, 0.5)"
    >
      {chats.length > 0 ? (
        chats.map((chat) => (
          <Box
            key={chat._id}
            p="3"
            mb="2"
            bg="gray.600"
            borderRadius="10px"
            cursor="pointer"
          >
            <ChatDeletion chatId={chat._id} />{" "}
            <Box
              p="3"
              mb="2"
              bg="gray.600"
              borderRadius="10px"
              cursor="pointer"
              _hover={{ bg: "teal.500" }}
              onClick={() => handleViewChat(chat)}
            >
              <Text fontWeight="bold">{chat.chat_name}</Text>
              <Text fontSize="sm">
                {chat.latestMessage ? (
                  <>
                    <b>{chat.latestMessage.message_sender?.username}:</b>{" "}
                    {chat.latestMessage.message_content}
                    <Text
                      fontSize="2xs"
                      color="gray.400"
                      fontFamily="sans-serif"
                      letterSpacing="wider"
                      fontStyle="normal"
                      lineHeight="shorter"
                      display="flex"
                      alignItems="center"
                      gap="1"
                    >
                      {chat.latestMessage?.createdAt && (
                        <>
                          <span>
                            {displayTime(chat.latestMessage.createdAt)}
                          </span>
                        </>
                      )}

                      {chat.latestMessage.message_sender?._id === userId ? (
                        <IoMdArrowRoundForward
                          color="green"
                          style={{
                            marginLeft: 3,
                            fontSize: "1.5em",
                          }}
                        />
                      ) : (
                        !chat.latestMessage.isSeen && (
                          // Unseen icon (using a Chakra UI red dot)
                          <Box
                            as="span"
                            ml={2}
                            w="10px"
                            h="10px"
                            borderRadius="full"
                            bg="red.500"
                            display="inline-block"
                            title="Unseen"
                          />
                        )
                      )}
                    </Text>
                  </>
                ) : (
                  <span>No message content</span>
                )}
              </Text>
            </Box>
          </Box>
        ))
      ) : (
        <Text>No chats found.</Text>
      )}
    </Box>
  );
}

export default MyChat;

/*
    
       <Text
              fontSize="2xs"
              color="gray.400"
              fontFamily="sans-serif"
              letterSpacing="wider"
              fontStyle="normal"
              lineHeight="shorter"
            >
              {chat.latestMessage?.createdAt && (
                <span>{displayTime(chat.latestMessage.createdAt)}</span>
              )}
            </Text>
    */

/*
Note #2

✅ Purpose of joinedChatIds

This line creates a persistent Set that stores which chat rooms the user has already joined via Socket.IO — and it does so without triggering re-renders.
🔍 Why use useRef?

    useRef() returns a mutable object with a .current property.

    Unlike state (useState), changing .current does NOT cause re-renders.

    Perfect for tracking things over time that don’t need to appear in the UI.

🧠 Why use Set?

    A Set ensures that each chat ID is unique — no duplicates.

    So if your useEffect runs multiple times (e.g., when chats updates), the same chat won’t be joined multiple times.

🗂️ Example Usage in Your Effect

if (!joinedChatIds.current.has(chat._id)) {
  socket.emit("joinChat", chat._id);
  joinedChatIds.current.add(chat._id);
}

    Before joining a chat room, you check if it’s already joined.

    If not, you emit joinChat and add it to the Set.

    This prevents repeated joinChat calls to the same room.

✅ Summary
Concept	Value
useRef(new Set())	Creates a live object that holds chat IDs across renders.
.current	Access the actual Set that stores IDs.
Why Set?	Avoid duplicates automatically.
Why useRef?	No re-render when it updates — fast and efficient.
Let me know if you want to reset joinedChatIds when a user logs out or changes accounts — that's a common enhancement.
*/

/*
  NOTE #3
  ✅ Full Explanation of Your useEffect

useEffect(() => {

This hook runs:

    When chats, selectedChatIds, or refetch changes.

    It manages joining chat rooms via Socket.IO and listening for new messages.

✅ Guard Clause: Skip if no chats

if (!chats || chats.length === 0) return;

This prevents the effect from running if:

    chats is undefined or null.

    There are no chats to join.

✅ Why join chat rooms?

chats.forEach((chat) => {
  if (!joinedChatIds.current.has(chat._id)) {
    socket.emit("joinChat", chat._id);
    joinedChatIds.current.add(chat._id);
  }
});

This does room-based real-time communication via Socket.IO:

    socket.emit("joinChat", chat._id) tells the server:

        "I want to join the room with this chat ID."

    This lets the server know which rooms this socket should listen to.

    joinedChatIds is a useRef(new Set()) that tracks which rooms we’ve already joined.

        useRef is used so this tracking doesn't trigger re-renders.

        .current gives access to the mutable Set that lives outside the render cycle.

✅ Listen for real-time updates

const handleNewMessage = (messageData) => {
  console.log("New message received:", messageData);

  if (selectedChatIds.includes(messageData.chatId)) {
    refetch();
  }
};

    When a new message is received via Socket.IO ("newMessage" event), this callback runs.

    If the message is for a currently selected chat, it triggers a refetch (e.g., GraphQL query or any other state update).

    This keeps the UI fresh and up-to-date without refreshing.

✅ Add the listener

socket.on("newMessage", handleNewMessage);

This subscribes the socket to listen for "newMessage" events from the server.
✅ Cleanup function

return () => {
  socket.off("newMessage", handleNewMessage);
};

This ensures:

    The event listener is removed when the component unmounts or before re-running the effect.

    Prevents memory leaks and duplicate listeners (which would result in multiple console logs and repeated actions).

🧠 Summary: What This Does
Part	Purpose
if (!chats)	Avoids unnecessary runs if there are no chats.
socket.emit("joinChat", ...)	Tells the server to join that chat room for real-time messaging.
joinedChatIds + useRef	Tracks rooms joined already, avoids duplicate emits.
socket.on("newMessage")	Listens for new messages sent by others.
refetch()	Keeps the selected chat up-to-date with new messages.
socket.off	Cleans up listeners to prevent bugs and leaks.
  */

/*
Note #4

✅ What is this code doing?

This useEffect sets up a real-time listener for a "newChatRoom" event using Socket.IO, and refetches the user's chat list whenever a new chat room is created (such as when someone sends you a message for the first time).
🧠 Detailed Explanation

useEffect(() => {

    This useEffect runs once when the component mounts, or anytime refetch changes (which is likely stable and only changes if the query hook is re-created).

  const handleNewChatRoom = (chatData) => {
    // we check as long as user sent a message to the chat room, we will refetch the chats
    if (!chatData || !chatData._id) return;
    console.log("New chat room created:", chatData);
    refetch();
  };

    handleNewChatRoom is the function that will run when the socket receives a "newChatRoom" event.

    It first checks if chatData is valid (has an _id).

    If so, it logs the new chat room and then calls refetch() to reload the current user's list of chats.

    This is important because the chat list won’t update unless we explicitly fetch again.

  socket.on("newChatRoom", handleNewChatRoom);

    This tells Socket.IO to listen for the "newChatRoom" event from the server and trigger handleNewChatRoom when it happens.

  return () => {
    socket.off("newChatRoom", handleNewChatRoom);
  };

    This is the cleanup function that runs when the component unmounts or refetch changes.

    It removes the event listener to prevent memory leaks or duplicate event handling.

    Without this, if the component remounts multiple times, you might have multiple listeners responding to the same event.

🧩 Example Use Case

Let’s say:

    You created a one-on-one chat with User B.

    But User B doesn't see the chat room yet (by design).

    When you send the first message, the server emits newChatRoom to User B.

    This code listens for that and refetches User B’s chat list, making the new chat appear in real-time.

📌 Summary
Part	Purpose
socket.on("newChatRoom", ...)	Listen for server-side creation of a new chat.
refetch()	Refresh the chat list so the UI updates.
socket.off(...)	Clean up the listener when the component is removed.


*/
