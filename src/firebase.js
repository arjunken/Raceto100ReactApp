//Firebase imports
import {
  getFirestore,
  collection,
  updateDoc,
  increment,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  getDocs,
  deleteDoc,
  arrayRemove,
  addDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import Swal from "sweetalert2";
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from "firebase/storage";
import { typeOf } from "react-is";

//Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_ACCESS_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_SB,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEID,
};
initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();
const colRefP = collection(db, "players");
const colRefPn = collection(db, "playernames");
const ColRefInv = collection(db, "invites");
const storage = getStorage();
const storageRef = ref(storage);
const uploadsRef = ref(storage, "uploads");

//Registration
//username exists check
export const userNameCheck = async (name) => {
  const docRef = doc(colRefPn, "unames");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().names.includes(name);
  }
};

//User creation
export const handleUserCreation = async (email, password, username, playerData, playerRobodata, playerPrivateData) => {
  let uid = null;
  //Create the user
  await createUserWithEmailAndPassword(auth, email, password);
  //update additional details about the user
  await updateProfile(auth.currentUser, { displayName: username });
  //Send verification email
  await sendEmailVerification(auth.currentUser);
  //Create document in playernames collection
  await updateDoc(doc(colRefPn, "unames"), { names: arrayUnion(username) });
  //Sign user in
  await signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      uid = cred.user.uid;
    })
    .catch((ex) => {
      throw new Error("Error signing in user:", ex.message);
    });
  //Create document in players collection
  await setDoc(doc(colRefP, uid), {
    playerData: playerData,
    roboData: playerRobodata,
    privateData: playerPrivateData,
  });
  return uid;
};

//Sign In users

export const signInUser = async (email, password) => {
  let uid = null;
  const cred = await signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      uid = cred.user.uid;
    })
    .catch((ex) => {
      throw new Error("Error signing in user:", ex.message);
    });
  return uid;
};

//Save data after Game is over
export const saveData = async (uid, playersData, winner) => {
  await updateDoc(doc(colRefP, uid), {
    "playerData.gamesPlayed": increment(1),
    "playerData.gamesWon": winner.index === "0" ? increment(1) : increment(0),
    "playerData.gold": increment(playersData[0].gameSessionData.goldEarned),
    "playerData.diamond": increment(playersData[0].gameSessionData.diamondEarned),
    "playerData.totalScore": increment(playersData[0].gameSessionData.runningScore),
  });
  await updateDoc(doc(colRefP, uid, "collections", "robodata"), {
    "roboData.gamesPlayed": increment(1),
    "roboData.gamesWon": winner.index === "1" ? increment(1) : increment(0),
    "roboData.gold": increment(playersData[1].gameSessionData.goldEarned),
    "roboData.diamond": increment(playersData[1].gameSessionData.diamondEarned),
    "roboData.totalScore": increment(playersData[1].gameSessionData.runningScore),
  });
};

//Function to get users data
export const getCurrentUserData = async (userId) => {
  const docRef = doc(colRefP, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error();
  }
};

//Get all the players documents for Scoreboard display
export const getPlayerDocuments = async () => {
  const docs = await getDocs(colRefP);
  return docs;
};

//Reauthenticate user
const reAuthenticateUser = async () => {
  const { value: password } = await Swal.fire({
    title: "Enter your password",
    input: "password",
    inputLabel: "Require reauthentication: It's been a while since you logged in.",
    inputPlaceholder: "Enter your password",
    padding: "0 20px",
    inputAttributes: {
      maxlength: 20,
      autocapitalize: "off",
      autocorrect: "off",
    },
  });

  if (password) {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential)
      .then(() => {
        console.log("User Reauthenticated!");
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to reauthenticate the user! Try again.",
        });
      });
  }
};

//Upload avatar to Firebase
export const uploadAvatarToFb = async (file, filename) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    Swal.fire({
      text: "A avatar has been added! Click on Choose Avatar to view.",
      imageUrl: e.target.result,
      imageAlt: "The uploaded picture",
    });
  };
  reader.readAsDataURL(file);
  const imageRef = ref(uploadsRef, auth.currentUser.uid + "/" + filename);

  //Upload to Fb
  await uploadBytes(imageRef, file)
    .then((snapshot) => {
      console.log("Uploaded file to Firebase..");
    })
    .catch((ex) => {
      console.error("Error in uploading image:", ex);
    });

  //Get the URL and update users data
  // const pathReference = ref(uploadsRef, auth.currentUser.uid + "/" + filename);
  await getDownloadURL(ref(uploadsRef, auth.currentUser.uid + "/" + filename))
    .then(async (url) => {
      await updateProfile(auth.currentUser, {
        photoURL: url,
      })
        .then(() => {
          updateAvatar(url);
        })
        .catch((ex) => {
          throw new Error("error in setting URL to the profile:", ex.message);
        });
    })
    .catch((ex) => {
      console.log("Error in getting the URL");
    });
};

//Update user's email
export const updateUserEmail = async (newEmail) => {
  try {
    await updateEmail(auth.currentUser, newEmail);
  } catch {
    await reAuthenticateUser();
    await updateEmail(auth.currentUser, newEmail);
  }
  await updateDoc(doc(colRefP, auth.currentUser.uid), { "playerData.email": newEmail });
  await updateProfile(auth.currentUser, {
    emailVerified: false,
  });
  verifyEmail();
};

//Update Username
export const updateUsername = async (oldName, newName) => {
  await updateDoc(doc(colRefP, auth.currentUser.uid), {
    "playerData.name": newName,
  });
  await updateDoc(doc(colRefPn, "unames"), { names: arrayRemove(oldName) });
  await updateDoc(doc(colRefPn, "unames"), { names: arrayUnion(newName) });
  await updateProfile(auth.currentUser, {
    displayName: newName,
  });
  return;
};

//Update user password
export const updateUserPassword = async (pwd) => {
  try {
    await updatePassword(auth.currentUser, pwd);
  } catch {
    //Reauthenticate the user
    await reAuthenticateUser();
    await updatePassword(auth.currentUser, pwd);
  }
};

//Update Avatar
export const updateAvatar = async (avatarUrl) => {
  await updateDoc(doc(colRefP, auth.currentUser.uid), { "playerData.avatarUrl": avatarUrl });
};

//Send Email Verification
export const verifyEmail = async () => {
  await sendEmailVerification(auth.currentUser);
};

//

//Delete user account
export const deleteUsersData = async (name) => {
  updateDoc(doc(colRefPn, "unames"), { names: arrayRemove(name) });
  deleteDoc(doc(db, "players", auth.currentUser.uid));

  //Delete stored files
  const userUploadsRef = ref(uploadsRef, auth.currentUser.uid);
  listAll(userUploadsRef).then((res) => {
    res.items.forEach((el) => {
      deleteObject(ref(storage, el.fullPath))
        .then(() => {
          console.log("User related files deleted!");
        })
        .catch((error) => {
          console.error("Error deleting the user-related files from storage");
        });
    });
  });

  try {
    await deleteUser(auth.currentUser);
  } catch {
    //Reauthenticate the user
    await reAuthenticateUser();
    await deleteUser(auth.currentUser);
  }
};

//Delete the invite
const deleteMyInvite = async (inviteDocId) => {
  //Delete all the documents in the subcollection gameSessionData
  const colSnapshot = await getDocs(collection(db, "invites", inviteDocId, "gameSessionData"));
  colSnapshot.forEach((thisDoc) => {
    deleteDoc(doc(db, "invites", inviteDocId, "gameSessionData", thisDoc.id));
  });
  deleteDoc(doc(db, "invites", inviteDocId));
  await updateDoc(doc(colRefP, auth.currentUser.uid), { "privateData.inviteId": null, "privateData.joiningCode": null });
};

//Get current user invites
const getMyInvite = async (uid) => {
  const docRef = doc(colRefP, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    if (docSnap.data().privateData.inviteId !== "" && docSnap.data().privateData.inviteId !== null) {
      const inviteRef = doc(ColRefInv, docSnap.data().privateData.inviteId);
      const inviteSnap = await getDoc(inviteRef);
      if (inviteSnap.exists()) {
        return inviteSnap.data();
      }
    }
  }
};

//add player to the rooom
const addPlayerToGameRoom = async (invite, player) => {
  const inviteRef = doc(ColRefInv, invite.id);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, invite.id), { room: arrayUnion(player) });
  }
};

//remove player from the rooom
const removePlayerFromGameRoom = async (invite, player) => {
  const inviteRef = doc(ColRefInv, invite.id);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, invite.id), { room: arrayRemove(player) });
  }
};

//Update Game in Session
const updateGameInSession = async (inviteId) => {
  const inviteRef = doc(ColRefInv, inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, inviteId), { isGameInSession: true });
  }
};

//Update player turn
const updatePlayerTurn = async (index, inviteId) => {
  const inviteRef = doc(ColRefInv, inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, inviteId, "gameSessionData", "playerTurn"), { whoseTurn: inviteSnap.data().room[index].data.name });
  }
};

//Save Dice Results
const saveDiceResults = async (diceRes, inviteId) => {
  const inviteRef = doc(ColRefInv, inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, inviteId, "gameSessionData", "remoteDiceRes"), { remoteDiceRes: diceRes });
  }
};

//Save player game data
const savePlayerGameData = async (pGameData, inviteId) => {
  const inviteRef = doc(ColRefInv, inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    await updateDoc(doc(ColRefInv, inviteId, "gameSessionData", "remotePlayerGameData"), { remotePlayerGameData: pGameData });
  }
};

export {
  auth,
  db,
  colRefP,
  colRefPn,
  ColRefInv,
  getMyInvite,
  deleteMyInvite,
  reAuthenticateUser,
  addPlayerToGameRoom,
  removePlayerFromGameRoom,
  updateGameInSession,
  updatePlayerTurn,
  saveDiceResults,
  savePlayerGameData,
};
