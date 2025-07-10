import { Avatar, Menu, Portal ,Text } from "@chakra-ui/react";

function AvatarDropDownMenu({username,profile_picture,logout}) {
  const DropDownMenu = () => {
    return (
      <Menu.Root
        positioning={{ placement: "bottom-end" }}
        style={{
          position: "relative",
          top: "530px",
        }}
      >
        <Menu.Trigger rounded="none" focusRing="none">
          <Avatar.Root size="lg"
            style={{
                backgroundColor: "lightgray",
                border: "2px solid #ccc",
            }}
          >
            <Avatar.Fallback name={username} />
            <Avatar.Image src={`${profile_picture}`} />
          </Avatar.Root>
          <Text>{username}</Text>

       </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px",
                  gap: "10px",
                }}
              >
                <Menu.Item
                  value="account"
                  style={{
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Account
                </Menu.Item>
                <Menu.Item
                  value="settings"
                  style={{
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  style={{
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                    color: "#e53e3e", // red color for logout
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  _hover={{
                    backgroundColor: "#ffe5e5",
                  }}
                >
                  <span
                    role="img"
                    aria-label="logout"
                    style={{ fontSize: "1.2em" }}
                    onClick={logout}
                  >
                    🚪 Logout
                  </span>
                </Menu.Item>
              </div>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    );
  };

  return (
    <div
      style={{
        position: "relative",
            right: "40px",
        top: "15px",
      }}
    >
      <DropDownMenu />
    </div>
  );
}

export default AvatarDropDownMenu;
