import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"], // Fast WebSocket-only connections
  reconnection: true, // Auto-reconnect
  autoConnect: false, // Manual connect later when user exists
});
export default socket;
