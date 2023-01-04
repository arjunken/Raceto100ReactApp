import { Box, Link } from "@mui/material";

const Navigation = () => {
  const userAuth = localStorage.getItem("raceto100Auth");
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
