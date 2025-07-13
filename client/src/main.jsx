import ReactDOM from "react-dom/client";
import App from "./App";

import Homepage from "./pages/Homepage";
import ChatPage from "./pages/ChatPage";
import ChatMessage from "./pages/ChatMessage";
import MyChat from "./pages/MyChat";
import Error from "./pages/Error";
import ProfileSetting from "./pages/ProfileSetting";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";



import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "/mychat/:userId",
        element: <ChatPage />,
      },
      {
        path: "/mychat/:chatId",
        element: <MyChat />,
      },
      {
        path: "/mychat/:userId/:chatId",
        element: <ChatMessage />,
      },
      {
        path: "/settings/:userId",
        element: <ProfileSetting />,
      },
 

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider value={defaultSystem}>
    <RouterProvider router={router} />
  </ChakraProvider>
);

//ReactDOM.createRoot(document.getElementById('root')).render(<App />);
