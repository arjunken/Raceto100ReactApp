import { Box, Typography } from "@mui/material";
import React from "react";

const ApplicationErrors = () => {
  return (
    <Box sx={{ color: "white" }}>
      <Typography>Application encountered an error!! Please try again later</Typography>
      {/* <pre style={{ color: "red" }}> {error.message}</pre> */}
    </Box>
  );
};

export default ApplicationErrors;
