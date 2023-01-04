import { Avatar, Grid, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";

const PlayerAvatar = (props) => {
  return (
    <Paper sx={{ p: 1 }}>
      <Box sx={{ display: "flex", flexDirection: { md: "column", xs: "row" }, gap: 1, justifyContent: { xs: "space-between" }, alignItems: "center" }}>
        <Avatar alt="avatar" src={props.avatarURL} sx={{ width: 56, height: 56 }} variant="square" />
        <Typography>{props.playerName}</Typography>
      </Box>
    </Paper>
  );
};

export default PlayerAvatar;
