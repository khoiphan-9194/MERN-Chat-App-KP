import  { useEffect, useRef } from "react";

const ShowUserAvatar = ({ activeProfile, setActiveProfile }) => {
  const popupRef = useRef(null);
  if (!activeProfile) return null;

  const { top, left } = activeProfile.position;


  // the useEffect hook is used to close the popup when clicking outside of it
  // basically, when user clicks outside the popup, we set the activeProfile to null
  // which will remove the popup from the screen
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // ask: is the click outside the popup?
      // if so, set the activeProfile to null
      // this will remove the popup from the screen
      // !popupRef.current.contains(event.target) means that the click is outside the popup
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveProfile(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setActiveProfile]);

  return (
    <div
      // since we use useRef to create a reference to the popup,
      // we can use the ref attribute to attach the popupRef to the div
      ref={popupRef}
      style={{
        position: "fixed", // Fixed to viewport!
        top: `${top}px`,
        left: `${left}px`,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        padding: "12px 20px",
        zIndex: 10,
        minWidth: "220px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        opacity: 0.95,
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setActiveProfile(null)}
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "1.2rem",
          color: "#888",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        &#10005;
      </button>

      <img
        src={activeProfile.profile_picture}
        alt="Avatar"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
      <div>
        <strong
          style={{
            fontSize: "1rem",
            color: "#222",
            display: "block",
            marginBottom: "4px",
          }}
        >
          {activeProfile.username}
        </strong>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {activeProfile.user_email}
        </p>
      </div>
    </div>
  );
};

export default ShowUserAvatar;
