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

//rfce
function PageHeader() {
  return (
    <>
      <Box flex="1" bg="whiteAlpha.900" p={4}>
        <Stack
          direction="row"
          spacing={5}
          align="center"
          justify="space-between"
        >
          <HStack wrap="wrap">
            <Drawer.Root placement="start">
              <Drawer.Trigger asChild>
                <Button variant="outline" size="sm">
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
          </HStack>

          <Text fontSize="5xl" fontWeight="bold" color="blackAlpha.900">
            Chat App
          </Text>

          <Button variant="outline-secondary">
            <span role="img" aria-label="logout" style={{ fontSize: "1.2em" }}>
              🚪 Logout
            </span>
          </Button>
        </Stack>
      </Box>
    </>
  );
}

export default PageHeader;
