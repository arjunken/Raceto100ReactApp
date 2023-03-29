import { Alert, Avatar, Button, Divider, Paper, Snackbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext, useEffect } from "react";
import { useState } from "react";
import InviteCard from "./InviteCard";
import AppContainer from "../layouts/AppContainer";
import PlayersContext from "../store/players-context";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import _ from "lodash";
import PageLoading from "../layouts/PageLoading";
import { nanoid } from "../globalVariables";
import { Invite } from "../classes/Invite";
import {
  addPlayerToGameRoom,
  ColRefInv,
  colRefP,
  deleteMyInvite,
  getMyInvite,
  removePlayerFromGameRoom,
  updateGameInSession,
} from "../firebase";
import { doc, onSnapshot } from "@firebase/firestore";
import LocalStorageContext from "../store/localStorage-context";
import AppContext from "../store/app-context";
import JoinedInviteCard from "./JoinedInviteCard";

const RemoteGameLobby = ({ startRemoteGame }) => {
  const playerCtx = useContext(PlayersContext);
  const localStorageCtx = useContext(LocalStorageContext);
  const appDataCtx = useContext(AppContext);
  const [currentUserData, setCurrentUserData] = useState(null);
  const player = _.pick(playerCtx.players[0], ["data.name", "data.avatarUrl", "gameSessionData"]);
  const [myGameInvite, setMyGameInvite] = useState(null);
  const userId = localStorageCtx.getData("raceto100AppData", "auth");
  const [privateInvites, setPrivateInvites] = useState([]);
  const [playInProgress, setPlayInProgress] = useState(false);
  const [showLoading, setShowLoading] = useState([false]);
  const [myGameInviteJoiners, setMyGameInviteJoiners] = useState(1);
  const [lastPlayerJoined, setLastPlayerJoined] = useState(null);
  const [lastInviteRemoved, setLastInviteRemoved] = useState(null);
  const [gameInSession, setGameInSession] = useState(false);
  const swalert = withReactContent(Swal);
  const targetScore = localStorageCtx.getData("raceto100Target", "target");
  const [openSBAlert, setOpenSBAlert] = useState({
    myInviteExpiry: false,
    newJoin: false,
    inviteCancelled: false,
    dropJoin: false,
  });
  //Load current user's Invite Id if it is available
  // const myInviteDocId = localStorageCtx.appData.get("raceto100AppData","openInvite");
  //Load the current user's invite
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
      },
      (error) => {
        console.error("There was an error in getting the current user data:", error.message);
        setCurrentUserData(null);
      }
    );

    const unsub_listner2 = onSnapshot(
      ColRefInv,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            setPrivateInvites((preInvites) => [...preInvites, change.doc.data()]);
          }
          if (change.type === "removed") {
            const myroom = _.findIndex(change.doc.data().room, { data: { name: player.data.name } });
            if (myroom > 0) {
              displaySBAlert({ ...openSBAlert, inviteCancelled: true });
            }
            setPrivateInvites((preInvites) => {
              return preInvites.filter((item) => {
                return change.doc.data().id !== item.id;
              });
            });
          }
          if (change.type === "modified") {
            //Listen to own invite changes
            if (change.doc.data().invitedBy === player.data.name) {
              if (change.doc.data().room.length > myGameInviteJoiners) {
                displaySBAlert({ ...openSBAlert, newJoin: true });
                setLastPlayerJoined(change.doc.data().room[1]);
              } else {
                displaySBAlert({ ...openSBAlert, dropJoin: true });
              }
              setMyGameInvite(change.doc.data());
              setMyGameInviteJoiners(change.doc.data().room.length);
            }

            //Store the invite in local user context
            if (change.doc.data().room.length > myGameInviteJoiners) {
              appDataCtx.setData("joinedInvite", change.doc.data());
            }

            //Listen to the invite changes that the player joined
            if (change.doc.data().room.length > 1 && change.doc.data().room[1].data.name === player.data.name) {
              if (change.doc.data().isGameInSession) {
                initiateRemoteGameHandler(change.doc.data());
              }
            }

            setPrivateInvites((preInvites) => {
              return preInvites.map((item) => {
                if (item.id !== change.doc.data().id) {
                  return item;
                } else {
                  return change.doc.data();
                }
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

  //function to display alert
  const displaySBAlert = (msgObj) => {
    setOpenSBAlert(msgObj);
  };

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
          const inviteId = nanoid(20);
          const joiningCode = nanoid(6);
          setPlayInProgress(true);
          const invite = new Invite(inviteId, player, targetScore);
          invite
            .publish(joiningCode)
            .then(() => {
              console.log("Invite has been published!");
              setMyGameInvite(invite);
              //Store the flag in the context to tell other components that there is a open invite
              localStorageCtx.setData("raceto100AppData", "openInvite", inviteId);
            })
            .catch((ex) => {
              console.error("Error publishing the invite", ex.message);
            });
        }
      });
  };

  //Handler for cancelling the event
  const cancelMyGameInviteHandler = (inviteId) => {
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
      .then((result) => {
        if (result.isConfirmed) {
          deleteMyInvite(inviteId)
            .then(() => {
              console.log("Your invite has been deleted!");
              setMyGameInvite(null);
              setPlayInProgress(false);
              setMyGameInviteJoiners(1);
              localStorageCtx.setData("raceto100AppData", "openInvite", null);
            })
            .catch((ex) => {
              console.error("Error deleting your invite", ex.message);
            });
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
    if (myGameInviteJoiners > 1) {
      setMyGameInvite(null);
      setPlayInProgress(false);
      deleteMyInvite(inviteId)
        .then(() => {
          console.log("Your invite has been deleted!");
        })
        .catch((ex) => {
          console.error("Error deleting your invite", ex.message);
        });
      displaySBAlert({ ...openSBAlert, myInviteExpiry: true });
      //clear the flag in the context to
      localStorageCtx.setData("raceto100AppData", "openInvite", null);
    }
  };

  const privateInvitesExpiryHandler = (inviteId) => {
    setPrivateInvites((preInvites) => {
      return preInvites.filter((invite) => {
        return invite.id !== inviteId;
      });
    });
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
    setShowLoading([true, "Please wait while the remote player start the game session...", () => quitJoinWaitHandler(invite)]);
    setLastInviteRemoved(invite);
    addPlayerToGameRoom(invite, player)
      .then(() => {
        console.log("Successfully joined an invite");
      })
      .catch((ex) => {
        console.error("Error joining an invite:", ex.message);
      });
  };

  //Handler for the button on pageloading - waiting for game to start
  const quitJoinWaitHandler = (invite) => {
    setShowLoading([false]);
    removePlayerFromGameRoom(invite, player)
      .then(() => {
        console.log("Successfully removed from the invite");
      })
      .catch((ex) => {
        console.error("Error removing player from an invite:", ex.message);
      });
  };

  //Handler for starting remote game invited by me
  const initiateMyRemoteGameHandler = (inviteId) => {
    if (myGameInviteJoiners) {
      updateGameInSession(inviteId)
        .then(() => {
          //Flushout previously stored sessions in the context store
          playerCtx.resetPlayers();
          //add players into the context store
          playerCtx.addPlayer(myGameInvite.room[0]);
          playerCtx.addPlayer(myGameInvite.room[1]);
          startRemoteGame();
        })
        .catch((ex) => {
          console.error("Error updating GameInSession flag:", ex.message);
        });
    }
  };

  //Handler for starting remote game invited by other players
  const initiateRemoteGameHandler = (invite) => {
    setShowLoading([false]);
    playerCtx.resetPlayers();
    //add players into the context store
    playerCtx.addPlayer(invite.room[0]);
    playerCtx.addPlayer(invite.room[1]);
    startRemoteGame();
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
              onClick={() => cancelMyGameInviteHandler(myGameInvite.id)}
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
            {myGameInviteJoiners > 1 ? (
              <JoinedInviteCard invite={myGameInvite} initiateMyRemoteGame={() => initiateMyRemoteGameHandler(myGameInvite.id)} />
            ) : (
              <InviteCard
                key={myGameInvite.id}
                invite={myGameInvite}
                joiners={myGameInviteJoiners}
                joiningCode={"fds4342"}
                initiateMyRemoteGame={() => initiateMyRemoteGameHandler(myGameInvite.id)}
                expiryHandlerSelf={() => myGameInviteExpiryHandler(myGameInvite.id)}
              />
            )}
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
                if (invite.room.length > 1) {
                  return <JoinedInviteCard invite={invite} />;
                } else {
                  return (
                    <InviteCard
                      key={invite.id}
                      invite={invite}
                      roomSize={invite.room.length}
                      maxJoins={invite.maxJoins}
                      myGameInvite={myGameInvite}
                      expiryHandlerOthers={() => privateInvitesExpiryHandler(invite.id)}
                      joinInviteHandler={() => joinInviteHandler(invite)}
                    />
                  );
                }
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
      <Snackbar
        open={openSBAlert.myInviteExpiry}
        autoHideDuration={6000}
        onClose={() => setOpenSBAlert({ ...openSBAlert, myInviteExpiry: false })}
      >
        <Alert onClose={() => setOpenSBAlert({ ...openSBAlert, myInviteExpiry: false })} severity="info" sx={{ width: "100%" }}>
          Your invite expired!
        </Alert>
      </Snackbar>
      <Snackbar open={openSBAlert.newJoin} autoHideDuration={6000} onClose={() => setOpenSBAlert({ ...openSBAlert, newJoin: false })}>
        <Alert onClose={() => setOpenSBAlert({ ...openSBAlert, newJoin: false })} severity="success" sx={{ width: "100%" }}>
          {myGameInviteJoiners > 1 && (
            <Box sx={{ display: "flex", gap: 2, flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Avatar
                alt="avatar"
                src={myGameInvite.room[1].data.avatarUrl}
                sx={{ width: 56, height: 56, borderRadius: "50px" }}
                variant="square"
              />
              <Typography>{myGameInvite.room[1].data.name} accepted your invite! Start the game.</Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSBAlert.inviteCancelled}
        autoHideDuration={6000}
        onClose={() => {
          setOpenSBAlert({ ...openSBAlert, inviteCancelled: false });
          setLastInviteRemoved(null);
          setShowLoading(false);
        }}
      >
        <Alert
          onClose={() => {
            setOpenSBAlert({ ...openSBAlert, inviteCancelled: false });
            setLastInviteRemoved(null);
            setShowLoading(false);
          }}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {lastInviteRemoved && (
            <Box sx={{ display: "flex", gap: 2, flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Avatar
                alt="avatar"
                src={lastInviteRemoved.room[0].data.avatarUrl}
                sx={{ width: 56, height: 56, borderRadius: "50px" }}
                variant="square"
              />
              <Typography>{lastInviteRemoved.invitedBy} cancelled the invite! Join another invite</Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSBAlert.dropJoin}
        autoHideDuration={6000}
        onClose={() => {
          setOpenSBAlert({ ...openSBAlert, dropJoin: false });
          setLastPlayerJoined(null);
        }}
      >
        <Alert
          onClose={() => {
            setOpenSBAlert({ ...openSBAlert, dropJoin: false });
            setLastPlayerJoined(null);
          }}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {lastPlayerJoined && (
            <Box sx={{ display: "flex", gap: 2, flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Avatar alt="avatar" src={lastPlayerJoined.data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
              <Typography>{lastPlayerJoined.data.name} dropped your invite! Wait for another player to accept.</Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
    </AppContainer>
  );
};

export default RemoteGameLobby;
