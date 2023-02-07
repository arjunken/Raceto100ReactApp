import { Alert, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import { signInUser } from "../firebase";
import { testEmail, testPassword } from "../utils";
import AppContainer from "../layouts/AppContainer";

const Signin = () => {
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ? searchParams.get("email") : "");
  const navigate = useNavigate();
  const [showInvalidCredAlert, setShowInvalidCredAlert] = useState("false");

  const inputValidator = (e) => {
    switch (e.target.id) {
      case "email":
        testEmail(e.target.value) && setEmail(e.target.value);
        break;
      case "password":
        testPassword(e.target.value) && setPassword(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    signInUser(email, password)
      .then((uid) => {
        localStorage.setItem("raceto100Auth", uid);
        navigate("/profile");
      })
      .catch((ex) => {
        setShowInvalidCredAlert(false);
        setTimeout(() => {
          setShowInvalidCredAlert(true);
        }, 1500);
        console.error("There is an error signing in user");
      });
  };

  return (
    <AppContainer>
      <Navigation />
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          width: { xs: "80%", md: "60%", lg: "40%" },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: "bold" }}>
          Sign In
        </Typography>
        {!showInvalidCredAlert && <Alert severity="error">Invalid credentials. Try again!</Alert>}

        {searchParams.get("email") && <Alert severity="success">Registration successfull! Now you can login.</Alert>}

        <TextField
          id="email"
          onBlur={inputValidator}
          defaultValue={searchParams.get("email") ? searchParams.get("email") : ""}
          label="Email"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField id="password" onBlur={inputValidator} label="Password" type="password" autoComplete="current-password" variant="outlined" />
        <Typography>
          Forgot password? <Link href="/resetpassword">Click Here</Link>
        </Typography>

        <Button type="submit" variant="contained">
          Sign In
        </Button>
      </Paper>
    </AppContainer>
  );
};

export default Signin;
