import { doc, onSnapshot } from "@firebase/firestore";
import { Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { colRefInv } from "../firebase";
import AppContext from "../store/app-context";

const WaitingRoom = ({ joiners }) => {
  // const appDataCtx = useContext(AppContext);
  // const [joiners, setJoiners] = useState(0);

  // useEffect(() => {
  //   const unsub_listner3 = onSnapshot(
  //     doc(colRefInv, inviteId),
  //     (doc) => {
  //       setJoiners(doc.data().room.length);
  //       appDataCtx.setData("roomsize", doc.data().room.length);
  //     },
  //     (error) => {
  //       console.error("There was an error in getting number of joiners:", error.message);
  //     }
  //   );
  //   return () => {
  //     unsub_listner3();
  //   };
  // }, []);

  return (
    <>
      {joiners > 1 ? (
        <Typography variant="caption">{joiners - 1} person joined!</Typography>
      ) : (
        <Typography variant="caption">No one joined yet!</Typography>
      )}
    </>
  );
};

export default WaitingRoom;
