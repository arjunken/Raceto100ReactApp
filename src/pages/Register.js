import { Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppContainer from "../layouts/AppContainer";
import { testEmail, testPassword, testUsername } from "../utils";
import { useState } from "react";
import Navigation from "../components/Navigation";
//Firebase
import { handleUserCreation, userNameCheck } from "../firebase";
//*** */
import { Player } from "../classes/Player";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageLoading from "../layouts/PageLoading";

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
  const swalert = withReactContent(Swal);
  const [showLoading, setShowLoading] = useState([false]);

  const inputValidator = (e) => {
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
          userNameCheck(result).then((res) => {
            if (res) {
              setUsernameErrorText("This username is not available. Try different one");
              setUsername(null);
              setTimeout(() => {
                setUsernameErrorText("");
              }, 1500);
              setSubmitBtnState(true);
              return "";
            }
          });
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
      default:
        break;
    }
    username && email && password && setSubmitBtnState(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowLoading([true, "Please wait while we setup your account...."]);
    //Create a player object and store
    const player = new Player(username);
    player.data.email = email;
    player.data.isRegistered = true;

    //Create the player account and data template
    handleUserCreation(email, password, username, player.data, player.robodata)
      .then((uid) => {
        localStorage.setItem("raceto100Auth", uid);
        console.log("User has been created successfully with UID: ", uid);
        navigate("/profile");
      })
      .catch((ex) => {
        console.error("There is an error registering user:", ex.message);
        swalert.fire("Error!", "There is an existing account", "error");
        setShowLoading([false]);
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
      {showLoading[0] && <PageLoading showLoading={showLoading[0]} msg={showLoading[1]} />}
    </AppContainer>
  );
};

export default Register;
