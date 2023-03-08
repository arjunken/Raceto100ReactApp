import { Avatar, Box, Divider, Typography } from "@mui/material";
import { useContext } from "react";
import { globalVariables } from "../globalVariables";
import playersContext from "../store/players-context";

const Gameover = ({ winner, index, targetScore }) => {
  const playerCtx = useContext(playersContext);
  const players = playerCtx.players;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3, gap: 1 }}>
      <Typography variant="Body" color="warning.main" sx={{ fontSize: "1rem" }}>
        Game Over!
      </Typography>
      <Avatar alt="winner avatar" sx={{ width: 90, height: 90 }} src={players[index].data.avatarUrl} />
      <Typography variant="winnerText" color="warning.light" sx={{ mt: 1, fontSize: "3rem" }}>
        {winner} Wins!
      </Typography>
      <Box sx={{ mt: 1, textAlign: "center", display: "block", color: "grey.100" }}>
        <Typography variant="subtitle1" fontSize="1.3rem">
          {players[index].gameSessionData.goldEarned} Gold Mined!
        </Typography>
        <Typography variant="subtitle1" fontSize="1.3rem">
          {players[index].gameSessionData.diamondEarned} Diamond Mined!
        </Typography>
        <Typography variant="subtitle1" fontSize="1.3rem">
          {Math.min(targetScore, players[index].gameSessionData.runningScore)} Points Earned!
        </Typography>
      </Box>
    </Box>
  );
};

export default Gameover;
