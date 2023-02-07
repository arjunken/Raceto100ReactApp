import { Box, Button, Container, Grid, LinearProgress, Link, Typography } from "@mui/material";
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
import { saveData } from "../firebase";

const chance = new Chance();
const passiveDice = globalVariables.default_dice[0];
const activeDice = globalVariables.default_dice[1];

const GameRobo = () => {
  //Set States
  const playerCtx = useContext(PlayersContext);
  const [rdiceImg, setRDiceImg] = useState(globalVariables.default_dice[1]);
  const [bdiceImg, setBDiceImg] = useState(globalVariables.default_dice[1]);
  const [turn, setTurn] = useState(0);
  const [rollBtnState, setRollBtnState] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [diceScoreSum, setDiceScoreSum] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState({});
  const navigate = useNavigate();
  const targetScore = localStorage.getItem("raceto100Target");
  // const [searchParams] = useSearchParams();

  let playersData = [];
  let numberOfPlayers = 0;

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
    playersData = playerCtx.players;
    numberOfPlayers = playersData.length;
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
      }
      if (diceResultsBlack + diceResultsRed === 12) {
        playersData[i].gameSessionData.diamondEarned += 1;
      }
      //save players data to local storage
      setRDiceImg(globalVariables.red_dice_faces[diceResultsRed]);
      setBDiceImg(globalVariables.black_dice_faces[diceResultsBlack]);
      sessionStorage.setItem("raceto100PlayersData", JSON.stringify(playersData));
      // sessionStorage.setItem("raceto100SavedTurn", i);
      await sleep(1200);
      //store the session data in Context
      setDiceScoreSum(diceResultsRed + diceResultsBlack);
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
        //Reset session storage
        sessionStorage.removeItem("raceto100PlayersData");
        return;
      }
      i++;
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
    const uid = localStorage.getItem("raceto100Auth");
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
    </Box>
  );
};

export default GameRobo;
