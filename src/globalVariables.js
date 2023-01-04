import swal from "sweetalert";

export const globalVariables = {
  ROBOT_NAME: "Shakuni-The Robot",
  ROBOT_SHORTNAME: "Shakuni",
  red_dice_faces: [
    "/gifs/red-dice.gif",
    "/images/rdice1.png",
    "/images/rdice2.png",
    "/images/rdice3.png",
    "/images/rdice4.png",
    "/images/rdice5.png",
    "/images/rdice6.png",
  ],
  black_dice_faces: [
    "/gifs/black-dice.gif",
    "/images/bdice1.png",
    "/images/bdice2.png",
    "/images/bdice3.png",
    "/images/bdice4.png",
    "/images/bdice5.png",
    "/images/bdice6.png",
  ],
  default_dice: ["/images/passive-dice.png", "/images/active-dice.png"],
};

export const testUsername = (name) => {
  const usernamePattern = /^(?=.*[a-zA-Z]{1,})(?=.*[\d]{0,})[a-zA-Z0-9]{3,15}$/;
  //Validated user inputs
  if (!usernamePattern.test(name)) {
    // swal("Invalid Username", "Username either too short, too long or contain special characters!", "error");
    return null;
  }

  return name.charAt(0).toUpperCase() + name.toLowerCase().slice(1);
};

export const testEmail = (email) => {
  const emailPattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  //Validated user inputs
  if (!emailPattern.test(email)) {
    return false;
  }
  return true;
};

export const testPassword = (password) => {
  const emailPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/;
  //Validated user inputs
  if (!emailPattern.test(password)) {
    return false;
  }
  return true;
};

export const lightColors = ["#eae4e9", "#fff1e6", "#fde2e4", "#fad2e1", "#e2ece9", "#bee1e6", "#f0efeb", "#dfe7fd", "#cddafd"];
