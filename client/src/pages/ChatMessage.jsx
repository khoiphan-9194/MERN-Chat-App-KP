import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "../utils/queries";
import { SEND_MESSAGE, UPDATE_MESSAGE_AS_SEEN } from "../utils/mutations";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import ScrollableChat from "../UI/ScrollableChat";
import socket from "../utils/socket-client"; // Import the Socket.IO client instance

function ChatMessage({ chatId }) {
  const { authUserInfo, enterChat, exitChat } = useAuthUserInfo();

  const userId = authUserInfo.user?.userId || authUserInfo.user?._id;
  const [inputValue, setInputValue] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  });

  useEffect(() => {

    
    if (!chatId) return;

    socket.emit("joinChat", chatId);
    // enterChat will set the currentChatId in the context
    // This allows us to track which chat the user is currently in
    // once user enters a chat, we can start listening for new messages
    enterChat(chatId); // from AuthUser_Info_Context.jsx
    const handleNewMessage = (messageData) => {
      if (messageData.chatId === chatId) {
        // If the new message is in the current chat, refetch messages
        // so that every time user sends a new message,
        // we will refetch the messages to update the UI
        refetch();
      }
    };

    // Listen for new messages in the current chat
    // This will trigger when a new message is sent in the chat
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      exitChat(); //  updates your currentChatId state in the context
    };
  }, [chatId, refetch, enterChat, exitChat]);


  // Refetch when forced (e.g., when clicking a chat with unseen messages)
  useEffect(() => {
    if (chatId) {
      // Check if forceRefetch is true and chatId is valid
      //alert("Refetching messages for chat: " + chatId);
      refetch();
      // This will trigger a refetch of messages for the current chat
    }
  }, [chatId, refetch]); // ✅ Refetch messages when forceRefetch changes

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setInputValue("");
      refetch();
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage({
      variables: {
        chatId,
        message_content: inputValue,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatId) return <p>No chat selected.</p>;
  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error loading messages: {error.message}</p>;

  const messages = data?.messages || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "500px",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        background: "rgba(255, 255, 255, 0.5)",
        overflow: "hidden", //overflow hidden to prevent scrollbars, meaning
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length > 0 ? (
          <ScrollableChat messages={messages} />
        ) : (
          <p style={{ color: "#888", textAlign: "center", marginTop: "40%" }}>
            No messages found.
          </p>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #e0e0e0",
          padding: "12px 16px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "1rem",
            background: "#f9f9f9",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
          title="Send"
        >
          &#9658;
        </button>
      </div>
    </div>
  );
}

export default ChatMessage;
