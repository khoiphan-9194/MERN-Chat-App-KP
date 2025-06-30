import { createContext, useState, useContext, useEffect } from "react";

// 1. Create Context
export const AuthUser_Info_Context = createContext();

// 2. Custom Hook for easy access
export const useAuthUserInfo = () => useContext(AuthUser_Info_Context);


// 3. Provider Component
const AuthenUserInfoProvider = ({ children }) => {
  const [authUserInfo, setAuthUserInfo] = useState({
    user: null, // Will store user object
    selectedChat: null, // Will store currently opened chat
    // You can add more as needed (e.g., messages, token, etc.)
  });

  // Optional: Helper function to update user info
  const updateUserInfo = (newUser) => {
    if (newUser && newUser.userId) {
      setAuthUserInfo((prev) => {
        // If same userId, skip update
        if (prev.user && prev.user.userId === newUser.userId) {
          console.log("User already exists, skipping update.");
          return prev; // No state update
        }

        console.log("From AuthUser_Info_Context: Updating user to", newUser);

        return {
          ...prev,
          user: {
            userId: newUser.userId,
            username: newUser.username,
            // Add other fields if needed
          },
        };
      });
    }
  };

  // Optional: Helper function to update selected chat
  const updateSelectedChat = (chat) => {
    if (chat && chat._id) {
      setAuthUserInfo((prev) => {
        // Check if already selected the same chat
        if (prev.selectedChat && prev.selectedChat._id === chat._id) {
          console.log("Same chat already selected, skipping update.");
          return prev; // No state update
        }

        console.log("From AuthUser_Info_Context: Updating selected chat", chat);

        return {
          ...prev,
          selectedChat: chat,
        };
      });
    }
  };

  // ✅ Reset function (for logout)
  const resetAuthUserInfo = () => {
    setAuthUserInfo({
      user: null,
      selectedChat: null,
    });
    alert("You have been logged out.");
    console.log("AuthUser_Info_Context: State has been reset.");
  };

  // Log authUserInfo changes for debugging
  useEffect(() => {
    console.log("AuthUser_Info_Context mounted", authUserInfo);
  }, [authUserInfo]);

  return (
    <AuthUser_Info_Context.Provider
      value={{
        authUserInfo,
        setAuthUserInfo,
        updateUserInfo,
        updateSelectedChat,
        resetAuthUserInfo,
      }}
    >
      {children}
    </AuthUser_Info_Context.Provider>
  );
};

export default AuthenUserInfoProvider;


