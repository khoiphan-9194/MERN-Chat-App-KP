import { Box, Heading, Text, Button, VStack, Stack } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { Link } from "react-router-dom";
import auth from "../utils/auth";


function Homepage() {
  
  const loggedIn = auth.loggedIn();
  const username = loggedIn ? auth.getProfile().data.username : "";

    const { resetAuthUserInfo } = useAuthUserInfo();
    const handleLogout = () => {
      resetAuthUserInfo();
      auth.logout();
  
    };
  
  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-r, #ffecd2, #fcb69f)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={8}
    >
      <VStack
        spacing={10}
        maxW="xl"
        padding={12}
        borderRadius="2xl"
        bg="white"
        boxShadow="2xl"
        textAlign="center"
      >
        <Heading
          fontSize="5xl"
          color="teal.600"
          fontFamily="'Caveat', cursive"
          lineHeight="short"
        >
          {loggedIn ? `Hello, ${username}! 🎉` : "Welcome to ChatterBox 💬"}
        </Heading>

        <Text fontSize="xl" color="gray.700" fontWeight="medium">
          {loggedIn
            ? "Dive back into your conversations and keep the good times rolling! 🚀"
            : "Chat, connect, and create memories — all in one place."}
        </Text>

        <Stack spacing={6} width="100%">
          {loggedIn ? (
            <>
              <Button
                as={Link}
                to={`/mychat/${auth.getProfile().data._id}`}
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                paddingY={7}
                fontSize="xl"
              >
                Go to My Chats 💌
              </Button>
              
              <Button
               
                size="lg"
                fontWeight="bold"
                paddingY={7}
                fontSize="xl"
                onClick={handleLogout}
                background={"red.400"}
              >
                Logout 🚪
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/login"
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                paddingY={7}
                fontSize="xl"
              >
                Login to Chat 🗨️
              </Button>
              <Button
                as={Link}
                to="/signup"
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                paddingY={7}
                fontSize="xl"
              >
                Sign Up for Free 🎉
              </Button>
            </>
          )}
        </Stack>
      </VStack>
    </Box>
  );
}

export default Homepage;
