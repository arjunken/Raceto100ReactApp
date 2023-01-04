import { Box } from "@mui/material";

const AppContainer = ({ children }) => {
  return (
    <Box maxWidth="lg" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      {children}
    </Box>
  );
};

export default AppContainer;
