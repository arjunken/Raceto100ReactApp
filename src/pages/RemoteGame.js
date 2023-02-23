import { useContext, useEffect } from "react";
import RemoteGameLobby from "../components/RemoteGameLobby";
import { getCurrentUserData } from "../firebase";
import { disconnectSocket, initiateSocketConnection } from "../socket.service";
import SocketContext from "../store/socket-context";

const RemoteGame = () => {
  const socketCtx = useContext(SocketContext);
  const fbAuth = localStorage.getItem("raceto100Auth");
  const socket = socketCtx.socket;

  useEffect(() => {
    if (fbAuth) {
      getCurrentUserData(fbAuth)
        .then((data) => {
          const skt = initiateSocketConnection();
          skt.auth = { user: data, token: fbAuth };
          socketCtx.setSocket(skt);
        })
        .catch((ex) => {
          console.error("Error getting user information:", ex.message);
        });
    } else {
      console.error("Error: User is not authenticated. Try after logging in.");
    }
    return () => {
      socketCtx.removeSocket();
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connection with server established!");
      });

      socket.on("session", (userId) => {
        // save the ID of the user
        socket.userId = userId;
      });

      socket.on("disconnect", () => {
        console.log("Server just got disconnected!");
      });

      socket.on("connect_error", (err) => {
        if (err.message === "not authorized") {
          console.error("Error: Player is not authenticated: Try again after logging in.");
        }
      });
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      };
    }
  }, [socket]);

  return (
    <div>
      <RemoteGameLobby />
    </div>
  );
};

export default RemoteGame;
