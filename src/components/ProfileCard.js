import { Avatar, Paper, Typography } from "@mui/material";
import { lightColors } from "../globalVariables";

const ProfileCard = (props) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: { xs: "80%", md: "60%" },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: lightColors[props.bgcolorcode],
      }}
    >
      <Typography> {props.contentType} </Typography>
      {props.avatar ? (
        <Avatar alt="avatar" src={props.avatar} sx={{ width: 56, height: 56 }} variant="square" />
      ) : (
        <Typography> {props.contentValue} </Typography>
      )}
    </Paper>
  );
};

export default ProfileCard;
