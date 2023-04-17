import { Box, Button, Container, Grid, LinearProgress, Link, Stack, Switch, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Chance from "chance";
//App level imports
import PlayersContext from "../store/players-context";
import { globalVariables, inviteMaxJoins as numberOfPlayers } from "../globalVariables";
import GameScoreDisplay from "../components/GameScoreDisplay";
import DiceAnimation from "../components/DiceAnimation";
import GameProgressBox from "../components/GameProgressBox";
import PlayerAvatar from "../components/PlayerAvatar";
import Gameover from "../components/Gameover";
import { useNavigate } from "react-router-dom";
import { saveData } from "../firebase";
import { useRef } from "react";
import LocalStorageContext from "../store/localStorage-context";

const chance = new Chance();
const passiveDice = globalVariables.default_dice[0];
const activeDice = globalVariables.default_dice[1];
const diceRollingSound = new Audio("/sounds/dice-rolling.wav");
const diceResSound = new Audio("/sounds/dice-result.wav");
const celebrateSound = new Audio("/sounds/celebrate" + Math.floor(Math.random() * 6 + 1) + ".wav");
const goldCollectSound = new Audio("/sounds/coin-collect.wav");
const diamondsCollectSound = new Audio("/sounds/diamonds-collect.wav");

const GameRobo = () => {
  //Set States
  const playerCtx = useContext(PlayersContext);
  const localStorageCtx = useContext(LocalStorageContext);
  const [rdiceImg, setRDiceImg] = useState(globalVariables.default_dice[1]);
  const [bdiceImg, setBDiceImg] = useState(globalVariables.default_dice[1]);
  const [turn, setTurn] = useState(0);
  const [rollBtnState, setRollBtnState] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [diceScoreSum, setDiceScoreSum] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(localStorageCtx.getData("raceto100LocalGame", "gameWinner"));
  const navigate = useNavigate();
  const targetScore = localStorageCtx.getData("raceto100Target", "target");
  const [autoRoll, setAutoRoll] = useState(false);
  const switchState = useRef();
  const [playersDataInSession, setPlayersDataInSession] = useState(localStorageCtx.getData("raceto100LocalGame", "playersDataInSession"));
  let gameEnded = false;
  // const [searchParams] = useSearchParams();

  const handleTabClose = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };

  const handleBrowserTabClose = async () => {
    if (playerCtx.players[0] !== null && playerCtx.players[1] !== null) {
      localStorageCtx.setData("raceto100LocalGame", "playersDataInSession", [playersData[0], playersData[1]]);
    }
    if (Object.keys(winner).length > 0) {
      localStorageCtx.setData("raceto100LocalGame", "gameWinner", winner);
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);
    //handle things if user decides to close the tab
    window.addEventListener("unload", handleBrowserTabClose);
    // cleanup this component
    //Set Gameover if runningScore reaches TargetScore
    if (Math.max(playersData[0].gameSessionData.runningScore, playersData[1].gameSessionData.runningScore) >= targetScore) {
      setIsGameOver(true);
    }
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      window.removeEventListener("unload", handleBrowserTabClose);
    };
  }, []);

  let playersData = [];
  if (playersDataInSession) {
    playersData = playersDataInSession;
  } else if (playerCtx.players.length > 1) {
    playersData = [playerCtx.players[0], playerCtx.players[1]];
  } else {
    return (
      <>
        <Typography variant="h5" align="center" color="primary.contrastText">
          No Players Data! Start a new game
        </Typography>
        <Link href="/" variant="body1" color="primary.light" underline="none" align="center" sx={{ mt: 2, display: "block" }}>
          Home
        </Link>
      </>
    );
  }

  //Proceed with the game
  const customIcons = { gold: "/images/coin2.png", diamond: "/images/diamond2.png" };

  //External functions
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //Handle Quit Btn
  const quitBtnHandler = () => {
    //reset game session
    setIsGameOver(false);
    setTurn(0);
    setRDiceImg(globalVariables.default_dice[1]);
    setBDiceImg(globalVariables.default_dice[1]);
    setRollBtnState(false);
    setGameMode(false);
    setDiceScoreSum(0);
    setIsGameOver(false);
    setWinner(null);
    navigate("/");
  };

  //Handle Dice Rolls
  const rollBtnClickHandler = async () => {
    setGameMode(true);
    //set player roll btn disabled
    setRollBtnState(true);
    // Loop all the players
    let i = 0;

    do {
      //Play Audio
      diceRollingSound.play();
      setRDiceImg(globalVariables.red_dice_faces[0]);
      setBDiceImg(globalVariables.black_dice_faces[0]);
      await sleep(1500);
      let diceResultsRed = Math.floor(Math.random() * 6 + 1);
      let diceResultsBlack = Math.floor(Math.random() * 6 + 1);
      //define Shakuni's probabilities
      if (i === 1) {
        diceResultsRed = chance.weighted([1, 2, 3, 4, 5, 6], [5, 10, 15, 20, 30, 20]);
        diceResultsBlack = chance.weighted([1, 2, 3, 4, 5, 6], [10, 10, 20, 30, 20, 10]);
      }
      playersData[i].gameSessionData.prevScore = playersData[i].gameSessionData.runningScore;
      const score = playersData[i].gameSessionData.runningScore + diceResultsRed + diceResultsBlack;
      if (score > targetScore) {
        playersData[i].gameSessionData.prevScore + Math.min(diceResultsRed, diceResultsBlack) <= targetScore &&
          (playersData[i].gameSessionData.runningScore += Math.min(diceResultsRed, diceResultsBlack));
      } else {
        playersData[i].gameSessionData.runningScore += diceResultsRed + diceResultsBlack;
      }
      //Set Gold and Diamonds Earned
      if (diceResultsBlack === diceResultsRed) {
        playersData[i].gameSessionData.goldEarned += 1;
        goldCollectSound.play();
      }
      if (diceResultsBlack + diceResultsRed === 12) {
        playersData[i].gameSessionData.diamondEarned += 1;
        diamondsCollectSound.play();
      }
      //save players data to local storage
      setRDiceImg(globalVariables.red_dice_faces[diceResultsRed]);
      setBDiceImg(globalVariables.black_dice_faces[diceResultsBlack]);
      setPlayersDataInSession(playersData);
      // sessionStorage.setItem("raceto100SavedTurn", i);
      await sleep(1200);
      //store the session data in Context
      setDiceScoreSum(diceResultsRed + diceResultsBlack);
      //Play Dice Results sound
      diceResSound.play();
      await sleep(1000);
      if (playersData[i].gameSessionData.runningScore >= targetScore) {
        setIsGameOver(true);
        playersData[i].gameSessionData.winner = true;
        //transfer data to data from local storage to context
        playerCtx.players = playersData;
        setWinner({
          name: playersData[i].data.name,
          index: i,
        });
        setPlayersDataInSession(playersData);
        return;
      }
      i++;
      if (i === numberOfPlayers) {
        const autoRoll = switchState.current.firstChild.checked;
        autoRoll && (i = 0);
      }
      setTurn(i);
      setDiceScoreSum(0);
    } while (i < numberOfPlayers);
    setTurn(0);
    setRollBtnState(false);
    setGameMode(false);
  };

  //Handle Play Again
  const playAgainHandler = () => {
    //cleanup game session data
    for (let i = 0; i < playersData.length; i++) {
      playersData[i].gameSessionData.prevScore = 0;
      playersData[i].gameSessionData.runningScore = 0;
      playersData[i].gameSessionData.goldEarned = 0;
      playersData[i].gameSessionData.diamondEarned = 0;
      playerCtx.players = playersData;
      setPlayersDataInSession(playersData);
    }

    //reset gameover
    setIsGameOver(false);
    setTurn(0);
    setRDiceImg(globalVariables.default_dice[1]);
    setBDiceImg(globalVariables.default_dice[1]);
    setRollBtnState(false);
    setGameMode(false);
    setDiceScoreSum(0);
    setIsGameOver(false);
    setWinner(null);
    localStorageCtx.clearData("raceto100LocalGame");
  };

  //Function to save data to the Firebase
  //Hanlde Gameover
  if (isGameOver) {
    //Play celebrate sound
    celebrateSound.play();
    //Save Game Data to Firebase
    const uid = localStorageCtx.getData("raceto100AppData", "auth");
    // const uid = searchParams.get("uid");
    if (uid) {
      saveData(uid, playersData, winner);
    }
    //Store Data locally
    localStorageCtx.setData("raceto100LocalGame", "playersDataInSession", [playersDataInSession[0], playersDataInSession[1]]);
    localStorageCtx.setData("raceto100LocalGame", "gameWinner", winner);

    return (
      <Box sx={{ textAlign: "center" }}>
        <Button type="button" variant="contained" onClick={playAgainHandler}>
          Play Again
        </Button>
        <Button type="button" variant="contained" onClick={quitBtnHandler} color="error" sx={{ ml: 2 }}>
          Quit
        </Button>
        <Gameover winner={winner.name} index={winner.index} targetScore={targetScore} />
      </Box>
    );
  }
  //Switch Handler
  const switchHandler = (e) => {
    e.target.checked ? setAutoRoll(true) : setAutoRoll(false);
  };

  //Default component return
  return (
    <Box sx={{ textAlign: "center" }}>
      <Button type="button" variant="contained" onClick={quitBtnHandler} color="error" sx={{ mb: 3 }}>
        Quit
      </Button>
      <Grid container spacing={2}>
        <Grid item md={2} xs={8} sx={{ m: "auto" }}>
          <PlayerAvatar playerName={playersData[0].data.name} avatarURL={playersData[0].data.avatarUrl} />
        </Grid>
        <Grid item md={2} xs={4}>
          <DiceAnimation diceImg={turn === 0 ? (gameMode ? [rdiceImg, bdiceImg, diceScoreSum] : [activeDice]) : [passiveDice]} />
        </Grid>
        <Grid item md={8} xs={12}>
          <GameProgressBox>
            <Container sx={{ backgroundColor: "#fff", p: 2 }}>
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={(100 * playersData[0].gameSessionData.runningScore) / targetScore}
                  sx={{ height: "20px" }}
                />
              </Box>
            </Container>
            <GameScoreDisplay
              customIcons={customIcons}
              scores={[playersData[0].gameSessionData.prevScore, playersData[0].gameSessionData.runningScore]}
              rewards={[playersData[0].gameSessionData.goldEarned, playersData[0].gameSessionData.diamondEarned]}
              target={targetScore}
            />
          </GameProgressBox>
        </Grid>
        <Grid item md={2} xs={8} sx={{ m: "auto" }}>
          <PlayerAvatar playerName={playersData[1].data.name} avatarURL={playersData[1].data.avatarUrl} />
        </Grid>
        <Grid item md={2} xs={4}>
          <DiceAnimation diceImg={turn === 1 ? [rdiceImg, bdiceImg, diceScoreSum] : [passiveDice]} />
        </Grid>
        <Grid item md={8} xs={12}>
          <GameProgressBox>
            <Container sx={{ backgroundColor: "#fff", p: 2 }}>
              <Box sx={{ width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={(100 * playersData[1].gameSessionData.runningScore) / targetScore}
                  sx={{ height: "20px" }}
                />
              </Box>
            </Container>
            <GameScoreDisplay
              customIcons={customIcons}
              scores={[playersData[1].gameSessionData.prevScore, playersData[1].gameSessionData.runningScore]}
              rewards={[playersData[1].gameSessionData.goldEarned, playersData[1].gameSessionData.diamondEarned]}
              target={targetScore}
            />
          </GameProgressBox>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        size="large"
        onClick={rollBtnClickHandler}
        disabled={rollBtnState}
        sx={{
          borderRadius: "30px",
          display: "block",
          mt: 2,
          width: "100%",
          height: "80px",
          fontSize: "3rem",
          p: 0,
          fontFamily: "Bubblegum Sans",
        }}
      >
        Roll
      </Button>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
        <Typography color="white">Manual Roll</Typography>
        <Switch ref={switchState} onChange={switchHandler} size="large" />
        <Typography color="white">Auto Roll</Typography>
      </Stack>
    </Box>
  );
};

export default GameRobo;
