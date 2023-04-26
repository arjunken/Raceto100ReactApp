import { Avatar, Box, Typography } from "@mui/material";

const OnlinePlayerCard = ({ name, avatarUrl }) => {
  return (
    <Box
      sx={{
        p: 1,
        display: "flex",
        justifyContent: "flex-start",
        gap: 1,
        alignItems: "center",
      }}
    >
      <Avatar alt="avatar" src={avatarUrl} sx={{ width: 28, height: 28, borderRadius: "50px" }} variant="rounded" />
      <Typography> {name}</Typography>
    </Box>
  );
};

export default OnlinePlayerCard;
