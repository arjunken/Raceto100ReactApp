import { Avatar, Button, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { signOut } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Player } from "../classes/Player";
import Navigation from "../components/Navigation";
import PlayOptions from "../components/PlayOptions";
import { auth, colRefP, deleteMyInvite } from "../firebase";
import AppContainer from "../layouts/AppContainer";
import PlayersContext from "../store/players-context";
import { useNavigate } from "react-router-dom";
import { default_registered_gameMode, globalVariables } from "../globalVariables";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import EditProfile from "../components/EditProfile";
import PlayerStats from "../components/PlayerStats";
import { doc, onSnapshot } from "@firebase/firestore";
import LocalStorageContext from "../store/localStorage-context";

const Profile = () => {
  const [currentUserData, setCurrentUserData] = useState(null);
  const [playOptionsToggle, setplayOptionsToggle] = useState(true);
  const [mode, setMode] = useState(default_registered_gameMode);
  const playerCtx = useContext(PlayersContext);
  const localStorageCtx = useContext(LocalStorageContext);
  const navigate = useNavigate();
  const userId = localStorageCtx.getData("raceto100AppData", "auth");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const swalert = withReactContent(Swal);

  //Signout handler
  const logoutHandler = () => {
    const openInvite = localStorageCtx.getData("raceto100AppData", "openInvite");
    const proceedSigningOut = () => {
      signOut(auth)
        .then(() => {
          setCurrentUserData(null);
          localStorageCtx.clearData("raceto100AppData");
          console.log("User has signed out!");
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("Error signing out the user:", err.message);
        });
    };
    if (openInvite) {
      swalert
        .fire({
          title: "Delete Invite",
          text: "You have an open invite. Signing out will delete the invite. Do you still want to continue?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        })
        .then((result) => {
          if (result.isConfirmed) {
            deleteMyInvite(openInvite)
              .then(() => {
                console.log("Your invite has been deleted!");
                proceedSigningOut();
              })
              .catch((ex) => {
                console.error("Error deleting your invite", ex.message);
              });
          }
        })
        .catch((ex) => {
          console.error("Error in deleting the invite:", ex.message);
        });
    } else {
      proceedSigningOut();
    }
  };

  //Get current user Data
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(colRefP, userId),
      (doc) => {
        setCurrentUserData(doc.data().playerData);
      },
      (error) => {
        console.error("There was an error in getting the current user data:", error.message);
        setCurrentUserData(null);
        logoutHandler();
      }
    );
    return () => unsubscribe();
  }, [userId]);

  //Handle play button
  const playHandler = () => {
    setplayOptionsToggle(!playOptionsToggle);
  };

  const goBtnHandler = () => {
    if (mode == 1) {
      //Flushout previously stored sessions in the context store
      playerCtx.resetPlayers();
      //add player into the context store
      const player1 = new Player(currentUserData.name);
      player1.data.isRegistered = true;
      player1.data.avatarUrl = currentUserData.avatarUrl;
      playerCtx.addPlayer(player1);
      //Get the second player
      const player2 = new Player(globalVariables.ROBOT_SHORTNAME);
      player2.data.avatarUrl = "/avatars/shakuni.jpeg";
      player2.data.isRegistered = true;
      //add the second player into the context store
      playerCtx.addPlayer(player2);
      navigate("/gamerobo");
    } else {
      // swalert.fire("Coming up..", "Remote Player option is currently not supported. Check this option in the future.", "info");
      const player = new Player(currentUserData.name);
      player.data.avatarUrl = currentUserData.avatarUrl;
      //Flushout previously stored sessions in the context store
      playerCtx.resetPlayers();
      //add player into the context store
      playerCtx.addPlayer(player);
      //Send the player1 game server
      navigate("/remotegame");
    }
  };

  //Handle play options
  const playOptionsToggleHandler = (e) => {
    setMode(e.target.value);
  };

  //Handle Taget Score
  const handleTargetScore = (e) => {
    localStorageCtx.setItem("raceto100Target", "target", e.target.value);
  };

  return (
    <AppContainer>
      <Navigation />
      <Box sx={{ backgroundColor: "white", p: 1, width: { xs: "100%", md: "80%" }, borderRadius: "5px" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 2, width: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {currentUserData ? currentUserData.name : ""}
          </Typography>
          {showEditProfile ? (
            <>
              <Button type="button" variant="text" onClick={() => setShowEditProfile(false)} sx={{ ml: "auto" }}>
                Back to Profile
              </Button>
            </>
          ) : (
            <Button type="button" variant="text" onClick={() => setShowEditProfile(!showEditProfile)} sx={{ ml: "auto" }}>
              Edit Profile
            </Button>
          )}
          <Button type="button" variant="text" onClick={logoutHandler}>
            Logout
          </Button>
          <Button onClick={() => setShowEditProfile(!showEditProfile)}>
            <Avatar
              alt="avatar"
              src={currentUserData ? currentUserData.avatarUrl : ""}
              sx={{ width: 56, height: 56, borderRadius: "50px" }}
              variant="rounded"
            />
          </Button>
        </Box>
        <Divider />

        {!showEditProfile ? (
          <>
            <Box sx={{ p: 2, width: { md: "40%", xs: "90%" }, m: "auto", textAlign: "center" }}>
              <Button type="submit" variant="contained" onClick={playHandler} sx={{ mb: 2, fontSize: "1.5rem", p: 0, width: "30%" }}>
                {playOptionsToggle ? "Play" : "Close"}
              </Button>
              {!playOptionsToggle && <PlayOptions options={playOptionsToggleHandler} mode={mode} goBtnAction={goBtnHandler} />}
            </Box>
            <PlayerStats currentUserData={currentUserData} showEditProfile={setShowEditProfile} />
          </>
        ) : (
          <EditProfile currentUserData={currentUserData} logoutHandler={logoutHandler} />
        )}
      </Box>
    </AppContainer>
  );
};

export default Profile;
