import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import { ThemeProvider } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { theme } from "./customtheme.js";
import { BrowserRouter } from "react-router-dom";
import { PlayersContextProvider } from "./store/players-context";
import "./firebase";
import { SocketContextProvider } from "./store/socket-context";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={theme}>
    <PlayersContextProvider>
      <BrowserRouter>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </BrowserRouter>
    </PlayersContextProvider>
  </ThemeProvider>
);
