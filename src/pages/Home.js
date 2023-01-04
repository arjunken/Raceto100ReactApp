import { Box, TextField, InputLabel, Button, ToggleButtonGroup, ToggleButton, Paper, Slider } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

//App level imports
import PlayersContext from "../store/players-context";
import GameSubtitle from "../components/GameSubtitle";
import AppContainer from "../layouts/AppContainer";
import { Player } from "../classes/Player";
import { globalVariables, testUsername } from "../globalVariables";
import Navigation from "../components/Navigation";
import { getDocs, query, where } from "firebase/firestore";
import { colRefP } from "../firebase";
import PlayOptions from "../components/PlayOptions";

const Home = () => {
  const [mode, setMode] = useState("1");
  const navigate = useNavigate();
  const playerCtx = useContext(PlayersContext);
  const [player1Name, setPlayer1Name] = useState("name");
  const [submitBtnState, setSubmitBtnState] = useState(true);
  const [errorText, setErrorText] = useState("");

  const handleGameModeSelection = (e, newmode) => {
    setMode(e.target.value);
  };

  const inputValidator = async (e) => {
    //Test for valid username
    const result = testUsername(e.target.value);
    if (!result) {
      setErrorText("Invalid Username");
      setTimeout(() => {
        setErrorText("");
      }, 1500);
      setPlayer1Name(null);
      setSubmitBtnState(true);
      return;
    } else {
      setPlayer1Name(result);
      //Test if it is already registered
      // const q = query(colRefP, where("name", "==", result));
      // const querySnapshot = await getDocs(q);
      // if (!querySnapshot.empty) {
      //   setErrorText("This username is not available. Try different one");
      //   setPlayer1Name(null);
      //   setTimeout(() => {
      //     setErrorText("");
      //   }, 1500);
      //   setSubmitBtnState(true);
      //   return "";
      // }
      setSubmitBtnState(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "1") {
      const player1 = new Player(player1Name);
      //Flushout previously stored sessions in the context store
      playerCtx.resetPlayers();
      //add player into the context store
      playerCtx.addPlayer(player1);
      //Get the second player
      const player2 = new Player(globalVariables.ROBOT_SHORTNAME);
      player2.data.avatarUrl = "/avatars/shakuni.jpeg";
      //add the second player into the context store
      playerCtx.addPlayer(player2);
      navigate("/gamerobo");
    } else {
      console.log("Remote playing is coming soon!");
      swal("Oh! You like to play with Remote Players?", "Your interest recorded. It will be available in the future.");
    }
  };

  return (
    <AppContainer>
      <Navigation />
      <GameSubtitle />
      <Paper sx={{ p: 2, width: { md: "40%", xs: "90%" } }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center" }}
        >
          <TextField
            id="uniqueName"
            name="uniqueName"
            label="Username"
            onKeyUp={inputValidator}
            variant="outlined"
            required
            fullWidth
            error={!player1Name ? true : false}
            helperText={errorText}
          />
          <PlayOptions options={handleGameModeSelection} mode={mode} />
          <Button type="submit" variant="contained" disabled={submitBtnState ? true : false} fullWidth>
            Go
          </Button>
        </Box>
      </Paper>
    </AppContainer>
  );
};

export default Home;
