import { Avatar, Box, Container, Typography } from "@mui/material";
import SportsScoreRoundedIcon from "@mui/icons-material/SportsScoreRounded";
import CountUp from "react-countup";

const GameScoreDisplay = (props) => {
  return (
    <Container sx={{ backgroundColor: "#fff" }}>
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
        <Avatar alt="Gold Icon" src={props.customIcons.gold} sx={{ width: 32, height: 32, p: 1 }} />
        <Typography sx={{ typography: { sm: "h6", xs: "subtitle2" } }}>{props.rewards[0]}</Typography>
        <Avatar alt="Gold Icon" src={props.customIcons.diamond} sx={{ width: 32, height: 32, ml: 2, p: 1 }} />
        <Typography sx={{ typography: { sm: "h6", xs: "subtitle2" } }}>{props.rewards[1]}</Typography>
        <SportsScoreRoundedIcon sx={{ width: 32, height: 32, ml: 2 }} />
        <CountUp start={props.scores[0]} end={props.scores[1]} delay={0} />
      </Box>
    </Container>
  );
};

export default GameScoreDisplay;
