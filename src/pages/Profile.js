import { Avatar, Button, Divider, Slider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Player } from "../classes/Player";
import Navigation from "../components/Navigation";
import PlayOptions from "../components/PlayOptions";
import ProfileCard from "../components/ProfileCard";
import { auth, colRefP, db } from "../firebase";
import AppContainer from "../layouts/AppContainer";
import PlayersContext from "../store/players-context";
import { useNavigate } from "react-router-dom";
import { globalVariables } from "../globalVariables";
import swal from "sweetalert";

const Profile = () => {
  const [currentUserData, setCurrentUserData] = useState(null);
  const [playOptionsToggle, setplayOptionsToggle] = useState(true);
  const [mode, setMode] = useState("1");
  const playerCtx = useContext(PlayersContext);
  const navigate = useNavigate();
  const userId = localStorage.getItem("raceto100Auth");
  const targetScore = localStorage.getItem("raceto100Target");

  //Function to get data
  const getCurrentUserData = async () => {
    const docRef = doc(db, "players", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCurrentUserData(docSnap.data());
    } else {
      setCurrentUserData(null);
    }
  };

  useEffect(() => {
    if (userId) {
      getCurrentUserData();
    } else {
      setCurrentUserData(null);
    }
  }, []);

  const logoutHandler = () => {
    signOut(auth)
      .then(() => {
        setCurrentUserData(null);
        localStorage.removeItem("raceto100Auth");
        console.log("User has signed out!");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("Error signing out the user:", err.message);
      });
  };

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
      playerCtx.addPlayer(player1);
      //Get the second player
      const player2 = new Player(globalVariables.ROBOT_SHORTNAME);
      player2.data.avatarUrl = "/avatars/shakuni.jpeg";
      player2.data.isRegistered = true;
      //add the second player into the context store
      playerCtx.addPlayer(player2);
      navigate("/gamerobo");
    } else {
      swal("Oh! You like to play with Remote Players?", "Your interest recorded. It will be available in the future.");
    }
  };

  //Handle play options
  const playOptionsToggleHandler = (e) => {
    setMode(e.target.value);
  };

  //Handle Taget Score
  const handleTargetScore = (e) => {
    localStorage.setItem("raceto100Target", e.target.value);
  };

  return (
    <AppContainer>
      <Navigation />
      <Box sx={{ backgroundColor: "white", p: 1, width: { xs: "100%", md: "80%" }, borderRadius: "5px" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 2, width: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {currentUserData ? currentUserData.name : ""}
          </Typography>
          <Button type="button" variant="text" sx={{ ml: "auto" }}>
            Edit Profile
          </Button>
          <Button type="button" variant="text" onClick={logoutHandler}>
            Logout
          </Button>
          <Avatar alt="avatar" src={currentUserData ? currentUserData.avatarUrl : ""} sx={{ width: 56, height: 56 }} variant="square" />
        </Box>
        <Divider />
        <Box sx={{ p: 2, width: { md: "40%", xs: "90%" }, m: "auto", textAlign: "center" }}>
          <Button type="submit" variant="contained" onClick={playHandler} sx={{ mb: 2 }}>
            {playOptionsToggle ? "Play" : "Close"}
          </Button>
          {!playOptionsToggle && <PlayOptions options={playOptionsToggleHandler} mode={mode} goBtnAction={goBtnHandler} />}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}>
          <ProfileCard contentType="Username" contentValue={currentUserData ? currentUserData.name : ""} bgcolorcode={0} />
          <ProfileCard contentType="Games Played" contentValue={currentUserData ? currentUserData.gamesPlayed : ""} bgcolorcode={2} />
          <ProfileCard contentType="Games Won" contentValue={currentUserData ? currentUserData.gamesWon : ""} bgcolorcode={4} />
          <ProfileCard contentType="Golds Earned" contentValue={currentUserData ? currentUserData.gold : ""} bgcolorcode={6} />
          <ProfileCard contentType="Diamonds Earned" contentValue={currentUserData ? currentUserData.diamond : ""} bgcolorcode={8} />
          <ProfileCard contentType="Total Score" contentValue={currentUserData ? currentUserData.totalScore : ""} bgcolorcode={3} />
          <ProfileCard contentType="Profile Picture" avatar={currentUserData ? currentUserData.avatarUrl : ""} bgcolorcode={5} />
        </Box>
      </Box>
    </AppContainer>
  );
};

export default Profile;
