import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { invitationExpiry, lightColors } from "../globalVariables";
import TimeDisplayCreatedAt from "./TimeDisplayCreatedAt";
import TimeDisplayExpiresIn from "./TimeDisplayExpiresIn";
import WaitingRoom from "./WaitingRoom";
import CasinoIcon from "@mui/icons-material/Casino";
import { Container } from "@mui/system";

const JoinedInviteCard = ({ invite, initiateMyRemoteGame }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: "center",
        backgroundColor: lightColors[Math.floor(Math.random() * 8 + 1)],
      }}
    >
      <Avatar alt="avatar" src={invite.room[0].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
      <Typography sx={{ mr: "auto" }}> {invite.room[0].data.name}</Typography>
      {!initiateMyRemoteGame ? (
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
          <CasinoIcon />
          <Typography variant="caption">Game in Progress</Typography>
        </Box>
      ) : (
        <Button variant="contained" onClick={initiateMyRemoteGame}>
          Start Game
        </Button>
      )}
      <Typography sx={{ ml: "auto" }}> {invite.room[1].data.name}</Typography>
      <Avatar alt="avatar" src={invite.room[1].data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
    </Paper>
  );
};

export default JoinedInviteCard;
