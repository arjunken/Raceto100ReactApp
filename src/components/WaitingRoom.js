import { Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import SocketContext from "../store/socket-context";

const WaitingRoom = () => {
  const [personWaiting, setPersonWaiting] = useState(null);
  const socket = useContext(SocketContext).socket;

  useEffect(() => {
    if (socket) {
      socket.on("totalJoins", (totalJoins) => {
        setPersonWaiting(totalJoins);
      });
    }
    return () => {
      socket.off("totalJoins");
    };
  }, [socket, personWaiting]);

  return (
    <>
      {personWaiting ? (
        <Typography variant="caption">{personWaiting} person joined!</Typography>
      ) : (
        <Typography variant="caption">No one joined yet!</Typography>
      )}
    </>
  );
};

export default WaitingRoom;
