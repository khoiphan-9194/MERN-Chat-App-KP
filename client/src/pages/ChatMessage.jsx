import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "../utils/queries";
import { SEND_MESSAGE } from "../utils/mutations";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import io from "socket.io-client";

const socket = io("http://localhost:3001"); // ✅ Update if your backend runs elsewhere

function ChatMessage({ chatId }) {
  const { authUserInfo } = useAuthUserInfo();
  const selectedChatId = authUserInfo.selectedChat?._id || chatId;
  const userId = authUserInfo.user?.userId || authUserInfo.user?._id;

  const { loading, error, data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
  });

  const [inputValue, setInputValue] = useState("");

  // useRef is a hook that allows you to create a mutable object which holds a [.current] property

  const messagesEndRef = useRef(null); // ✅ Ref for auto-scroll

  // ✅ Scroll to bottom whenever messages update
  useEffect(() => {
    // initially messagesEndRef.current is null, so we check if it exists before scrolling
    // if (messagesEndRef.current && data?.messages?.length > 0)  
    // means that if messagesEndRef.current is not null and data.messages is not empty, then scroll to bottom
    if (messagesEndRef.current && data?.messages?.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages]);

  // ✅ Join chat room and listen for new messages via Socket.IO
  useEffect(() => {
    if (!selectedChatId) return;

    socket.emit("joinChat", selectedChatId);

    const handleNewMessage = (messageData) => {
      if (messageData.chatId === selectedChatId) {
        refetch(); // ✅ Trigger Apollo to reload messages from server
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChatId, refetch]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    variables: { chatId: selectedChatId, content: inputValue },
    onCompleted: () => {
      setInputValue("");
      refetch(); // ✅ Reload messages after sending
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage();
    // ❌ Optional: You don't need to emit socket here if backend already emits from resolver
    // socket.emit("sendMessage", { chatId: selectedChatId, messageData: { content: inputValue } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedChatId) return <p>No chat selected.</p>;
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
        background: "#f5f7fb",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* ✅ Messages List */}
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
          messages.map((message, index) => {
            const isOwnMessage = message.sender._id === userId;
            const isLastMessage = index === messages.length - 1;
            const shouldShowUsername = isLastMessage && !isOwnMessage;

            return (
              <div
                key={message._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwnMessage ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background: isOwnMessage ? "#1976d2" : "#e4e6eb",
                    color: isOwnMessage ? "#fff" : "#222",
                    padding: "10px 18px",
                    borderRadius: isOwnMessage
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    fontSize: "1.2rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    marginBottom: "8px",
                  }}
                >
                  {message.content}
                  {shouldShowUsername && (
                    <span
                      style={{
                        fontWeight: "lighter",
                        fontSize: "0.9rem",
                        display: "flex",
                        color: "#555",
                        marginTop: "1px",
                      }}
                    >
                      {message.sender.username}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#888", textAlign: "center", marginTop: "40%" }}>
            No messages found.
          </p>
        )}

        {/* ✅ Invisible div for scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Input */}
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
