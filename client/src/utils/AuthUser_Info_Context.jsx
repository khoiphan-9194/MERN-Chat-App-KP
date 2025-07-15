import { createContext, useState, useContext, useEffect } from "react";
import socket from "./socket-client";
import auth from "./auth";
import AuthPageComponent from "../UI/AuthPageComponent";

// 1. Create Context
export const AuthUser_Info_Context = createContext();

// 2. Custom Hook for easy access
export const useAuthUserInfo = () => useContext(AuthUser_Info_Context);
// import io from "socket.io-client";

// 3. Provider Component
const AuthenUserInfoProvider = ({ children }) => {
  // Initialize Socket.IO client

  const [authUserInfo, setAuthUserInfo] = useState({
    user: null, // Will store user object
    selectedChats: [], // Now an array for multiple selected chats
  });

  const [isLastestMessage, setIsLastMessage] = useState(false);

  // ✅ Update User Info
  const updateUserInfo = (newUser) => {
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
              newUser.profile_picture || "/assets/default-avatar.jpg", // Default avatar if not provided
          },
        };
      });
    }
  };

  // ✅ Update selected chats (Add chat if not already selected)
  const updateSelectedChat = (chat) => {
    console.log("Updating selected chat:", chat);
    if (chat && chat._id) {
      setAuthUserInfo((prev) => {
        // this will check if the chat is already selected
        // prev is the previous state of authUserInfo
        // c is the current chat in the pre selectedChats array
        // we use some to check if any chat in the selectedChats array has the same _id as the chat we want to add
        const isAlreadySelected = prev.selectedChats.some(
          (c) => c._id === chat._id
        );
        if (isAlreadySelected) {
          console.log("You have already selected this chat:", chat);
          return prev;
        }

        console.log("Adding selected chat:", chat);
        return {
          ...prev,
          selectedChats: [...prev.selectedChats, chat],
        };
      });
    } else {
      console.error("Invalid chat object:", chat);
      alert("Invalid chat object. Please try again.");
    }
  };

  // ✅ Replace entire selectedChats array
  const updateSelectedChats = (newChats) => {
    setAuthUserInfo((prev) => ({
      ...prev,
      selectedChats: newChats,
    }));
  };

  // ✅ Reset function (for logout)
  const resetAuthUserInfo = () => {
    setAuthUserInfo({
      user: null,
      selectedChats: [],
    });
    alert("You have been logged out.");
    console.log("AuthUser_Info_Context: State has been reset.");
  };

  // ✅ Debugging
  useEffect(() => {
    console.log("AuthUser_Info_Context updated:", authUserInfo);
  }, [authUserInfo]);

  useEffect(() => {
    const userId = authUserInfo.user?._id || authUserInfo.user?.userId;
    if (userId) {
      socket.connect(); // Connect only when ready
      socket.emit("setupNewChat", {
        _id: userId,
        username: authUserInfo.user.username,
      });
      console.log("✅ Socket connected & joined personal room:", userId);
    }
    console.log("Socket connection status:", socket.connected);
  }, [authUserInfo.user]);

  //  run this effect specifically when the token changes,
  //  then you should extract the token to state or context and use it like this:

  const token = auth.getToken();

  useEffect(() => {
    if (!token) {
      console.error("No token found");
      return;
    }

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
  }, [token, updateUserInfo, authUserInfo]);

  return auth.loggedIn() ? (
    <AuthUser_Info_Context.Provider
      value={{
        authUserInfo,
        setAuthUserInfo,
        updateUserInfo,
        updateSelectedChat,
        updateSelectedChats,
        resetAuthUserInfo,
        isLastestMessage,
        setIsLastMessage,
      }}
    >
      {children}
    </AuthUser_Info_Context.Provider>
  ) : (
    <AuthPageComponent />
  );
};

export default AuthenUserInfoProvider;

/*
  // ✅ Update selected chats (Add chat if not already selected)
  const updateSelectedChat = (chat) => {
    if (chat && chat._id) {
      setAuthUserInfo((prev) => {
        // Filter out the chat if it exists, then add it to the end
        const filteredChats = prev.selectedChats.filter(
          (c) => c._id !== chat._id
        );

        console.log("Updating selected chats with chat:", chat);

        return {
          ...prev,
          selectedChats: [...filteredChats, chat],
        };
      });
    }
  };
*/
