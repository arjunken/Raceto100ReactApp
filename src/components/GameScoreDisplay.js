import { Avatar, Box, Container, Tooltip, Typography } from "@mui/material";
import SportsScoreRoundedIcon from "@mui/icons-material/SportsScoreRounded";
import CountUp from "react-countup";

const GameScoreDisplay = (props) => {
  return (
    <Container sx={{ backgroundColor: "#fff" }}>
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
        <Tooltip title="You get 2 gold for a double">
          <Avatar alt="Gold Icon" src={props.customIcons.gold} sx={{ width: 32, height: 32, p: 1 }} />
        </Tooltip>
        <Typography sx={{ typography: { sm: "h6", xs: "subtitle2" } }}>{props.rewards[0]}</Typography>
        <Tooltip title="You get 1 diamond for 6+6">
          <Avatar alt="Diamond Icon" src={props.customIcons.diamond} sx={{ width: 32, height: 32, ml: 2, p: 1 }} />
        </Tooltip>
        <Typography sx={{ typography: { sm: "h6", xs: "subtitle2" } }}>{props.rewards[1]}</Typography>
        <Tooltip title="Total score. When target score < 12, it only increases by number < 12. When target score < 6, it only increases by number < 6 of any one dice.">
          <SportsScoreRoundedIcon sx={{ width: 32, height: 32, ml: 2 }} />
        </Tooltip>
        <CountUp start={props.scores[0]} end={props.scores[1]} delay={0} />
      </Box>
    </Container>
  );
};

export default GameScoreDisplay;
