import { serverTimestamp } from "firebase/firestore";
export class Player {
  constructor(name) {
    this.data = {
      name: name,
      email: "",
      avatarUrl: "/avatars/avatar0.jpg",
      isRegistered: false,
      gold: 0,
      diamond: 0,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: serverTimestamp(),
    };
    this.robodata = {
      gold: 0,
      diamond: 0,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
    };
    this.gameSessionData = {
      runningScore: 0,
      prevScore: 0,
      goldEarned: 0,
      diamondEarned: 0,
      winner: false,
    };
  }
  setData(key, value) {
    this.data[key] = value;
  }
  setGameSessionData(key, value) {
    this.gameSessionData[key] = value;
  }
  update(key, value) {
    this[key] = value;
  }
}
