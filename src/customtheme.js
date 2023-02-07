import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    primary: {
      main: "#219ebc",
      light: "#8ecae6",
      dark: "#023e8a",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily:
      "'fuzzy bubbles','Bubblegum Sans', 'Segoe UI', 'Roboto','Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue'",
    gameTitle: {
      fontFamily: "'Bubblegum Sans','Roboto'",
      fontSize: "5rem",
      color: "#FFB703",
    },
    subtitle1: {
      fontSize: "1.2rem",
      fontWeight: "bold",
    },
    winnerText: {
      fontFamily: "'Bungee Shade','Roboto'",
      fontSize: "3rem",
      color: "#FFB703",
    },
    button: {
      textTransform: "none",
    },
  },
});
