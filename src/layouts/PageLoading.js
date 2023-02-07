import { Backdrop, Typography } from "@mui/material";
import { Box } from "@mui/system";
import PacmanLoader from "react-spinners/PacmanLoader";

const PageLoading = ({ showLoading, msg }) => {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showLoading}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
        <PacmanLoader color="#36d7b7" />
        <Typography variant="caption">{msg}</Typography>
      </Box>
    </Backdrop>
  );
};

export default PageLoading;
