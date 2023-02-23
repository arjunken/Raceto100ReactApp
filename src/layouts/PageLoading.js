import { Backdrop, Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import PacmanLoader from "react-spinners/PacmanLoader";

const PageLoading = ({ showLoading, msg, actionBtn }) => {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showLoading}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
        <PacmanLoader color="#36d7b7" />
        <Typography variant="caption">{msg}</Typography>
        {actionBtn && (
          <Button variant="contained" onClick={actionBtn} sx={{ backgroundColor: "#edae49" }}>
            Abort
          </Button>
        )}
      </Box>
    </Backdrop>
  );
};

export default PageLoading;
