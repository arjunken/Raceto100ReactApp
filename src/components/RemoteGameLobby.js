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
import PageLoading from "../layouts/PageLoading";
import { inviteMaxJoins, nanoid } from "../globalVariables";
import { Invite } from "../classes/Invite";
import { auth, ColRefInv, colRefP, deleteMyInvite, getMyInvite } from "../firebase";
import { doc, onSnapshot } from "@firebase/firestore";

const RemoteGameLobby = () => {
  // const navigate = useNavigate();
  const playerCtx = useContext(PlayersContext);
  const [currentUserData, setCurrentUserData] = useState(null);
  const player = _.pick(playerCtx.players[0], ["data", "gameSessionData"]);
  const [myGameInvite, setMyGameInvite] = useState(null);
  const userId = localStorage.getItem("raceto100Auth");
  const [privateInvites, setPrivateInvites] = useState([]);
  const [playInProgress, setPlayInProgress] = useState(false);
  const [showLoading, setShowLoading] = useState([false]);
  const [inviteDocId, setInviteDocId] = useState(null);
  const swalert = withReactContent(Swal);
  const [openSBAlert, setOpenSBAlert] = useState({
    myInviteExpiry: false,
    newJoin: false,
    inviteCancelled: false,
  });

  useEffect(() => {
    if (userId) {
      setShowLoading([true, "Loading your current Invites..."]);
      //Check if there are existing invites and display them
      getMyInvite(userId).then((data) => {
        if (data) {
          setPlayInProgress(true);
          setMyGameInvite(data);
        }
        setShowLoading([false]);
      });
    }
  }, []);

  //Run UseEffect for listening to the new invites from Firebase invites collection
  useEffect(() => {
    const unsub_listner1 = onSnapshot(
      doc(colRefP, userId),
      (doc) => {
        setCurrentUserData(doc.data());
        setInviteDocId(doc.data().privateData.inviteId[0]);
      },
      (error) => {
        console.error("There was an error in getting the current user data:", error.message);
        setCurrentUserData(null);
      }
    );

    const unsub_listner2 = onSnapshot(
      ColRefInv,
      (snapshot) => {
        let invites = [];
        // snapshot.forEach((doc) => {
        //   invites.push(doc.data());
        // });
        // setPrivateInvites(invites);
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setPrivateInvites((preInvites) => [...preInvites, change.doc.data()]);
          }
          if (change.type === "removed") {
            setPrivateInvites((preInvites) => {
              return preInvites.filter((item) => {
                return change.doc.data().id !== item.id;
              });
            });
          }
          if (change.type === "modified") {
            setPrivateInvites((preInvites) => {
              return preInvites.map((item) => {
                return item.id === change.doc.data().id;
              });
            });
          }
        });
      },
      (error) => {
        console.error("There was an error in getting the current invites from other players:", error.message);
      }
    );

    return () => {
      unsub_listner1();
      unsub_listner2();
    };
  }, []);

  // const exInviteId = currentUserDataCtx.currentUserData.privateData.inviteId[1];
  // const exJoiningCode = currentUserDataCtx.currentUserData.privateData.joiningCode;

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
          const inviteId = nanoid(10);
          const joiningCode = nanoid(6);
          setPlayInProgress(true);
          const invite = new Invite(inviteId, player);
          setMyGameInvite(invite);
          invite
            .publish(joiningCode)
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
          deleteMyInvite(inviteDocId)
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
  const myGameInviteExpiryHandler = (inviteDocId) => {
    setMyGameInvite(null);
    setPlayInProgress(false);
    deleteMyInvite(inviteDocId)
      .then(() => {
        console.log("Your invite has been deleted!");
      })
      .catch((ex) => {
        console.error("Error deleting your invite", ex.message);
      });
    setOpenSBAlert({ ...openSBAlert, myInviteExpiry: true });
  };

  const privateInvitesExpiryHandler = (inviteId) => {
    setPrivateInvites((preInvites) => {
      return preInvites.filter((invite) => {
        return invite.id !== inviteId;
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
              joiningCode={"fds4342"}
              expiryHandlerSelf={() => myGameInviteExpiryHandler(inviteDocId)}
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
              if (invite.invitedBy !== currentUserData.playerData.name) {
                return (
                  <InviteCard
                    key={invite.id}
                    invite={invite}
                    roomSize={1}
                    maxJoins={invite.maxJoins}
                    myGameInvite={myGameInvite}
                    expiryHandlerOthers={() => privateInvitesExpiryHandler(invite.id)}
                    joinInviteHandler={() => joinInviteHandler(invite)}
                  />
                );
              }
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
