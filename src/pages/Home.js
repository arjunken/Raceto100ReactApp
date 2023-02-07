import { Box, TextField, Button, Paper, Typography, Avatar } from "@mui/material";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//App level imports
import PlayersContext from "../store/players-context";
import GameSubtitle from "../components/GameSubtitle";
import AppContainer from "../layouts/AppContainer";
import { Player } from "../classes/Player";
import { globalVariables } from "../globalVariables";
import { testUsername } from "../utils";
import Navigation from "../components/Navigation";
import PlayOptions from "../components/PlayOptions";

const Home = () => {
  const [mode, setMode] = useState("1");
  const navigate = useNavigate();
  const playerCtx = useContext(PlayersContext);
  const [player1Name, setPlayer1Name] = useState("name");
  const [submitBtnState, setSubmitBtnState] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [showGameOptions, setShowGameOptions] = useState(false);
  const [avatarSelected, setAvatarSelected] = useState(0);
  const swalert = withReactContent(Swal);

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
      // const q = query(colRefP, where("name", "===", result));
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
      player1.data.avatarUrl = `/avatars/avatar${avatarSelected}.jpg`;
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
      swalert.fire("Coming up..", "Remote Player option is currently not supported. Check this option in the future.", "info");
    }
  };

  return (
    <AppContainer>
      <Navigation />
      <GameSubtitle />
      <Paper sx={{ p: 2, width: { md: "30%", xs: "70%" } }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center" }}
        >
          {!showGameOptions ? (
            <>
              <TextField
                id="uniqueName"
                name="uniqueName"
                label="Usernames"
                onKeyUp={inputValidator}
                variant="outlined"
                required
                fullWidth
                error={!player1Name ? true : false}
                helperText={errorText}
              />
              {/* <PlayOptions options={handleGameModeSelection} mode={mode} /> */}
              <Button variant="contained" onClick={() => setShowGameOptions(true)} disabled={submitBtnState ? true : false} fullWidth>
                Go
              </Button>
            </>
          ) : (
            <>
              <Typography> Welcome, {player1Name}!</Typography>
              <PlayOptions options={handleGameModeSelection} mode={mode} />
              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <Button sx={avatarSelected === 0 ? { background: "#e1e1f1" } : { background: "" }} onClick={() => setAvatarSelected(0)}>
                  <Avatar alt="default avatar" src="/avatars/avatar0.jpg" />
                </Button>
                <Button sx={avatarSelected === 1 ? { background: "#e1e1f1" } : { background: "" }} onClick={() => setAvatarSelected(1)}>
                  <Avatar alt="boy avatar" src="/avatars/avatar1.jpg" />
                </Button>
                <Button sx={avatarSelected === 2 ? { background: "#e1e1f1" } : { background: "" }} onClick={() => setAvatarSelected(2)}>
                  <Avatar alt="girl avatar" src="/avatars/avatar2.jpg" />
                </Button>
                <Button sx={avatarSelected === 3 ? { background: "#e1e1f1" } : { background: "" }} onClick={() => setAvatarSelected(3)}>
                  <Avatar alt="girl avatar" src="/avatars/avatar3.jpg" />
                </Button>
                <Button sx={avatarSelected === 4 ? { background: "#e1e1f1" } : { background: "" }} onClick={() => setAvatarSelected(4)}>
                  <Avatar alt="boy avatar" src="/avatars/avatar4.jpg" />
                </Button>
              </Box>
              <Button onClick={handleSubmit} variant="contained" fullWidth>
                Go
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </AppContainer>
  );
};

export default Home;
