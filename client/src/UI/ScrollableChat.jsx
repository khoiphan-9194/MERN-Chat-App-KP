import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { isSameSender, isLastMessage } from "../UI/chatLogics";
import ScrollableFeed from "react-scrollable-feed";
import { useState } from "react";
import ShowUserAvatar from "./ShowUserAvatar";
import { useRef, useEffect } from "react";

function ScrollableChat({ messages }) {
  const { authUserInfo } = useAuthUserInfo();
  const userId = authUserInfo.user?._id || authUserInfo.user?.userId;

  // activeProfile is used to show the user profile when clicking on the avatar
  // it contains the userId, username, profile_picture, user_email, and position
  const [activeProfile, setActiveProfile] = useState(null);

  // we use a ref to scroll to the bottom of the chat
  // this is useful when new messages arrive or when the chat is first loaded
  // useRef has properties like current, which we can use to access the DOM element
  // messagesEndRef will point to the last message in the chat
  // useRef is a hook that does not cause re-renders when its value changes
  // it is used to store a mutable value that does not trigger a re-render when changed

  // Please See Note #1 below for more details on how this works
  const messagesEndRef = useRef(null); 

  // the use of useEffect here is to scroll to the bottom of the chat
  // when the messages change like when a new message is sent or received
  // we use messagesEndRef.current.scrollIntoView to scroll to the last message
  // .current is the current value of the ref
  // scrollIntoView is a method that scrolls the element into view
  // behavior: "auto" means it will scroll instantly without animation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

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

          // Attach ref to the last message

          return (
            <div
              key={message._id}
              // ref={index === messages.length - 1 ? messagesEndRef : null}
              // This ref is used to point to the last message in the chat
              // because we use useRef above to create messagesEndRef
              // messagesEndRef is a ref that points to the last message in the chat
              // it checks if the current index is the last one
              // if it is, it attaches the ref to that message
              // otherwise, it sets it to null

              ref={index === messages.length - 1 ? messagesEndRef : null}
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

/* Note #1: How useRef and scrollIntoView work in this context
What is a ref in React?

    A ref is like a bookmark or a pointer that you can attach to a specific HTML element inside your React component.

    This pointer lets you directly access that element later in your JavaScript code.

    Normally, React manages the UI for you, but sometimes you want to do things like scroll to an element or focus an input box—for that, you need a ref.

Step 1: Creating a ref

const messagesEndRef = useRef(null);

    useRef is a React hook that creates this pointer.

    At first, this pointer is empty (null), but later you will attach it to the last message in your chat.

    After rendering, React will set messagesEndRef.current to the actual HTML element.

Step 2: Assigning the ref to the last message element

Inside your messages rendering:

ref={index === messages.length - 1 ? messagesEndRef : null}

    You loop over all messages with .map().

    You check: Is this the last message? (index === messages.length - 1)

        If yes, attach the messagesEndRef to this message's <div>.

        If no, don't attach any ref (null).

    This means: messagesEndRef.current will always point to the last message's HTML element on the page.

Step 3: Using useEffect to scroll

useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
  }
}, [messages]);

    This effect runs every time the messages array changes (like when a new message arrives).

    It checks if messagesEndRef.current exists (it should, because you attached it to the last message).

    Then it calls .scrollIntoView(), a browser function that scrolls the chat window so that the last message is visible.

    { behavior: "auto" } means scroll instantly without animation.

Imagine it like this:

    You have a list of messages stacked vertically.

    You put a little flag (the ref) on the last message.

    Whenever new messages come, React re-renders and moves that flag to the new last message.

    Your useEffect sees the new flag location and tells the browser: "Hey, scroll so this flag is visible at the bottom."

Why do we need to do this?

Without this, when new messages appear, the chat might stay scrolled up, and users won’t see the latest message automatically. This little trick keeps the chat view always at the bottom, showing the newest message.
Summary in beginner terms:

    useRef() creates a pointer.

    You attach that pointer only to the last message element with ref={...}.

    When messages change, useEffect scrolls to the element that pointer is pointing to.

    This makes the chat window scroll down automatically to the newest message.
*/
