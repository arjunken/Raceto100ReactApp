import { Alert, Button, Divider, Paper, Snackbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext } from "react";
import { useEffect } from "react";
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
import { auth, colRefP } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const RemoteGameLobby = () => {
  // const navigate = useNavigate();
  const playerCtx = useContext(PlayersContext);
  const player = _.pick(playerCtx.players[0], ["data", "gameSessionData"]);
  const [myGameInvite, setMyGameInvite] = useState(null);
  const [playerCurrentRoom, setPlayerCurrentRoom] = useState(null);
  const [privateInvites, setPrivateInvites] = useState([]);
  const [playInProgress, setPlayInProgress] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const swalert = withReactContent(Swal);
  // const socketCtx = useContext(SocketContext);
  // const socket = socketCtx.socket;
  const [openSBAlert, setOpenSBAlert] = useState({
    myInviteExpiry: false,
    newJoin: false,
    inviteCancelled: false,
  });

  const hasInvite = async () => {
    const docSnap = await getDoc(doc(colRefP, auth.currentUser.uid));
    if (docSnap.exists()) {
      setPlayInProgress(docSnap.data().hasInvite);
    }
  };

  useEffect(() => {
    hasInvite();
  }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("newPrivateInvites", (invite) => {
  //       invite.socketId !== socket.id && setPrivateInvites((existingInvites) => [...existingInvites, invite]);
  //     });

  //     socket.on("invite_cancelled_update_invites", (socketId) => {
  //       setPrivateInvites(
  //         privateInvites.filter((invite) => {
  //           return invite.socketId !== socketId;
  //         })
  //       );
  //     });

  //     socket.on("activeInvites", (invites) => {
  //       setPrivateInvites((preInvites) => [...preInvites, ...invites]);
  //     });

  //     socket.on("player_exited", (socketId) => {
  //       setPrivateInvites(
  //         privateInvites.filter((invite) => {
  //           invite.curRoomSize--;
  //           return invite.socketId !== socketId;
  //         })
  //       );
  //     });

  //     socket.on("totalJoins", (totalJoins) => {
  //       if (totalJoins > 0) {
  //         setOpenSBAlert({ ...openSBAlert, newJoin: true });
  //       }
  //     });

  //     socket.on("invite_cancelled_show_alerts", () => {
  //       setOpenSBAlert({ ...openSBAlert, inviteCancelled: true });
  //     });

  //     socket.on("connect_error", (err) => {
  //       if (err.code === 0) {
  //         console.error("Error: Can't establish connection with the server. Check your network connection");
  //       }
  //     });
  //     return () => {
  //       socket.off("newPrivateInvites");
  //       socket.off("activeInvites");
  //       socket.off("player_exited");
  //       socket.off("invite_cancelled_update_invites");
  //       socket.off("invite_cancelled_show_alerts");
  //       socket.off("connect_error");
  //     };
  //   }
  // }, [socket, privateInvites, openSBAlert]);

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
          // player.socketId = socket.id;
          setMyGameInvite(player);
          // socket.emit("newInvite", player);
          setPlayInProgress(true);
          const invite = new Invite(inviteId, player);

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
          setMyGameInvite(null);
          // socket.emit("cancel_invite", (res) => {
          //   if (res) {
          //     console.log("Your invitation successfully cancelled!");
          //   } else {
          //     console.error("Error in cancelling your invite");
          //   }
          // });
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
  const myGameInviteExpiryHandler = (socketId) => {
    setMyGameInvite(null);
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
    //   setShowLoading([true, "Please wait while the remote player the start the game session..."]);
    //   setTimeout(() => {
    //     setShowLoading([false, ""]);
    //   }, 5000);
    // }
    console.log("Requesting server to join invitation...");
    setShowLoading(true);
    // socket.emit("joinInvite", invite.socketId, invite.gameId, invite.maxJoins, (res) => {
    //   if (res) {
    //     setPrivateInvites(
    //       privateInvites.map((item) => {
    //         if (item.socketId === invite.socketId) {
    //           return { ...item, curRoomSize: invite.curRoomSize + 1 };
    //         } else {
    //           return item;
    //         }
    //       })
    //     );
    //     setPlayerCurrentRoom(res);
    //   }
    // });
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
              key={myGameInvite.socketId}
              invite={myGameInvite}
              joiningCode={myGameInvite.gameId}
              expiryHandlerSelf={() => myGameInviteExpiryHandler(myGameInvite.socketId)}
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
      {showLoading && (
        <PageLoading
          showLoading={showLoading}
          msg="Please wait while the remote player the start the game session..."
          actionBtn={quitJoinWaitHandler}
        />
      )}
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
