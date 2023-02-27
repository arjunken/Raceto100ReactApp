import { customAlphabet } from "nanoid";

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
  avatarFileSizeInKb: 200,
};
export const lightColors = ["#eae4e9", "#fff1e6", "#fde2e4", "#fad2e1", "#e2ece9", "#bee1e6", "#f0efeb", "#dfe7fd", "#cddafd"];
export const invitationExpiry = 50000;
export const inviteMaxJoins = 2;
//Joining Code format
export const nanoid = customAlphabet("1234567890abcdef", 6);
export const default_nonRegistered_gameMode = "1";
export const default_registered_gameMode = "2";
