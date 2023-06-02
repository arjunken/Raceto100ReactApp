import { Avatar, Box, Divider, Paper, Typography } from "@mui/material";
import { useContext } from "react";
import { globalVariables } from "../globalVariables";
import playersContext from "../store/players-context";

const Gameover = ({ winner, index, targetScore, p1Wins, p2Wins, invite }) => {
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
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
          backgroundColor: "#edf6f9",
        }}
      >
        {invite ? (
          <>
            <Avatar alt="avatar" src={invite.room[0].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
            <Typography sx={{ mr: "auto" }}> {invite.room[0].data.name}</Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center" }}>
              <Typography variant="h2">
                {p1Wins} - {p2Wins}
              </Typography>
            </Box>
            <Typography sx={{ ml: "auto" }}> {invite.room[1].data.name}</Typography>
            <Avatar alt="avatar" src={invite.room[1].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
          </>
        ) : (
          <>
            <Avatar alt="avatar" src={players[0].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
            <Typography sx={{ mr: "auto" }}> {players[0].data.name}</Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center" }}>
              <Typography variant="h2">
                {p1Wins} - {p2Wins}
              </Typography>
            </Box>
            <Typography sx={{ ml: "auto" }}> {players[1].data.name}</Typography>
            <Avatar alt="avatar" src={players[1].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Gameover;
