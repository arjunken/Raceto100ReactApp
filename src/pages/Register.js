import { Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppContainer from "../layouts/AppContainer";
import { testEmail, testPassword, testUsername } from "../globalVariables";
import { useState } from "react";
import Navigation from "../components/Navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, colRefP, docRefRD, db } from "../firebase";
import { addDoc, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import swal from "sweetalert";
import { Player } from "../classes/Player";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("name");
  const [email, setEmail] = useState("email");
  const [password, setPassword] = useState("password");
  const navigate = useNavigate();
  const [submitBtnState, setSubmitBtnState] = useState(true);
  const [usernameErrorText, setUsernameErrorText] = useState("");
  const [emailErrorText, setEmailErrorText] = useState("");
  const [passwordErrorText, setPasswordErrorText] = useState("");

  const inputValidator = async (e) => {
    switch (e.target.id) {
      case "username":
        //Test for valid username
        const result = testUsername(e.target.value);
        if (!result) {
          setUsernameErrorText("Invalid Username");
          setTimeout(() => {
            setUsernameErrorText("");
          }, 1500);
          setUsername(null);
          setSubmitBtnState(true);
          return;
        } else {
          setUsername(result);
          //Test if it is already registered
          const q = query(colRefP, where("name", "==", result));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUsernameErrorText("This username is not available. Try different one");
            setUsername(null);
            setTimeout(() => {
              setUsernameErrorText("");
            }, 1500);
            setSubmitBtnState(true);
            return "";
          }
        }
        break;
      case "email":
        if (testEmail(e.target.value)) {
          setEmail(e.target.value);
          setSubmitBtnState(true);
        } else {
          setEmailErrorText("Invalid Email");
          setTimeout(() => {
            setEmailErrorText("");
          }, 1500);
          setEmail(null);
          setSubmitBtnState(true);
        }
        break;
      case "password":
        if (testPassword(e.target.value)) {
          setPassword(e.target.value);
          setSubmitBtnState(true);
        } else {
          setPasswordErrorText("Invalid Password");
          setTimeout(() => {
            setPasswordErrorText("");
          }, 1500);
          setPassword(null);
          setSubmitBtnState(true);
        }
        break;
    }
    username && email && password && setSubmitBtnState(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Create a player object and store
    const player = new Player(username);
    player.data.email = email;
    player.data.isRegistered = true;

    //Create the player account and data template
    await createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        setDoc(doc(colRefP, cred.user.uid), player.data)
          .then(() => {
            setDoc(doc(db, "playernames", player.data.name), { pid: cred.user.uid });
            console.log("Document written with ID: ", cred.user.uid);
          })
          .catch((err) => {
            console.log("Error adding new player to the database!");
            return;
          });
        setDoc(doc(colRefP, cred.user.uid, "collections", "robodata"), player.robodata);
        navigate("/signin?email=" + email);
        console.log("Registration successful!");
      })
      .catch((err) => {
        console.error("There is an error registering user:", err.message);
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
          Register
        </Typography>
        {/* <Divider variant="middle" palette="grey.100" /> */}

        <TextField
          id="username"
          label="Username"
          variant="outlined"
          onKeyUp={inputValidator}
          sx={{ mb: 2 }}
          error={!username ? true : false}
          helperText={usernameErrorText}
          defaultValue={searchParams.get("username") ? searchParams.get("username") : ""}
        />
        <TextField
          id="email"
          label="email"
          variant="outlined"
          sx={{ mb: 2 }}
          onKeyUp={inputValidator}
          error={!email ? true : false}
          helperText={emailErrorText}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          onKeyUp={inputValidator}
          error={!password ? true : false}
          helperText={passwordErrorText}
        />
        <Button type="submit" variant="contained" disabled={submitBtnState ? true : false}>
          Register
        </Button>
      </Paper>
    </AppContainer>
  );
};

export default Register;
