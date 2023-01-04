//Firebase imports
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

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

export { auth, db, colRefP, colRefPn };
