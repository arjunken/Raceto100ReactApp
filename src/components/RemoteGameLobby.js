import { Alert, Button, Divider, Paper, Snackbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import InviteCard from "./InviteCard";
import AppContainer from "../layouts/AppContainer";
import PlayersContext from "../store/players-context";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import _ from "lodash";
// import SocketContext from "../store/socket-context";
import PageLoading from "../layouts/PageLoading";
import { inviteMaxJoins, nanoid } from "../globalVariables";
import { Invite } from "../classes/Invite";
import { checkHasInvite, ColRefInv, deleteMyInvite, getMyInvite } from "../firebase";
import { onSnapshot } from "@firebase/firestore";

const RemoteGameLobby = () => {
  // const navigate = useNavigate();
  const playerCtx = useContext(PlayersContext);
  const player = _.pick(playerCtx.players[0], ["data", "gameSessionData"]);
  const [myGameInvite, setMyGameInvite] = useState(null);
  const [privateInvites, setPrivateInvites] = useState([]);
  const [playInProgress, setPlayInProgress] = useState(false);
  const [showLoading, setShowLoading] = useState([false]);
  const swalert = withReactContent(Swal);
  const [openSBAlert, setOpenSBAlert] = useState({
    myInviteExpiry: false,
    newJoin: false,
    inviteCancelled: false,
  });

  useEffect(() => {
    setShowLoading([true, "Loading your current Invites..."]);
    //Check if there are existing invites and display them
    checkHasInvite().then((docSnap) => {
      if (docSnap.exists()) {
        setPlayInProgress(docSnap.data().hasInvite);
        getMyInvite().then((data) => {
          if (data) {
            setMyGameInvite(data);
          }
          setShowLoading([false]);
        });
      }
    });
  }, []);

  //Run UseEffect for listening to the new invites from Firebase invites collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      ColRefInv,
      (snapshot) => {
        const invites = [];
        console.log(snapshot);
        snapshot.forEach((doc) => {
          invites.push(doc.data());
        });
        setPrivateInvites((prevInvites) => {});
      },
      (error) => {
        console.error("There was an error in getting the current invites from other players:", error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  //Handler for creating new invites
  const createMyGameInviteHandler = () => {
    swalert
      .fire({
        title: "New Invite",
        text: "This will create a new game invite and unique joining code that you can share with your friends",
        iconHtml: '<img src="/images/invite.png" />',
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yeh! Let's Go!",
        customClass: {
          icon: "no-border",
        },
      })
      .then((result) => {
        if (result.isConfirmed) {
          const inviteId = nanoid(6);
          setPlayInProgress(true);
          const invite = new Invite(inviteId, player);
          setMyGameInvite(invite);
          invite
            .publish()
            .then(() => {
              console.log("Invite has been published!");
            })
            .catch((ex) => {
              console.error("Error publishing the invite", ex.message);
            });
        }
      });
  };

  //Handler for cancelling the event
  const cancelMyGameInviteHandler = () => {
    swalert
      .fire({
        title: "Are you sure?",
        text: "Your invite will be cancelled and the people in waiting room will be informed. You won't be able to revert this action!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          deleteMyInvite(myGameInvite.id)
            .then(() => {
              console.log("Your invite has been deleted!");
            })
            .catch((ex) => {
              console.error("Error deleting your invite", ex.message);
            });
          setMyGameInvite(null);
          setPlayInProgress(false);
        } else {
          console.log("you're good");
        }
      })
      .catch((ex) => {
        console.error("Error in cancelling the invite:", ex.message);
      });
  };

  //Handlers for invites expiry
  const myGameInviteExpiryHandler = (inviteId) => {
    // setMyGameInvite(null);
    // socket.emit("removeActiveInvite", socketId);
    setPlayInProgress(false);
    setOpenSBAlert({ ...openSBAlert, myInviteExpiry: true });
  };

  const privateInvitesExpiryHandler = (socketId) => {
    setPrivateInvites((preInvites) => {
      return preInvites.filter((invite) => {
        return invite.socketId !== socketId;
      });
    });
    // socket.emit("removeActiveInvite", socketId);
  };

  //Handle invitation joining
  const joinInviteHandler = async (invite) => {
    // const { value: code } = await Swal.fire({
    //   title: "Enter Joining Code",
    //   input: "text",
    //   inputLabel: "Code",
    //   inputPlaceholder: "Enter joining code",
    //   showCancelButton: true,
    //   inputAttributes: {
    //     maxlength: 10,
    //     autocapitalize: "off",
    //     autocorrect: "off",
    //   },
    //   inputValidator: (value) => {
    //     if (!value) {
    //       return "You need to write something!";
    //     }
    //     if (value !== invite.gameId) {
    //       return "Invalid Code!";
    //     }
    //   },
    // });

    // if (code) {
    //   setShowLoading([true, "Please wait while the remote player the start the game session...", quitJoinWaitHandler]);
    //   setTimeout(() => {
    //     setShowLoading([false, ""]);
    //   }, 5000);
    // }
    console.log("Requesting server to join invitation...");
    setShowLoading(true, "Please wait while the remote player the start the game session...", quitJoinWaitHandler);
  };

  //Handler for the button on pageloading - waiting for game to start
  const quitJoinWaitHandler = () => {
    // socket.emit("quit_join_wait", playerCurrentRoom, (res) => {
    //   if (res) {
    //     setShowLoading(false);
    //     setPlayerCurrentRoom(null);
    //   }
    // });
  };

  return (
    <AppContainer>
      <Paper sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3, width: { xs: "100%", md: "80%" } }}>
        <Box sx={{ display: "inline-flex", alignItems: "end", gap: 1 }}>
          <img src="/gifs/gameroom.gif" alt="gameroom logo" style={{ padding: "auto" }} />
          <Typography variant="subtitle1">Game Lobby</Typography>
          {!playInProgress ? (
            <Button type="submit" variant="contained" onClick={createMyGameInviteHandler} sx={{ fontSize: "1rem", ml: "auto" }}>
              New Invite
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              onClick={cancelMyGameInviteHandler}
              sx={{ fontSize: "1rem", ml: "auto", backgroundColor: "#edae49" }}
            >
              Cancel Invite
            </Button>
          )}
        </Box>

        <Divider sx={{ width: "100%", my: 1 }} />
        <Typography variant="subtitle1" sx={{ mx: "auto" }}>
          My Invite
        </Typography>
        {myGameInvite ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
            <InviteCard
              key={myGameInvite.id}
              invite={myGameInvite}
              joiningCode={myGameInvite.id}
              expiryHandlerSelf={() => myGameInviteExpiryHandler(myGameInvite.id)}
            />
          </Box>
        ) : (
          <Alert severity="info" sx={{ mx: "auto" }}>
            There are no invites from you. Create an invite.
          </Alert>
        )}

        <Divider sx={{ width: "70%", mx: "auto" }} />
        <Typography variant="subtitle1" sx={{ mx: "auto" }}>
          Invites from Others
        </Typography>
        {_.isEmpty(privateInvites) ? (
          <Alert severity="info" sx={{ mx: "auto" }}>
            There are no invites from others. Wait for someone to invite.
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
            {privateInvites.map((invite) => {
              return (
                <InviteCard
                  key={invite.socketId}
                  invite={invite}
                  roomSize={invite.curRoomSize}
                  maxJoins={invite.maxJoins}
                  myGameInvite={myGameInvite}
                  expiryHandlerOthers={() => privateInvitesExpiryHandler(invite.socketId)}
                  joinInviteHandler={() => joinInviteHandler(invite)}
                />
              );
            })}
          </Box>
        )}

        {/* <Button variant="contained" onClick={() => navigate("/gamerobo")}>
          Click to Play
        </Button> */}
      </Paper>
      {/* Render alerts and page loading */}
      {showLoading && <PageLoading showLoading={showLoading[0]} msg={showLoading[1]} actionBtn={showLoading[2]} />}
      {/* Snackbar Alerts */}
      <Snackbar open={openSBAlert.myGameInvite} autoHideDuration={6000} onClose={() => setOpenSBAlert({ ...openSBAlert, myInviteExpiry: true })}>
        <Alert onClose={() => setOpenSBAlert({ ...openSBAlert, myInviteExpiry: true })} severity="info" sx={{ width: "100%" }}>
          Your invite expired!
        </Alert>
      </Snackbar>
      <Snackbar open={openSBAlert.newJoin} autoHideDuration={6000} onClose={() => setOpenSBAlert({ ...openSBAlert, newJoin: false })}>
        <Alert onClose={() => setOpenSBAlert({ ...openSBAlert, newJoin: false })} severity="success" sx={{ width: "100%" }}>
          Someone joined your invite! Start the game.
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSBAlert.inviteCancelled}
        autoHideDuration={6000}
        onClose={() => setOpenSBAlert({ ...openSBAlert, inviteCancelled: false })}
      >
        <Alert onClose={() => setOpenSBAlert({ ...openSBAlert, inviteCancelled: false })} severity="warning" sx={{ width: "100%" }}>
          The player cancelled the invite!
        </Alert>
      </Snackbar>
    </AppContainer>
  );
};

export default RemoteGameLobby;
