import { Paper } from "@mui/material";

const GameProgressBox = (props) => {
  return <div style={{ ...props.style, height: "100%", backgroundColor: "#fff" }}>{props.children} </div>;
};

export default GameProgressBox;
