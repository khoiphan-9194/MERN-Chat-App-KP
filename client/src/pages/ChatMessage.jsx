import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_MESSAGES } from "../utils/queries";
import { SEND_MESSAGE } from "../utils/mutations";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";


function ChatMessage({ chatId }) {
  const { authUserInfo } = useAuthUserInfo();
  const selectedChatId = authUserInfo.selectedChat?._id || chatId;
    const userId = authUserInfo.user?.userId || authUserInfo.user?._id;

  const { loading, error, data, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
  });
    


  const [inputValue, setInputValue] = useState("");

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    variables: { chatId: selectedChatId, content: inputValue },
    onCompleted: () => {
      setInputValue("");
      refetch(); // Refresh messages after sending
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return; // Don't send empty messages
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
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
      {/* Messages List */}
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

            const shouldShowUsername = isLastMessage && !isOwnMessage; // ✅ Only show username if last message is not user's

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
                    fontSize: "1rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    marginBottom: "8px",
                  }}
                >
                  {/* ✅ Show username for the last message if it's not from the user */}

                  {message.content}
                  {shouldShowUsername && (
                    <span
                      style={{
                        fontWeight: "lighter",
                        fontSize: "0.9rem",

                        display:"flex",
                        color: "#555",
                        marginTop: "4px",
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
      </div>

      {/* Message Input */}
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
