import { createContext, useState } from "react";

const SocketContext = createContext({
  socket: null,
  setSocket: (socket) => {},
  removeSocket: () => {},
});

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const setSocketHandler = (socket) => {
    setSocket(socket);
  };

  const removeSocketHandler = () => {
    setSocket(null);
  };

  const context = {
    socket: socket,
    setSocket: setSocketHandler,
    removeSocket: removeSocketHandler,
  };

  return <SocketContext.Provider value={context}> {children}</SocketContext.Provider>;
};

export { SocketContextProvider, SocketContext as default };
