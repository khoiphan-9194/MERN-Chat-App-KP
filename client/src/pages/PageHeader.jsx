import {
  Box,
  Stack,
  Text,
  Button,
  CloseButton,
  Drawer,
  Portal,
  HStack
} from "@chakra-ui/react";
import UserList from "./UserList";
import auth from "../utils/auth";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import AvatarDropDownMenu from "../UI/AvatarDropDownMenu";
import { Link } from "react-router-dom";
import DateTime from "../components/Date";

//rfce
function PageHeader() {
  const { resetAuthUserInfo, authUserInfo } = useAuthUserInfo();
  const handleLogout = () => {
    resetAuthUserInfo();
    auth.logout();

  };

  return (
    <>
      <Box
        flex="1"
        bg="whiteAlpha.600"
        p={4}
        style={{
          borderRadius: "40px",
        }}
      >
        <Stack
          direction="row"
          spacing={5}
          align="center"
          justify="space-between"
        >
          <HStack wrap="wrap">
            <Drawer.Root placement="start">
              <Drawer.Trigger asChild>
                <Button variant="none" size="lg">
                  Search User 🔍
                </Button>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner height={"85vh"} margin={"50px 0 0 10px"}>
                  <Drawer.Content roundedBottom="l3">
                    <Drawer.Header>
                      <Drawer.Title>
                        <h2
                          style={{
                            textAlign: "center",
                            marginTop: "1.5rem",
                            color: "#333",
                          }}
                        >
                          User Search
                        </h2>
                      </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <UserList />
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.ActionTrigger asChild>
                        <Button
                          variant="outline"
                          margin="0 0 10px 0"
                          width="100%"
                        >
                          Cancel
                        </Button>
                      </Drawer.ActionTrigger>
                    </Drawer.Footer>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="md" />
                    </Drawer.CloseTrigger>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>

            <Box
              px={6}
              py={3}
              margin={"0 0 0 30px"}
 
              borderRadius="20px"
              boxShadow="lg"
              display="flex"
              alignItems="center"
              minW="240px"
              gap={3}
              border="2px solid"
              borderColor="whiteAlpha.500"

            >
           
              <DateTime />
            </Box>
          </HStack>

          <Link
            to="/"
            style={{
              textDecoration: "none",
            }}
          >
            <Text
              fontSize="5xl"
              fontWeight="bold"
              color="blackAlpha.900"
              fontFamily="'Caveat', cursive"
            >
             Beetalk
            </Text>
          </Link>

          <AvatarDropDownMenu
            username={auth.getProfile().data.username}
            profile_picture={authUserInfo.user?.profile_picture}
            logout={handleLogout}
            userId={auth.getProfile().data._id}
          />
        </Stack>
      </Box>
    </>
  );
}

export default PageHeader;



/*
     <Button variant="outline-secondary"
          onClick={() => {
            handleLogout();
          }}
          > 
            <span role="img" aria-label="logout" style={{ fontSize: "1.2em" }}>
              🚪 Logout
            </span>
          </Button>
*/
