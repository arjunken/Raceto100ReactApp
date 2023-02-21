import { useContext, useEffect, useState } from "react";
import RemoteGameLobby from "../components/RemoteGameLobby";
import { disconnectSocket, initiateSocketConnection } from "../socket.service";
import SocketContext from "../store/socket-context";

const RemoteGame = (props) => {
  const socketCtx = useContext(SocketContext);

  useEffect(() => {
    socketCtx.setSocket(initiateSocketConnection());
    return () => {
      socketCtx.removeSocket();
      disconnectSocket();
    };
  }, []);

  return (
    <div>
      <RemoteGameLobby />
    </div>
  );
};

export default RemoteGame;
