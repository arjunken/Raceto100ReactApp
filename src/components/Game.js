import { Box, Button, Container, Grid, LinearProgress, Link, Typography } from "@mui/material";
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
import {
  colRefInv,
  deleteMyInvite,
  getGameStandings,
  removePlayerFromGameRoom,
  saveDiceResults,
  savePlayerGameData,
  saveRemoteGameData,
  updateInvitePlayAgainRequest,
  updateInvitePlayerQuits,
  updatePlayerTurn,
} from "../firebase";

import LocalStorageContext from "../store/localStorage-context";
import AppContext from "../store/app-context";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import _ from "lodash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageLoading from "../layouts/PageLoading";

const chance = new Chance();
const passiveDice = globalVariables.default_dice[0];
const activeDice = globalVariables.default_dice[1];
const diceRollingSound = new Audio("/sounds/dice-rolling.wav");
const diceResSound = new Audio("/sounds/dice-result.wav");
const celebrateSound = new Audio("/sounds/celebrate" + Math.floor(Math.random() * 6 + 1) + ".wav");
const goldCollectSound = new Audio("/sounds/coin-collect.wav");
const diamondsCollectSound = new Audio("/sounds/diamonds-collect.wav");

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
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();
  const appDataCtx = useContext(AppContext);
  const swalert = withReactContent(Swal);
  const [showLoading, setShowLoading] = useState([false]);
  const [gameStandings, setGameStandings] = useState(null);

  // const [searchParams] = useSearchParams();

  const gameInvite = appDataCtx.appData.joinedInvite;
  const targetScore = gameInvite.targetScore;
  const localUser = localStorageCtx.getData("raceto100AppData", "localUser");

  //Setup Firebase listeners to the invite
  useEffect(() => {
    //Listen to turn changes
    const unsub_listner4 = onSnapshot(
      doc(colRefInv, gameInvite.id, "gameSessionData", "playerTurn"),
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
      doc(colRefInv, gameInvite.id, "gameSessionData", "remoteDiceRes"),
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
      doc(colRefInv, gameInvite.id, "gameSessionData", "remotePlayerGameData"),
      (doc) => {
        doc.data().remotePlayerGameData && performRemoteBarAnim(doc.data().remotePlayerGameData, doc.data().turn);
      },
      (error) => {
        console.error("There was an error in getting the remote player game data:", error.message);
        endRemoteGame();
      }
    );

    ///Listen to play again requests
    const unsub_listner7 = onSnapshot(
      doc(colRefInv, gameInvite.id, "gameSessionData", "playAgainRequested"),
      (doc) => {
        if (doc.data().playAgainRequested && doc.data().requester && doc.data().requester !== localUser.name) {
          swalert
            .fire({
              title: "One More Game?",
              text: "Hey! do you want to play one more game?",
              iconHtml: '<img src="/images/invite.png" />',
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Ya, Sure!",
              cancelButtonText: "No, Quit",
              customClass: {
                icon: "no-border",
              },
            })
            .then((result) => {
              if (result.isConfirmed) {
                updateInvitePlayAgainRequest({ playAgainRequested: false, playAgainAccepted: true }, gameInvite.id);
                resumePlayAgain();
              }
              if (result.isDismissed) {
                updateInvitePlayAgainRequest({ playAgainAccepted: false }, gameInvite.id);
                quitBtnHandler();
              }
            });
        }
        //Notify play again requester if other player rejects
        if (doc.data().playAgainAccepted === false && doc.data().requester === localUser.name) {
          swalert
            .fire({
              title: "Player Quits!",
              text: "Sorry, I can't play another game. Maybe next time.",
              iconHtml: '<img src="/images/invite.png" />',
              showCancelButton: false,
              confirmButtonColor: "#d33",
              confirmButtonText: "Quit",
              customClass: {
                icon: "no-border",
              },
            })
            .then((result) => {
              if (result.isConfirmed) {
                quitBtnHandler();
              }
            });
        }
        if (doc.data().playAgainAccepted) {
          resumePlayAgain();
        }
      },
      (error) => {
        console.error("There was an error in checking if play again requested:", error.message);
      }
    );

    ////Listen to remote player quiting the game
    const unsub_listner8 = onSnapshot(
      doc(colRefInv, gameInvite.id, "gameSessionData", "playerQuits"),
      (doc) => {
        if (doc.data().playerQuits && doc.data().playerName !== localUser.name) {
          if (doc.data().playIncomplete) {
            swalert.fire("Oops!", "Player quits! The remote player exited the game. The game cannot be continued.", "info");
          } else {
            swalert.fire("Thanks for Playing", "Remote Player left! Try joining another invite", "success");
          }
          removePlayerFromGameRoom(gameInvite.id, gameInvite.room[1])
            .then(() => {
              console.log("Player has been removed from the invite");
              if (gameInvite.invitedBy === doc.data().playerName) {
                deleteMyInvite(gameInvite.id)
                  .then(() => {
                    console.log("Invite has been deleted!");
                    localStorageCtx.setData("raceto100AppData", "openInvite", null);
                  })
                  .catch((ex) => {
                    console.error("Error deleting the invite", ex.message);
                  });
              }
            })
            .catch((ex) => {
              console.error("Error removing player from an invite:", ex.message);
            });

          endRemoteGame();
        }
      },
      (error) => {
        console.error("There was an error in checking remote player quit activity:", error.message);
        endRemoteGame();
      }
    );

    return () => {
      unsub_listner8();
      unsub_listner7();
      unsub_listner6();
      unsub_listner5();
      unsub_listner4();
    };
  }, []);

  //Get the players data
  const handleTabClose = (event) => {
    event.preventDefault();
    event.returnValue = "";
  };

  const handleBrowserTabClose = async () => {
    updateDoc(doc(colRefInv, gameInvite.id, "gameSessionData", "playerQuits"), {
      playerQuits: true,
      playerName: localUser.name,
      playIncomplete: true,
    });
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleTabClose);
    //handle things if user decides to close the tab
    window.addEventListener("unload", handleBrowserTabClose);
    // cleanup this component
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      window.removeEventListener("unload", handleBrowserTabClose);
    };
  }, []);

  let playersData = [];

  if (playerCtx.players.length > 1) {
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
    if (gameInvite.invitedBy === localUser.name) {
      isGameOver && updateInvitePlayerQuits({ playerQuits: true, playerName: gameInvite.invitedBy, playIncomplete: false }, gameInvite.id);
      !isGameOver && updateInvitePlayerQuits({ playerQuits: true, playerName: gameInvite.invitedBy, playIncomplete: true }, gameInvite.id);
      deleteMyInvite(gameInvite.id)
        .then(() => {
          localStorageCtx.setData("raceto100AppData", "openInvite", null);
          console.log("Your invite has been deleted!");
        })
        .catch((ex) => {
          console.error("Error deleting your invite", ex.message);
        });
    } else {
      isGameOver && updateInvitePlayerQuits({ playerQuits: true, playerName: localUser.name, playIncomplete: false }, gameInvite.id);
      !isGameOver && updateInvitePlayerQuits({ playerQuits: true, playerName: localUser.name, playIncomplete: true }, gameInvite.id);
    }
    //reset game session
    setIsGameOver(false);
    setTurn(0);
    setRDiceImg(globalVariables.default_dice[1]);
    setBDiceImg(globalVariables.default_dice[1]);
    setRollBtnState(false);
    setGameMode(false);
    setDiceScoreSum(0);
    setWinner(null);
    endRemoteGame();
  };

  //Handle Dice Rolls
  const rollBtnClickHandler = async () => {
    //Play Audio
    diceRollingSound.play();
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
    //Play Dice Results sound
    diceResSound.play();
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
      goldCollectSound.play();
    }
    if (diceResultsBlack + diceResultsRed === 12) {
      playersData[turn].gameSessionData.diamondEarned += 1;
      diamondsCollectSound.play();
    }
    //====
    if (playersData[turn].gameSessionData.runningScore >= targetScore) {
      playersData[turn].gameSessionData.winner = true;
      //transfer data to data from local storage to context
      playerCtx.players = playersData;
      setWinner({
        name: playersData[turn].data.name,
        index: turn,
      });
      //Store playersData into FB to show progressbar animation to the remote player
      savePlayerGameData(playersData[turn].gameSessionData, turn, gameInvite.id);
      await sleep(1200);
      getGameStandings(gameInvite.id).then((wins) => {
        setGameStandings(wins);
        setIsGameOver(true);
        setGameMode(false);
      });
      return;
    }
    //Store playersData into FB to show progressbar animation to the remote player
    savePlayerGameData(playersData[turn].gameSessionData, turn, gameInvite.id);

    // if (turn === numberOfPlayers - 1) {
    //   const autoRoll = switchState.current.firstChild.checked;
    //   autoRoll && setTurn(0);
    // }
    if (turn < numberOfPlayers - 1) {
      //Change WhoseTurn in firebase
      updatePlayerTurn(turn + 1, gameInvite.id);
      setGameMode(false);
      setDiceScoreSum(0);
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
    await sleep(1200);
    setGameMode(false);
    setDiceScoreSum(0);
  };

  const performRemoteBarAnim = async (rpGameData, t) => {
    playersData[t].gameSessionData = rpGameData;
    if (playersData[t].gameSessionData.runningScore >= targetScore) {
      playersData[t].gameSessionData.winner = true;
      playerCtx.players = playersData;
      setWinner({
        name: playersData[t].data.name,
        index: t,
      });
      await sleep(1000);
      getGameStandings(gameInvite.id).then((wins) => {
        setGameStandings(wins);
        setIsGameOver(true);
      });
    }
  };

  //Handle Play Again
  const playAgainHandler = () => {
    //request other player to player again
    updateInvitePlayAgainRequest({ playAgainRequested: true, requester: localUser.name }, gameInvite.id);
    swalert.fire(
      "Request Sent!",
      "We have sent a request to the remote player to join. If rejected, you will be notified. Stay in the game!",
      "question"
    );
    // setShowLoading([true, "Please wait while the remote player start the game session..."]);
  };

  //Resume Play again once remote player accepts the request
  const resumePlayAgain = () => {
    //cleanup game session data
    for (let i = 0; i < playersData.length; i++) {
      playersData[i].gameSessionData.prevScore = 0;
      playersData[i].gameSessionData.runningScore = 0;
      playersData[i].gameSessionData.goldEarned = 0;
      playersData[i].gameSessionData.diamondEarned = 0;
      playersData[i].gameSessionData.winner = null;
      sessionStorage.setItem("raceto100PlayersData", JSON.stringify(playersData));
      playerCtx.players = playersData;
    }

    if (gameInvite.invitedBy === localUser.name) {
      setRollBtnState(false);
    }

    //reset gameover
    setIsGameOver(false);
    setTurn(0);
    setRDiceImg(globalVariables.default_dice[1]);
    setBDiceImg(globalVariables.default_dice[1]);
    setGameMode(false);
    setDiceScoreSum(0);
    setWinner(null);
  };

  //Function to save data to the Firebase
  //Hanlde Gameover
  if (isGameOver) {
    //Play Sound
    celebrateSound.play();
    //Save Game Data to Firebase
    const uid = localStorageCtx.getData("raceto100AppData", "auth");
    const turnIndex = _.findIndex(gameInvite.room, { data: { name: localUser.name } });
    uid && saveRemoteGameData(uid, playersData, turnIndex, winner);

    return (
      <Box sx={{ textAlign: "center" }}>
        <Button type="button" variant="contained" onClick={playAgainHandler}>
          Play Again
        </Button>
        <Button type="button" variant="contained" onClick={quitBtnHandler} color="error" sx={{ ml: 2 }}>
          Quit
        </Button>
        <Gameover
          winner={winner.name}
          index={winner.index}
          targetScore={targetScore}
          p1Wins={gameStandings.p1Wins}
          p2Wins={gameStandings.p2Wins}
          invite={gameInvite}
        />
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
              target={targetScore}
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
        {rollBtnState ? <Typography sx={{ color: "#505050", fontSize: "3rem", fontFamily: "Bubblegum Sans" }}>Wait..</Typography> : "Roll"}
      </Button>
      {showLoading && <PageLoading showLoading={showLoading[0]} msg={showLoading[1]} actionBtn={showLoading[2]} />}
    </Box>
  );
};

export default Game;
