import { io } from "socket.io-client";

let socket;

export const initiateSocketConnection = () => {
  console.log("Connecting socket...");
  socket = io(process.env.REACT_APP_SERVER_URL);
  console.log("Socket connected!");
  return socket;
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
  console.log("Socket disconnected");
};
