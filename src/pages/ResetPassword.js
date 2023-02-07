import { Alert, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import Navigation from "../components/Navigation";
import { auth } from "../firebase";
import AppContainer from "../layouts/AppContainer";
import { testEmail } from "../utils";

const ResetPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState(null);
  const [submitBtnState, setSubmitBtnState] = useState(false);
  const [emailErrorText, setEmailErrorText] = useState("");
  const [showError, setShowError] = useState(false);

  const inputValidator = (e) => {
    if (testEmail(e.target.value)) {
      setEmail(e.target.value);
      setSubmitBtnState(true);
      setShowError(false);
    } else {
      setEmailErrorText("Invalid Email");
      setShowError(true);
      setTimeout(() => {
        setEmailErrorText("");
      }, 1500);
      setEmail(null);
      setSubmitBtnState(false);
    }
  };

  const sendPwdResetEmail = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setEmailSent(true);
      })
      .catch((error) => {
        console.error(error.code, ":Error sending the password reset email:", error.message);
      });
  };

  const handleSubmit = () => {
    sendPwdResetEmail();
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
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: "bold" }}>
          Reset Password
        </Typography>
        <Typography variant="caption" sx={{ mb: 2 }}>
          Please provide the registered email address to send the instructions to reset your password. If it exists, you will get an email.
        </Typography>
        {emailSent ? (
          <Alert severity="success" sx={{ fontWeight: "bold", mb: 2 }}>
            Email has been sent! Check your email.
          </Alert>
        ) : (
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            onKeyUp={inputValidator}
            error={showError ? true : false}
            helperText={emailErrorText}
            sx={{ mb: 2 }}
          />
        )}

        {emailSent ? (
          <Link href="/signin" underline="none">
            <Button type="button" variant="contained">
              Go Back
            </Button>
          </Link>
        ) : (
          <Button type="button" onClick={handleSubmit} variant="contained" disabled={!submitBtnState ? true : false}>
            Send Password Reset Email
          </Button>
        )}
      </Paper>
    </AppContainer>
  );
};

export default ResetPassword;
