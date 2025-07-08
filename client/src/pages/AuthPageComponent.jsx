// TODO: Add a comment explaining how we are able to extract the key value pairs from props
//this currentPage and handlePageChange were destructed from props


import Login from "../components/Login";
import Signup from "../components/Signup";
import { Box, Container, Text, Tabs } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import auth from "../utils/auth";






function AuthPageComponent() {
  return (
    <main>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Container maxW="xl" centerContent>
            <Box
              d="flex"
              alignItems="center"
              justifyContent="center"
              p={3}
              w="100%"
              m="40px 0 15px 0"
              borderRadius="lg"
              borderWidth={1}
              bg="whiteAlpha.900"
            >
              <Text fontSize="4xl" textAlign="center" mt={4}>
                Chat APP
              </Text>
            </Box>

            <Box
              d="flex"
              alignItems="center"
              justifyContent="center"
              p={6}
              w="100%"
              borderRadius="lg"
              borderWidth={1}
            >
              <Tabs.Root
                variant="enclosed"
                maxW="md"
                fitted
                defaultValue={"tab-1"}
                marginLeft={30}
              >
                <Tabs.List
                  borderRadius="md"
                  p={3}
                  justifyContent="center"
                  display="flex"
                  margin={"0 0 20px 0"}
                >
                  <Tabs.Trigger value="tab-1">Login</Tabs.Trigger>
                  <Tabs.Trigger value="tab-2">SignUp</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="tab-1">
                  <Login />
                </Tabs.Content>
                <Tabs.Content value="tab-2">
                  <Signup />
                </Tabs.Content>
              </Tabs.Root>
            </Box>
          </Container>
        </div>
   
    </main>
  );
}

export default AuthPageComponent;
