import { Box } from "@mui/material";
import React from "react";
const Whitebox = ({ children }) => {
  return <Box sx={{ p: 2, backgroundColor: "#fff", borderRadius: 1 }}>{children}</Box>;
};

export default Whitebox;
