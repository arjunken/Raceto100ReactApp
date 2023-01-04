import { Link, Typography } from "@mui/material";
import Navigation from "./Navigation";

const GameTitle = ({ children }) => {
  return (
    <>
      <Link href="/" variant="gameTitle" align="center" color="#FFB703" underline="none" sx={{ display: "block", marginTop: 2 }}>
        Raceto100
      </Link>
    </>
  );
};

export default GameTitle;
