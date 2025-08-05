import { io } from "socket.io-client";
// this file is used to create a Socket.IO client instance
// and export it for use in other parts of the application
// so that we can use it in our components
const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3001"
  , {
  transports: ["websocket"], // Fast WebSocket-only connections
  reconnection: true, // Auto-reconnect
  autoConnect: false, // Manual connect later when user exists
});
export default socket;
