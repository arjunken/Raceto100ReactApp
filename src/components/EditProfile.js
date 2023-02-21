import { Avatar, Box, Button, Divider, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  auth,
  uploadAvatarToFb,
  deleteUsersData,
  updateUsername,
  updateUserEmail,
  userNameCheck,
  updateAvatar,
  verifyEmail,
  updateUserPassword,
} from "../firebase";
import { globalVariables } from "../globalVariables";
import { testEmail, testPassword, testUsername } from "../utils";
import HelpIcon from "@mui/icons-material/Help";
import VerifiedIcon from "@mui/icons-material/Verified";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import AvatarListItem from "./AvatarListItem";
import avatarList from "../store/avatar-list";
import { useEffect } from "react";

const EditProfile = ({ currentUserData, dataUpdateCounter, count }) => {
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [pwd, setPwd] = useState(null);
  const [errorUn, setErrorUn] = useState(null);
  const [errorEm, setErrorEm] = useState(null);
  const [errorPwd, setErrorPwd] = useState(null);
  const [avatarListPlus, setAvatarListPlus] = useState(avatarList);
  const navigate = useNavigate();
  const swalert = withReactContent(Swal);
  const [avatarContainer, setAvatarContainer] = useState({ index: 9999, path: currentUserData.avatarUrl, showAvatarList: false });

  useEffect(() => {
    if (auth.currentUser.photoURL) {
      if (!avatarList.includes(auth.currentUser.photoURL)) {
        setAvatarListPlus(avatarList.push(auth.currentUser.photoURL));
      }
    }
  }, []);

  const handleSignout = async () => {
    await signOut(auth)
      .then(() => {
        localStorage.removeItem("raceto100Auth");
        console.log("User has signed out!");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("Error signing out the user:", err.message);
      });
  };

  //Change Username
  const usernameChangeHandler = () => {
    let result = testUsername(username);
    if (!result) {
      setErrorUn("Invalid Username!");
      setTimeout(() => {
        setErrorUn("");
      }, 1500);
      return;
    }

    //If not continue to check the username existance in the database
    userNameCheck(username)
      .then((res) => {
        if (res) {
          setErrorUn("Username exists!");
          setTimeout(() => {
            setErrorUn(null);
          }, 1500);
          return;
        }
        //Update username
        setUsername(result);
        updateUsername(currentUserData.name, result)
          .then(() => {
            console.log("Username updated!");
            dataUpdateCounter(count + 1);
            swalert.fire({
              position: "center",
              icon: "success",
              title: "Username updated!",
              showConfirmButton: false,
              timer: 1000,
            });
          })
          .catch((ex) => {
            console.error("Error in updating to database:", ex.message);
          });
      })
      .catch((ex) => {
        console.error("Error checking username existence:", ex.message);
      });
  };

  //Change Email
  const emailChangeHandler = () => {
    let result = testEmail(email);
    if (!result) {
      setErrorEm("Invalid Email!");
      setTimeout(() => {
        setErrorEm(null);
      }, 1500);
      return;
    }

    const swalertOptionsInfo = {
      title: "Are you sure?",
      text: "Once email is updated, you will be signed out automatically!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    };

    const swalertOptionsFail = {
      icon: "error",
      title: "Oops...",
      text: "Failed to update the email! Try again.",
    };

    swalert.fire(swalertOptionsInfo).then((udecision) => {
      if (udecision.isConfirmed) {
        updateUserEmail(email)
          .then(() => {
            console.log("Email address updated successfully!");
            handleSignout();
          })
          .catch((ex) => {
            swalert.fire(swalertOptionsFail);
          });
      }
    });
  };

  //Change Password
  const pwdChangeHandler = () => {
    let result = testPassword(pwd);
    if (!result) {
      setErrorPwd("Invalid password!");
      setTimeout(() => {
        setErrorPwd(null);
      }, 1500);
      return;
    }
    const swalertOptionsSuccess = {
      position: "center",
      icon: "success",
      title: "Password updated!",
      text: "Remember to login with new password next time when you login.",
      showConfirmButton: true,
    };

    const swalertOptionsFail = {
      icon: "error",
      title: "Oops...",
      text: "Failed to change the password! Try again.",
    };

    updateUserPassword(pwd)
      .then(() => {
        console.log("Password updated successfully!");
        swalert.fire(swalertOptionsSuccess);
      })
      .catch((ex) => {
        console.error("Error updating the password: ", ex.message);
        swalert.fire(swalertOptionsFail);
      });
  };

  //Send Email Verification Handler
  const emVerifyHandler = () => {
    verifyEmail()
      .then(() => {
        swalert.fire("Email on your way!", "We just sent a verification email. Check your inbox.", "info");
      })
      .catch((ex) => {
        swalert.fire("Error!", "Couldn't send verification email.", "error");
        console.error("Couldn't send verification email:", ex.message);
      });
  };

  //Delete Account Handler
  const deleteAccountHandler = () => {
    swalert
      .fire({
        title: "Are you sure?",
        text: "All your data will be erased. You won't be able to revert this action!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          deleteUsersData(currentUserData.name)
            .then(() => {
              swalert.fire("Account Deleted!", "Your account has been deleted. You have been signed out automatically.", "success");
              handleSignout();
            })
            .catch((ex) => {
              swalert.fire("Could not delete!", "There was an error deleting the user.", "error");
              console.error("There was an error deleting the user", ex.message);
            });
        }
      })
      .catch((ex) => {
        console.error("Error in deleting the user:", ex.message);
      });
  };

  //Handle avatar modifications
  const avatarClickHandler = (index, path) => {
    setAvatarContainer((data) => ({ ...data, index: index, path: path }));
  };

  const pickAvatarCancelBtnHandler = () => {
    setAvatarContainer((data) => ({ ...data, index: 9999, path: currentUserData.avatarUrl, showAvatarList: false }));
  };

  const pickAvatarApplyBtnHandler = () => {
    updateAvatar(avatarContainer.path)
      .then(() => {
        setAvatarContainer((data) => ({ ...data, showAvatarList: false }));
        dataUpdateCounter(count + 1);
      })
      .catch((ex) => {
        console.error("Error in updating the avatar:", ex.message);
      });
  };

  const uploadPicHandler = async () => {
    const { value: file } = await swalert.fire({
      title: "Select image",
      text: "Images should be in jpg, jpeg, bmp format",
      input: "file",
      inputAttributes: {
        accept: ".jpg,.png,.bmp",
        "aria-label": "Upload your profile picture",
      },
    });

    if (file) {
      if (file.size / 1024 > globalVariables.avatarFileSizeInKb) {
        swalert.fire("File size is big!", "We can't accept images more than 200kb. Upload a smaller size image.", "error");
      } else {
        const filename = currentUserData.name + "." + file.name.split(".").pop();
        uploadAvatarToFb(file, filename)
          .then(() => {
            console.log("Avatar was updated successfully!");
            dataUpdateCounter(count + 1);
            setAvatarContainer((data) => ({ ...data, path: auth.currentUser.photoURL }));
          })
          .catch((ex) => {
            console.error("Error uploading the Avatar:", ex.message);
          });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: { md: "row", xs: "column" }, justifyContent: "center", gap: 1 }}>
        <Paper elevation={1} sx={{ display: "flex", width: { md: "30%" }, flexDirection: "column", p: 2, m: 1 }}>
          <Typography variant="subtitle1">Profile Picture</Typography>
          <Divider sx={{ width: "100%", my: 1 }} />
          <Avatar src={avatarContainer.path} sx={{ width: 90, height: 90, mx: "auto" }} />
          <Button variant="text" onClick={uploadPicHandler}>
            Upload Picture
          </Button>
          {avatarContainer.showAvatarList ? (
            <Box sx={{ textAlign: "center" }}>
              <Button variant="text" onClick={pickAvatarApplyBtnHandler}>
                Apply
              </Button>
              <Button variant="text" onClick={pickAvatarCancelBtnHandler}>
                Cancel
              </Button>
            </Box>
          ) : (
            <Button
              variant="text"
              onClick={() =>
                setAvatarContainer((data) => ({
                  ...data,
                  index: 9999,
                  path: currentUserData.avatarUrl,
                  showAvatarList: !avatarContainer.showAvatarList,
                }))
              }
            >
              Choose Avatar
            </Button>
          )}

          {avatarContainer.showAvatarList && (
            <Paper
              elevation={1}
              sx={{
                width: "100%",
                maxHeight: 200,
                overflow: "auto",
                m: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {avatarList.map((item, i) => (
                <AvatarListItem key={i} item={item} selectedAvatar={avatarContainer.index} index={i} avatarClickHandler={avatarClickHandler} />
              ))}
            </Paper>
          )}
        </Paper>
        <Paper elevation={1} sx={{ display: "flex", width: { md: "40%" }, flexDirection: "column", p: 2, m: 1 }}>
          <Typography variant="subtitle1"> Profile Data </Typography>
          <Divider sx={{ width: "100%", my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <TextField
              required
              id="username"
              label="Username"
              defaultValue={currentUserData.name}
              onChange={(e) => {
                e.target.value === currentUserData.name ? setUsername(null) : setUsername(e.target.value);
              }}
              error={errorUn ? true : false}
              helperText={errorUn}
            />
            <Tooltip title="Username should be atleast 3 character long and should not be used by others">
              <HelpIcon sx={{ ml: 1, mr: "auto" }} />
            </Tooltip>
            <Button variant="text" onClick={usernameChangeHandler} disabled={!username && true}>
              Change Username
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <TextField
              required
              id="email"
              label="Email"
              defaultValue={currentUserData.email}
              onChange={(e) => {
                e.target.value === currentUserData.email ? setEmail(null) : setEmail(e.target.value);
              }}
              error={errorEm ? true : false}
              helperText={errorEm}
            />
            <Tooltip title="Email should be in a valid email ID format and an unique one">
              <HelpIcon sx={{ ml: 1, mr: "auto" }} />
            </Tooltip>
            <Button variant="text" onClick={emailChangeHandler} disabled={!email && true}>
              Change Email
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <TextField
              required
              id="password"
              label="Password"
              type="password"
              placeholder="**********"
              onChange={(e) => {
                setPwd(e.target.value);
              }}
              error={errorPwd ? true : false}
              helperText={errorPwd}
            />
            <Tooltip title="Password should be atleast 5 character long having 1 capital, 1 small letter, 1 digit and 1 special character without spaces">
              <HelpIcon sx={{ ml: 1, mr: "auto" }} />
            </Tooltip>

            <Button variant="text" onClick={pwdChangeHandler} disabled={!pwd && true}>
              Change Password
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography>Email Verified?:</Typography>
            <Typography sx={{ ml: 1, mr: "auto" }}>
              {auth.currentUser.emailVerified ? (
                <VerifiedIcon sx={{ color: "success.light" }} />
              ) : (
                <Tooltip title="Email not verified">
                  <GppMaybeIcon sx={{ color: "warning.dark" }} />
                </Tooltip>
              )}
            </Typography>
            {!auth.currentUser.emailVerified && (
              <Button variant="text" onClick={emVerifyHandler}>
                Verify Email
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
      <Paper elevation={1} sx={{ width: "80%", m: "auto" }}>
        <Typography variant="subtitle1" sx={{ mt: 3, pl: 2 }}>
          Danger Zone
        </Typography>
        <Divider sx={{ width: "100%", my: 1 }} />
        <Button variant="text" sx={{ my: "auto", pl: 2, color: "warning.dark" }} onClick={deleteAccountHandler}>
          Delete My Account
        </Button>
      </Paper>
    </Box>
  );
};

export default EditProfile;
