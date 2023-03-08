import { Box, Button, Container, Grid, LinearProgress, Link, Stack, Switch, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Chance from "chance";
//App level imports
import PlayersContext from "../store/players-context";
import { globalVariables } from "../globalVariables";
import GameScoreDisplay from "../components/GameScoreDisplay";
import DiceAnimation from "../components/DiceAnimation";
import GameProgressBox from "../components/GameProgressBox";
import PlayerAvatar from "../components/PlayerAvatar";
import Gameover from "../components/Gameover";
import { useNavigate } from "react-router-dom";
import { ColRefInv, saveData, saveDiceResults, savePlayerGameData, updatePlayerTurn } from "../firebase";
import { useRef } from "react";
import LocalStorageContext from "../store/localStorage-context";
import AppContext from "../store/app-context";
import { doc, onSnapshot, query, where } from "firebase/firestore";
import _ from "lodash";

const chance = new Chance();
const passiveDice = globalVariables.default_dice[0];
const activeDice = globalVariables.default_dice[1];

const Game = ({ endRemoteGame }) => {
  //Set States
  const playerCtx = useContext(PlayersContext);
  const localStorageCtx = useContext(LocalStorageContext);
  const [rdiceImg, setRDiceImg] = useState(globalVariables.default_dice[1]);
  const [bdiceImg, setBDiceImg] = useState(globalVariables.default_dice[1]);
  const [turn, setTurn] = useState(0);
  const [rollBtnState, setRollBtnState] = useState(true);
  const [gameMode, setGameMode] = useState(false);
  const [diceScoreSum, setDiceScoreSum] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState({});
  const navigate = useNavigate();
  const [autoRoll, setAutoRoll] = useState(false);
  const switchState = useRef();
  const appDataCtx = useContext(AppContext);

  // const [searchParams] = useSearchParams();

  const gameInvite = appDataCtx.appData.get("joinedInvite");
  const targetScore = gameInvite.targetScore;
  const localUser = localStorageCtx.getData("raceto100AppData", "localUser");

  //Setup Firebase listeners to the invite
  useEffect(() => {
    //Listen to turn changes
    const unsub_listner4 = onSnapshot(
      doc(ColRefInv, gameInvite.id, "gameSessionData", "playerTurn"),
      (doc) => {
        const turnIndex = _.findIndex(gameInvite.room, { data: { name: doc.data().whoseTurn } });
        setTurn(turnIndex);
        if (doc.data().whoseTurn === localUser.name) {
          setRollBtnState(false);
        }
      },
      (error) => {
        console.error("There was an error in identifying the player turn:", error.message);
        endRemoteGame();
      }
    );

    ////Listen to dice results for remote players
    const unsub_listner5 = onSnapshot(
      doc(ColRefInv, gameInvite.id, "gameSessionData", "remoteDiceRes"),
      (doc) => {
        doc.data().remoteDiceRes && performRemoteDiceAnim(doc.data().remoteDiceRes);
      },
      (error) => {
        console.error("There was an error in getting the remote player dice results:", error.message);
        endRemoteGame();
      }
    );

    ////Listen to remote player game data changes
    const unsub_listner6 = onSnapshot(
      doc(ColRefInv, gameInvite.id, "gameSessionData", "remotePlayerGameData"),
      (doc) => {
        doc.data().remotePlayerGameData && performRemoteBarAnim(doc.data().remotePlayerGameData, doc.data().turn);
      },
      (error) => {
        console.error("There was an error in getting the remote player game data:", error.message);
        endRemoteGame();
      }
    );

    return () => {
      unsub_listner6();
      unsub_listner5();
      unsub_listner4();
    };
  }, []);

  //Get the players
  const playersData = playerCtx.players;
  const numberOfPlayers = playersData.length;

  //Handle browser tab close by user
  const handleTabClose = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);
    // cleanup this component
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  if (playerCtx.players.length) {
  } else if (sessionStorage.getItem("raceto100PlayersData")) {
    playersData = JSON.parse(sessionStorage.getItem("raceto100PlayersData"));
    numberOfPlayers = playersData.length;
    //Check if the game is already over
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
    setWinner({});
    endRemoteGame();
  };

  //Handle Dice Rolls
  const rollBtnClickHandler = async () => {
    setGameMode(true);
    //set player roll btn disabled
    setRollBtnState(true);
    //Get the random dice number
    const diceResultsRed = Math.floor(Math.random() * 6 + 1);
    const diceResultsBlack = Math.floor(Math.random() * 6 + 1);
    //Save the generated random number to Firebase
    saveDiceResults(
      {
        red: diceResultsRed,
        black: diceResultsBlack,
      },
      gameInvite.id
    );
    //Show dice animation for 1500 ms
    setRDiceImg(globalVariables.red_dice_faces[0]);
    setBDiceImg(globalVariables.black_dice_faces[0]);
    await sleep(1500);
    //show Dice results
    setRDiceImg(globalVariables.red_dice_faces[diceResultsRed]);
    setBDiceImg(globalVariables.black_dice_faces[diceResultsBlack]);
    await sleep(1200);
    //store the session data in Context
    setDiceScoreSum(diceResultsRed + diceResultsBlack);
    await sleep(1000);
    //Get the player game data
    playersData[turn].gameSessionData.prevScore = playersData[turn].gameSessionData.runningScore;
    const score = playersData[turn].gameSessionData.runningScore + diceResultsRed + diceResultsBlack;
    if (score > targetScore) {
      playersData[turn].gameSessionData.prevScore + Math.min(diceResultsRed, diceResultsBlack) <= targetScore &&
        (playersData[turn].gameSessionData.runningScore += Math.min(diceResultsRed, diceResultsBlack));
    } else {
      playersData[turn].gameSessionData.runningScore += diceResultsRed + diceResultsBlack;
    }
    //Set Gold and Diamonds Earned
    if (diceResultsBlack === diceResultsRed) {
      playersData[turn].gameSessionData.goldEarned += 1;
    }
    if (diceResultsBlack + diceResultsRed === 12) {
      playersData[turn].gameSessionData.diamondEarned += 1;
    }
    //Store playersData into FB to show progressbar animation to the remote player
    savePlayerGameData(playersData[turn].gameSessionData, turn, gameInvite.id);
    //====
    if (playersData[turn].gameSessionData.runningScore >= targetScore) {
      setIsGameOver(true);
      playersData[turn].gameSessionData.winner = true;
      //transfer data to data from local storage to context
      playerCtx.players = playersData;
      setWinner({
        name: playersData[turn].data.name,
        index: turn,
      });
      return;
    }
    if (turn === numberOfPlayers - 1) {
      const autoRoll = switchState.current.firstChild.checked;
      autoRoll && setTurn(0);
    }
    if (turn < numberOfPlayers - 1) {
      //Change WhoseTurn in firebase
      updatePlayerTurn(turn + 1, gameInvite.id);
      setDiceScoreSum(0);
      setGameMode(false);
    } else {
      updatePlayerTurn(0, gameInvite.id);
      setGameMode(false);
      setDiceScoreSum(0);
    }
  };

  const performRemoteDiceAnim = async (remoteDiceRes) => {
    setGameMode(true);
    setRDiceImg(globalVariables.red_dice_faces[0]);
    setBDiceImg(globalVariables.black_dice_faces[0]);
    await sleep(1500);
    //show Dice results
    setRDiceImg(globalVariables.red_dice_faces[remoteDiceRes.red]);
    setBDiceImg(globalVariables.black_dice_faces[remoteDiceRes.black]);
    await sleep(1200);
    //store the session data in Context
    setDiceScoreSum(remoteDiceRes.red + remoteDiceRes.black);
    await sleep(1000);
    setGameMode(false);
    setDiceScoreSum(0);
  };

  const performRemoteBarAnim = async (rpGameData, t) => {
    playersData[t].gameSessionData = rpGameData;
  };

  //Handle Play Again
  const playAgainHandler = () => {
    //cleanup game session data
    for (let i = 0; i < playersData.length; i++) {
      playersData[i].gameSessionData.prevScore = 0;
      playersData[i].gameSessionData.runningScore = 0;
      playersData[i].gameSessionData.goldEarned = 0;
      playersData[i].gameSessionData.diamondEarned = 0;
      sessionStorage.setItem("raceto100PlayersData", JSON.stringify(playersData));
      playerCtx.players = playersData;
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
    setWinner({});
  };

  //Function to save data to the Firebase
  //Hanlde Gameover
  if (isGameOver) {
    //Save Game Data to Firebase
    const uid = localStorageCtx.getData("raceto100AppData", "auth");
    // const uid = searchParams.get("uid");
    if (uid) {
      saveData(uid, playersData, winner);
    }

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
            />
          </GameProgressBox>
        </Grid>
        <Grid item md={2} xs={8} sx={{ m: "auto" }}>
          <PlayerAvatar playerName={playersData[1].data.name} avatarURL={playersData[1].data.avatarUrl} />
        </Grid>
        <Grid item md={2} xs={4}>
          <DiceAnimation diceImg={turn === 1 ? (gameMode ? [rdiceImg, bdiceImg, diceScoreSum] : [activeDice]) : [passiveDice]} />
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

export default Game;
