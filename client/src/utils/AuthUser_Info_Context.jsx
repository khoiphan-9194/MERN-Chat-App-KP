import { createContext, useState, useContext, useEffect } from "react";


// 1. Create Context
export const AuthUser_Info_Context = createContext();

// 2. Custom Hook for easy access
export const useAuthUserInfo = () => useContext(AuthUser_Info_Context);

// 3. Provider Component
const AuthenUserInfoProvider = ({ children }) => {
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
    }
    else {
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

  return (
    <AuthUser_Info_Context.Provider
      value={{
        authUserInfo,
        setAuthUserInfo,
        updateUserInfo,
        updateSelectedChat, // To add one chat
        updateSelectedChats, // To replace entire chat list
        resetAuthUserInfo,
        isLastestMessage,
        setIsLastMessage,
      }}
    >
      {children}
    </AuthUser_Info_Context.Provider>
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