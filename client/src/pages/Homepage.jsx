import { Box, Heading, Text, Button, VStack, Stack } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { Link } from "react-router-dom";
import auth from "../utils/auth";


function Homepage() {
  
  const loggedIn = auth.loggedIn();
  const username = loggedIn ? auth.getProfile().data.username : "";
  const profile_picture = loggedIn ? auth.getProfile().data.profile_picture : "";

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
        maxW="2xl"
        padding={16}
        borderRadius="2xl"
        bg="white"
        boxShadow="2xl"
        textAlign="center"
      >
        <Heading
          fontSize="6xl"
          color="teal.600"
          fontFamily="'Caveat', cursive"
          lineHeight="short"
        >
          {loggedIn ? `Hello, ${username}! 🎉` : "Welcome to ChatterBox 💬"}
        </Heading>
        {loggedIn && (
          <Box display="flex" justifyContent="center" width="100%">
            <img
              src={profile_picture}
              alt="Profile"
              style={{
                width: "20rem",
                height: "20rem",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 4px 8px rgba(0, 0,0, 0.1)",
                border: "4px solid #38B2AC",
                marginTop: "1rem",
                marginBottom: "1rem",
                display: "block",
              }}
            />
          </Box>
        )}

        <Text fontSize="2xl" color="gray.700" fontWeight="medium">
          {loggedIn
            ? "Dive back into your conversations and keep the good times rolling! 🚀"
            : "Chat, connect, and create memories — all in one place."}
        </Text>

        <Stack spacing={8} width="100%">
          {loggedIn ? (
            <>
              <Button
                as={Link}
                to={`/mychat/${auth.getProfile().data._id}`}
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                paddingY={8}
                fontSize="2xl"
              >
                Go to My Chats 💌
              </Button>
              
              <Button
                size="lg"
                fontWeight="bold"
                paddingY={8}
                fontSize="2xl"
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
                paddingY={8}
                fontSize="2xl"
              >
                Login to Chat 🗨️
              </Button>
              <Button
                as={Link}
                to="/signup"
                colorScheme="teal"
                size="lg"
                fontWeight="bold"
                paddingY={8}
                fontSize="2xl"
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
