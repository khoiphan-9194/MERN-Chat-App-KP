import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { isSameSender, isLastMessage } from "../UI/chatLogics";
import ScrollableFeed from "react-scrollable-feed";
import { useState } from "react";
import ShowUserAvatar from "./ShowUserAvatar";

function ScrollableChat({ messages }) {
  const { authUserInfo } = useAuthUserInfo();
  const userId = authUserInfo.user?._id || authUserInfo.user?.userId;
  const [activeProfile, setActiveProfile] = useState(null);

  if (!messages || messages.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
        No messages yet.
      </div>
    );
  }

  /*
   event.target.getBoundingClientRect():
✅ What It Does:

getBoundingClientRect() returns the size and position of an element relative to the viewport 
(the visible part of the browser window).
✅ Example:

const rect = event.target.getBoundingClientRect();
if you click on an avatar image, rect will contain properties like:
Now, rect contains an object like this:

{
  top: 150,        // Distance from top of viewport
  left: 200,       // Distance from left of viewport
  width: 50,       // Element's width in pixels
  height: 50,      // Element's height in pixels
  right: 250,      // left + width
  bottom: 200      // top + height
}
  */

  const handle_avatarClick = (sender, event) => {
    const rect = event.target.getBoundingClientRect();
    const absoluteTop = rect.bottom + window.scrollY + 15; // Below avatar + 15px spacing
    const absoluteLeft = rect.left + window.scrollX; // Horizontally aligned to avatar

    setActiveProfile({
      userId: sender._id,
      username: sender.username,
      profile_picture: sender.profile_picture,
      user_email: sender.user_email,
      position: {
        top: absoluteTop,
        left: absoluteLeft,
      },
    });
  };

  return (
    <div>
      <ScrollableFeed>
        {messages.map((message, index) => {
          if (!message?.message_sender?._id) return null;

          const isOwnMessage = message.message_sender._id === userId;
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
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: isOwnMessage ? "#BEE3F8" : "#B9FBC0",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                }}
              >
                <img
                  className="profile-img"
                  src={message.message_sender.profile_picture}
                  alt="Profile"
                  onClick={(e) => handle_avatarClick(message.message_sender, e)}
                  style={{
                    display: isOwnMessage ? "none" : "block",
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    marginRight: "8px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "1.2rem" }}>
                  {message.message_content}
                </span>
              </div>

              {/* Show sender username */}
              {showSenderName && !isOwnMessage && (
                <span
                  style={{
                    fontSize: "0.9em",
                    color: "#888",
                    marginTop: "2px",
                    marginLeft: "4px",
                  }}
                >
                  {message.message_sender.username}
                </span>
              )}
            </div>
          );
        })}
      </ScrollableFeed>
      {activeProfile && (
        <ShowUserAvatar
          activeProfile={activeProfile}
          setActiveProfile={setActiveProfile}
        />
      )}
    </div>
  );
}

export default ScrollableChat;
