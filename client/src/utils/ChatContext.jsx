import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

const ChatContext = createContext();

 const ChatProvider = ({ children }) => {
     const [selectedCurrentChat, setSelectedCurrentChat] = useState(null);
     useEffect(() => {
        // Log the selected chat ID whenever it changes
        console.log("Selected Chat ID:", selectedCurrentChat);
     }, [selectedCurrentChat]);
return (
    <ChatContext.Provider value={{ selectedCurrentChat, setSelectedCurrentChat }}>
      {children}
    </ChatContext.Provider>
  );
};
export default ChatProvider;

export const useChatContext = () => {
  return useContext(ChatContext);
};
