import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { isSameSender, isLastMessage } from "../UI/chatLogics";
import ScrollableFeed from "react-scrollable-feed";

function ScrollableChat({ messages }) {
  const { authUserInfo } = useAuthUserInfo();
  const userId = authUserInfo.user?._id || authUserInfo.user?.userId;

  if (!messages || messages.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
        No messages yet.
      </div>
    );
  }

  return (
    <ScrollableFeed>
      {messages.map((message, index) => {
        if (!message?.sender?._id) return null;

        const isOwnMessage = message.sender._id === userId;

        // Use isSameSender to conditionally render spacing/avatar or different styling when sender changes
        const showSenderName =
          isLastMessage(messages, index, userId) ||
          isSameSender(messages, message, index, userId);

        return (
          <div
            key={message._id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isOwnMessage ? "flex-end" : "flex-start",
              marginBottom: showSenderName ? "20px" : "6px",
            }}
          >
            <div
              style={{
                backgroundColor: isOwnMessage ? "#BEE3F8" : "#B9FBC0",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "60%",
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </div>

            {/* Show sender username only if last message or sender changes */}
            {showSenderName && !isOwnMessage && (
              <span
                style={{
                  fontSize: "0.8em",
                  color: "#888",
                  marginTop: "2px",
                  marginLeft: "4px",
                }}
              >
                {message.sender.username}
              </span>
            )}
          </div>
        );
      })}
    </ScrollableFeed>
  );
}

export default ScrollableChat;
