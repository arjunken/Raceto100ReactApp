import { Typography } from "@mui/material";
import Navigation from "../components/Navigation";
import AppContainer from "../layouts/AppContainer";

const Scoreboard = () => {
  return (
    <AppContainer>
      <Navigation />
      <Typography> This is the Scoreboard page </Typography>
    </AppContainer>
  );
};

export default Scoreboard;
