import { Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";

const DiceAnimation = (props) => {
  if (props.diceImg.length == 1) {
    return (
      <Paper sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={props.diceImg[0]} alt="dice display" style={{ width: "60px" }} />
      </Paper>
    );
  }
  return (
    <Paper sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 1, position: "relative" }}>
      <img src={props.diceImg[0]} alt="dice display" style={{ width: "60px" }} />
      <img src={props.diceImg[1]} alt="dice display" style={{ width: "60px" }} />
      {props.diceImg[2] > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            m: "auto",
            width: "70%",
            height: "80%",
            opacity: 0.8,
            backgroundColor: "black",
            borderRadius: "15px",
          }}
        >
          <Typography sx={{ fontWeight: "bold", color: "primary.light", fontSize: "2.5rem" }}>{props.diceImg[2]}</Typography>
        </Box>
      ) : null}
    </Paper>
  );
};

export default DiceAnimation;
