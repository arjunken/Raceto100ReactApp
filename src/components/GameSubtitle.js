import { Typography } from "@mui/material";
import { Box } from "@mui/system";
//App level imports
import { globalVariables } from "../globalVariables";

const GameSubtitle = () => {
  return (
    <Box maxWidth="md" sx={{ marginBottom: "15px" }}>
      <Typography variant="h5" align="center" color="primary.contrastText">
        Wanna race to 100? Let's roll the dice and see who reaches 100 first:) Turn on Audio for more fun
      </Typography>
      <Typography variant="body1" align="center" color="#AAAAAA">
        Join players or just play against {globalVariables.ROBOT_NAME}
      </Typography>
    </Box>
  );
};

export default GameSubtitle;
