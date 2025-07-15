import { useMutation } from "@apollo/client";
import { DELETE_CHAT } from "../utils/mutations";
import { GET_CHATS_BY_USER } from "../utils/queries";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { useEffect } from "react";

function ChatDeletion({ chatId }) {
  const { authUserInfo, removeSelectedChat } = useAuthUserInfo();

  useEffect(() => {
      console.log("🟢 selectedChats updated:", authUserInfo.selectedChats);
      
      
  }, [authUserInfo.selectedChats]);

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
          // No need for await here — this is synchronous
          
          removeSelectedChat(chatId);
          
      console.log("✅ Chat deleted and removed from selectedChats.");
    },
    onError: (error) => {
      console.error("❌ Error deleting chat:", error);
    },
  });

  const handleDeleteChatClick = async () => {
    try {
      await deleteChat({
        variables: { chatId },
        refetchQueries: [
          {
            query: GET_CHATS_BY_USER,
            variables: {
              userId: authUserInfo.user._id || authUserInfo.user?.userId,
            },
          },
        ],
      });
        // 

      // Optional: move this inside onCompleted if it's timing sensitive
      console.log("🟨 Mutation triggered.");
    } catch (error) {
      console.error("❌ Error deleting chat:", error);
    }
  };

  return (
    <button
      onClick={handleDeleteChatClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.1s",
        justifySelf: "flex-end",
        
        opacity: 0.5,
      }}
      aria-label="Delete chat"
      title="Delete chat"
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.85)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="9" r="9" fill="#f8d7da" />
        <line
          x1="6"
          y1="6"
          x2="12"
          y2="12"
          stroke="#d32f2f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="6"
          x2="6"
          y2="12"
          stroke="#d32f2f"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export default ChatDeletion;
