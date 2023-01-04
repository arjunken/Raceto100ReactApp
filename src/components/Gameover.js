import { Box, Divider, Typography } from "@mui/material";
import { useContext } from "react";
import { globalVariables } from "../globalVariables";
import playersContext from "../store/players-context";

const Gameover = (props) => {
  const playerCtx = useContext(playersContext);
  const players = playerCtx.players;

  return (
    <Box elevation={16} sx={{ m: "auto", width: "50%", textAlign: "center", p: 2 }}>
      <Typography variant="Body" color="warning.main" sx={{ fontSize: "1rem", textAlign: "center" }}>
        Game Over!
      </Typography>
      <Typography variant="winnerText" color="warning.light" sx={{ mt: 1, fontSize: "3rem", textAlign: "center", display: "block" }}>
        {props.winner} Wins!
      </Typography>
      <Box sx={{ mt: 1, textAlign: "center", display: "block", color: "grey.100" }}>
        <Typography variant="subtitle1" fontSize="1.3rem">
          {players[props.index].gameSessionData.goldEarned} Gold Mined!
        </Typography>
        <Divider variant="middle" color="grey" />
        <Typography variant="subtitle1" fontSize="1.3rem">
          {players[props.index].gameSessionData.diamondEarned} Diamond Mined!
        </Typography>
        <Divider variant="middle" color="grey" />
        <Typography variant="subtitle1" fontSize="1.3rem">
          {Math.min(props.targetScore, players[props.index].gameSessionData.runningScore)} Points Earned!
        </Typography>
      </Box>
    </Box>
  );
};

export default Gameover;
