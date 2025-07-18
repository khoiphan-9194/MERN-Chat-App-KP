import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import socket from "../utils/socket-client";
import auth from "../utils/auth";
import AuthPageComponent from "../UI/AuthPageComponent";
import { useMutation } from "@apollo/client";
import { MARK_MESSAGE_AS_SEEN } from "../utils/mutations";

export const AuthUser_Info_Context = createContext();
export const useAuthUserInfo = () => useContext(AuthUser_Info_Context);

const AuthenUserInfoProvider = ({ children }) => {
  const [authUserInfo, setAuthUserInfo] = useState({
    user: null,
    selectedChats: [],
  });

  // we use this Later, when a new message is received via Socket.IO:
  // You can compare if chatId !== currentChatId
  // If it’s different → show a notification (sound, badge, toast, etc.)
  // If it's the same → don't notify because the user is already in that chat
  const [currentChatId, setCurrentChatId] = useState(null);
  const currentChatIdRef = useRef(null);
  const [markMessageAsSeen] = useMutation(MARK_MESSAGE_AS_SEEN);

  const enterChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, []);

  const exitChat = useCallback(() => {
    setCurrentChatId(null);
  }, []);

  // ✅ Update User Info, this function will update the user info in the context
  // It will not update if the user already exists
  // once the user logs in, this function will be called to update the user info
  const updateUserInfo = useCallback((newUser) => {
    if (newUser && newUser.userId) {
      setAuthUserInfo((prev) => {
        if (prev.user && prev.user.userId === newUser.userId) {
          console.log("User already exists, skipping update.");
          return prev;
        }
        console.log("Updating user:", newUser);
        return {
          ...prev,
          user: {
            userId: newUser.userId,
            username: newUser.username,
            user_email: newUser.user_email,
            profile_picture:
              newUser.profile_picture || "/assets/default-avatar.jpg",
          },
        };
      });
    }
  }, []);

  // ✅ Update selected chats (Add chat if not already selected)
  // This function will update or add a chat to the selectedChats array in the context
  const updateSelectedChat = useCallback((chat) => {
    if (chat && chat._id) {
      setAuthUserInfo((prev) => {
        const isAlreadySelected = prev.selectedChats.some(
          (c) => c._id === chat._id
        );
        if (isAlreadySelected) return prev;
        return {
          ...prev,
          selectedChats: [...prev.selectedChats, chat],
        };
      });
    }
  }, []);

  // ✅ Update selected chats with a new array of chats
  const updateSelectedChats = useCallback((newChats) => {
    setAuthUserInfo((prev) => ({
      ...prev,
      selectedChats: newChats,
    }));
  }, []);

  // ✅ Remove a chat from the selectedChats array
  const removeSelectedChat = useCallback((chatId) => {
    setAuthUserInfo((prev) => ({
      ...prev,
      selectedChats: prev.selectedChats.filter(
        (c) => c._id.toString() !== chatId.toString()
      ),
    }));
  }, []);

  // ✅ Reset function (for logout)
  const resetAuthUserInfo = useCallback(() => {
    setAuthUserInfo({ user: null, selectedChats: [] });
    setCurrentChatId(null);
    socket.disconnect();
    alert("You have been logged out.");
  }, []);

  // Sync currentChatId to ref
  // this allows us to access the latest chatId without causing re-renders
  // every time currentChatId changes, useEffect will run
  // currentChatIdRef will always have the latest value
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Connect socket and emit setup
  useEffect(() => {
    const userId = authUserInfo.user?._id || authUserInfo.user?.userId;
    if (userId) {
      socket.connect();
      socket.emit("setupNewChat", {
        _id: userId,
        username: authUserInfo.user.username,
      });
      console.log("✅ Socket connected & joined personal room:", userId);
    }
    console.log("Socket connection status:", socket.connected);
  }, [authUserInfo.user]);

  // Fetch user from token on initial load
  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;

    const profile = auth.getProfile();
    if (profile?.data) {
      const {
        _id: userId,
        username,
        user_email,
        profile_picture,
      } = profile.data;
      updateUserInfo({ userId, username, user_email, profile_picture });
    }
  }, [updateUserInfo]);

  // Listen for incoming messages
  useEffect(() => {
    const userId = authUserInfo.user?._id || authUserInfo.user?.userId;
    if (!userId) return;

    const handleNotification = ({ chatId, messageData }) => {
      const activeChatId = currentChatIdRef.current;
      if (chatId !== activeChatId) {
        alert(
          `📨 New message in chat ${chatId}: ${messageData.message_content}`
        );
      } else {
        markMessageAsSeen({
          variables: { messageId: messageData._id },
        })
          .then(() => {
            console.log("✅ Message marked as seen:", messageData._id);
            alert(`Message marked as seen`);
          })
          .catch((error) => {
            console.error("Error marking as seen:", error);
          });
      }
    };

    socket.on("messageReceived", handleNotification);
    console.log("✅ Socket listener for messageReceived registered");

    return () => {
      socket.off("messageReceived", handleNotification);
    };
  }, [authUserInfo.user, markMessageAsSeen]); // authUserInfo.user means
  // the useEffect will run when the user logs in or out, and markMessageAsSeen is a function that can be called to mark messages as seen

  // Debugging
  useEffect(() => {
    console.log("AuthUser_Info_Context updated:", authUserInfo);
  }, [authUserInfo]);

  const contextValue = useMemo(
    () => ({
      authUserInfo,
      setAuthUserInfo,
      updateUserInfo,
      updateSelectedChat,
      updateSelectedChats,
      resetAuthUserInfo,
      removeSelectedChat,
      currentChatId,
      enterChat,
      exitChat,
    }),
    // Dependencies array: meaning this will only change if any of these functions change
    // This is important for performance, so that the context value doesn't change unnecessarily
    [
      authUserInfo,
      updateUserInfo,
      updateSelectedChat,
      updateSelectedChats,
      resetAuthUserInfo,
      removeSelectedChat,
      enterChat,
      currentChatId,
      exitChat,
    ]
  );

  return auth.loggedIn() ? (
    <AuthUser_Info_Context.Provider value={contextValue}>
      {children}
    </AuthUser_Info_Context.Provider>
  ) : (
    <AuthPageComponent />
  );
};

export default AuthenUserInfoProvider;
