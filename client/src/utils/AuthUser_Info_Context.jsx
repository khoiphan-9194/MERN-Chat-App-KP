// src/context/AuthUserContext.js
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import socket from "../utils/socket-client";
import auth from "../utils/auth";
import AuthPageComponent from "../UI/AuthPageComponent";

export const AuthUser_Info_Context = createContext();

export const useAuthUserInfo = () => useContext(AuthUser_Info_Context);

const AuthenUserInfoProvider = ({ children }) => {
  const [authUserInfo, setAuthUserInfo] = useState({
    user: null,
    selectedChats: [],
  });

  // ✅ Update User Info
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

  // ✅ Replace entire selectedChats array
  const updateSelectedChats = useCallback((newChats) => {
    setAuthUserInfo((prev) => ({
      ...prev,
      selectedChats: newChats,
    }));
  }, []);

  // ✅ Reset function (for logout)
  const resetAuthUserInfo = useCallback(() => {
    setAuthUserInfo({ user: null, selectedChats: [] });
    socket.disconnect();
    alert("You have been logged out.");
    console.log("AuthUser_Info_Context: State has been reset.");
  }, []);

  const removeSelectedChat = useCallback((chatId) => {
    setAuthUserInfo((prev) => ({
      ...prev,
      selectedChats: prev.selectedChats.filter(
        (c) => c._id.toString() !== chatId.toString()
      ),
    }));
  }, []); 

  // ✅ Debugging
  useEffect(() => {
    console.log("AuthUser_Info_Context updated:", authUserInfo);
  }, [authUserInfo]);

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

  const contextValue = useMemo(
    () => ({
      authUserInfo,
      setAuthUserInfo,
      updateUserInfo,
      updateSelectedChat,
      updateSelectedChats,
      resetAuthUserInfo,
      removeSelectedChat,
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
