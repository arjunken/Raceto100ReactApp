import { createTheme } from "@mui/material/styles";
import * as React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, MemoryRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";

const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI) -> to (react-router)
  return <RouterLink data-testid="custom-link" ref={ref} to={href} {...other} />;
});

LinkBehavior.propTypes = {
  href: PropTypes.oneOfType([
    PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      search: PropTypes.string,
    }),
    PropTypes.string,
  ]).isRequired,
};

function Router(props) {
  const { children } = props;
  if (typeof window === "undefined") {
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return <MemoryRouter>{children}</MemoryRouter>;
}

Router.propTypes = {
  children: PropTypes.node,
};

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
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
});
