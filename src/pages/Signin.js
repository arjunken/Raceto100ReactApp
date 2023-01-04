import { Alert, Button, Paper, TextField, Typography } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import { auth } from "../firebase";
import { testEmail, testPassword } from "../globalVariables";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        localStorage.setItem("raceto100Auth", cred.user.uid);
        navigate("/profile");
      })
      .catch((err) => {
        setShowInvalidCredAlert(false);
        setTimeout(() => {
          setShowInvalidCredAlert(true);
        }, 1500);
        console.error("There is an error signing in user:", err.message);
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
        <TextField
          id="password"
          onBlur={inputValidator}
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
        />
        <Button type="submit" variant="contained">
          Sign In
        </Button>
      </Paper>
    </AppContainer>
  );
};

export default Signin;
