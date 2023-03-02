import { Box, Link } from "@mui/material";
import { useContext } from "react";
import LocalStorageContext from "../store/localStorage-context";

const Navigation = () => {
  const localStorageCtx = useContext(LocalStorageContext);
  const userAuth = localStorageCtx.getData("raceto100AppData", "auth");
  return (
    <Box sx={{ my: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 3 }}>
      <Link href={userAuth ? "/profile" : "/"} variant="body1" color="primary.light" underline="none">
        Home
      </Link>
      {userAuth && (
        <Link href="/scoreboard" variant="body1" color="primary.light" underline="none">
          Scoreboard
        </Link>
      )}
      {!userAuth && (
        <Link href="/register" variant="body1" color="primary.light" underline="none">
          Register
        </Link>
      )}

      {!userAuth && (
        <Link href="/signin" variant="body1" color="primary.light" underline="none">
          Sign In
        </Link>
      )}
    </Box>
  );
};

export default Navigation;
