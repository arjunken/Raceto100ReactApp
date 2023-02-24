import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { invitationExpiry, lightColors } from "../globalVariables";
import TimeDisplayCreatedAt from "./TimeDisplayCreatedAt";
import TimeDisplayExpiresIn from "./TimeDisplayExpiresIn";
import WaitingRoom from "./WaitingRoom";

const InviteCard = ({ invite, joiningCode, expiryHandlerSelf, expiryHandlerOthers, joinInviteHandler, roomSize, maxJoins, myGameInvite }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        width: { xs: "80%", md: "70%" },
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        alignItems: "center",
        backgroundColor: lightColors[Math.floor(Math.random() * 8 + 1)],
      }}
    >
      <Avatar alt="avatar" src={invite.player.data.avatarUrl} sx={{ width: 56, height: 56, borderRadius: "50px" }} variant="square" />
      <Typography> {invite.player.data.name}</Typography>
      {joiningCode ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: "auto" }}>
          <Typography variant="caption">Joining Code: {invite.id}</Typography>
          <Typography variant="caption">
            <TimeDisplayCreatedAt createdTime={invite.created_at} />
          </Typography>
          <Typography variant="caption">
            <TimeDisplayExpiresIn expiresInTime={invitationExpiry} createdTime={invite.created_at} expiryHandlerSelf={expiryHandlerSelf} />
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: "auto" }}>
          <Typography variant="caption">
            <TimeDisplayCreatedAt createdTime={invite.created_at} />
          </Typography>
          <Typography variant="caption">
            <TimeDisplayExpiresIn expiresInTime={invitationExpiry} createdTime={invite.created_at} expiryHandlerOthers={expiryHandlerOthers} />
          </Typography>
        </Box>
      )}
      {joiningCode ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Button variant="contained">Start Game</Button>
          <WaitingRoom />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            sx={{ ml: "auto" }}
            onClick={joinInviteHandler}
            disabled={roomSize >= maxJoins || myGameInvite ? true : false}
          >
            Join
          </Button>
          {roomSize >= maxJoins && <Typography variant="caption">Room is Full!</Typography>}
          {myGameInvite && <Typography variant="caption">Can't join while inviting others</Typography>}
        </Box>
      )}
    </Paper>
  );
};

export default InviteCard;
