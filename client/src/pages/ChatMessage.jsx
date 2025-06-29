import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_CHAT_MESSAGES } from '../utils/queries';
import auth from '../utils/auth';

function ChatMessage({ chatId }) {
    const { loading, error, data } = useQuery(GET_CHAT_MESSAGES, {
      variables: { chatId: "685caf0ef813de2ee4e87b81" },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;




    if(auth.loggedIn()) {
        console.log("User ID:", auth.getProfile().data._id);
    }

    return (
        <div>
            <p>Chat message content goes here</p>
            
        </div>
    );
}

export default ChatMessage;
/*
To display the sender from the first message in the data, you can access:
data.messages[0].sender.username (or any other sender property)
*/

{/* Example: Display sender username and profile picture from the first message */}
