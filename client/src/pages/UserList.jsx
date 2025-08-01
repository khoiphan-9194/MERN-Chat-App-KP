import { useQuery, useMutation } from "@apollo/client";
import { useState, useEffect, useMemo } from "react";
import { GET_USERS } from "../utils/queries";
import { Box, Input, VStack, Text, Spinner } from "@chakra-ui/react";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";
import { CREATE_CHAT } from "../utils/mutations";
import { GET_CHATS_BY_USER } from "../utils/queries";

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const { authUserInfo, updateSelectedChat } = useAuthUserInfo();

  // ✅ Debounce: wait 300ms after user stops typing
  /*
    this debounce prevents too many api calls while the user is typing.
    the way it works is that it waits for 300 milliseconds after the user stops typing before updating the debouncedFilter state.
    This way, if the user types quickly, the filterValue will only be updated once after they stop typing for 300 milliseconds.
    This reduces the number of re-renders and API calls, improving performance.
    for example, if the user types "a", then "b", then "c" quickly, the debouncedFilter will only be updated once after 300 milliseconds after the user stops typing.
    Debounce is a technique used to limit how often a function runs—specifically, 
    to delay its execution until after a certain amount of time has passed since the last time it was called.
     Why It’s Useful:
    Reduces performance issues.
    Prevents spamming APIs.
    Improves user experience by running actions only when needed.
    */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filterValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [filterValue]);

  /*
  1. debouncedFilter.trim() !== ""

This checks whether the search input is non-empty after removing any whitespace.

    .trim() → Removes leading and trailing spaces.

    If it's empty (""), we skip filtering.

Example:

debouncedFilter = " hello "
debouncedFilter.trim() → "hello" → not empty → proceeds to filter.

2. Condition: If input is non-empty, run filter

data?.users?.filter(...)

    Safely accesses data.users using optional chaining (?.) to avoid errors if data isn’t loaded yet.

    Runs .filter() on users array.
3. Filtering Logic:

user.username.toLowerCase().includes(debouncedFilter.toLowerCase())

    Converts both the username and the debouncedFilter to lowercase to make search case-insensitive.

    .includes() checks if username contains the search term.

4. Fallback with || []

|| []

If data?.users is undefined (for example, before data loads), it falls back to an empty array to avoid breaking the app.

5. Else: If input is empty

If the input is empty, we don't show any users:

: [];

  */

  // Use useMemo to optimize performance by memoizing the filtered users
  // This reduces the number of re-renders and API calls, improving performance.
  // what useMemo does is it returns a memoized value, which means it will only recompute the filtered users when debouncedFilter or data changes.
  // For example, if the user types "a", then "b", then "c " quickly, the filteredUsers will only be recomputed once after 300 milliseconds after the user stops typing.
  // This prevents unnecessary re-renders and API calls, improving performance.
  // this is a performance optimization technique that helps to avoid unnecessary computations and re-renders in React components.
  // it makes the app render faster and more efficiently by only recalculating the filtered users when necessary.
  const filteredUsers = useMemo(() => {
    return debouncedFilter.trim() !== ""
      ? data?.users?.filter(
          (user) =>
            user?.username &&
            user.username.toLowerCase().includes(debouncedFilter.toLowerCase())
        ) || []
      : [];
  }, [debouncedFilter, data]);

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      console.log("Chat created successfully:", data);
      // Optionally, you can update the UI or redirect the user after creating the chat
      alert(` ${data.createChat.chat_name} created successfully!`);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });

  const handleUserClick = async (userId, username) => {
    if (authUserInfo.user?.userId === userId) {
      alert("You cannot create a chat with yourself.");
      return;
    }

    // Check if chat already exists
    console.log(authUserInfo);
    const existChat = authUserInfo.selectedChats.find(
      (chat) =>
        chat.users.some((user) => user._id === userId) &&
        chat.users.some((user) => user._id === authUserInfo.user?.userId)
    );

    if (existChat) {
      alert("Chat already exists.");
      return;
    }

    try {
      const { data: mutationData } = await createChat({
        variables: {
          chat_name: `${authUserInfo.user?.username} & ${username}`,
          users: [userId],
        },
        refetchQueries: [
          {
            query: GET_CHATS_BY_USER,
            variables: {
              userId: authUserInfo.user?.userId || authUserInfo.user?._id,
            },
          }, // Refetch chats for the current user
        ],
      });
      // console.log("Chat created:", mutationData);
      updateSelectedChat(mutationData.createChat);
      console.log("Selected chat updated:", authUserInfo);
      return mutationData.createChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt="4"
      p="4"
      bg="white"
      borderRadius="lg"
      boxShadow="md"
    >
      <Input
        placeholder="Search users..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        mb="4"
        borderColor="gray.300"
      />

      <VStack spacing={3} align="stretch">
        {debouncedFilter ? (
          filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Box
                key={user._id}
                p="3"
                borderWidth="1px"
                borderRadius="md"
                bg="gray.200"
                _hover={{ bg: "teal.100", cursor: "pointer" }}
                onClick={() => handleUserClick(user._id, user.username)}
              >
                <Text
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {user.username}
                  <span
                    style={{
                      marginLeft: "4px",
                      fontSize: "0.7em",
                      alignSelf: "flex-end",
                    }}
                  >
                    {/* {user.isOnline ? "🟢" : "🔴"} */}
                    <div className="status-indicator">
                      <span
                        className={`dot ${user.isOnline ? "online" : "offline"}`}
                      ></span>
                      <span className="status-text">
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </span>
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {user.user_email}
                </Text>
              </Box>
            ))
          ) : (
            <Text textAlign="center">No users found.</Text>
          )
        ) : (
          <Text textAlign="center" color="gray.500">
            Type to search users.
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export default UserList;
