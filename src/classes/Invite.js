import { addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import _ from "lodash";
import { auth, ColRefInv, colRefP } from "../firebase";
import { inviteMaxJoins } from "../globalVariables";

export class Invite {
  constructor(inviteId, player, targetScore = 100) {
    this.id = inviteId;
    this.invitedBy = player.data.name;
    this.maxJoins = inviteMaxJoins;
    this.isGameInSession = false;
    this.targetScore = targetScore;
    this.room = [player];
    this.created_at = Date.now();
  }
  async publish(joiningCode) {
    await setDoc(doc(ColRefInv, this.id), {
      id: this.id,
      invitedBy: this.invitedBy,
      maxJoins: this.maxJoins,
      isGameInSession: this.isGameInSession,
      targetScore: this.targetScore,
      room: this.room,
      created_at: this.created_at,
    });
    await setDoc(doc(ColRefInv, this.id, "gameSessionData", "playerTurn"), { whoseTurn: this.invitedBy });
    await setDoc(doc(ColRefInv, this.id, "gameSessionData", "remoteDiceRes"), { remoteDiceRes: null });
    await setDoc(doc(ColRefInv, this.id, "gameSessionData", "remotePlayerGameData"), { remotePlayerGameData: null, turn: 0 });
    await setDoc(doc(ColRefInv, this.id, "gameSessionData", "standings"), { player1Wins: 0, player2Wins: 0 });
    await setDoc(doc(ColRefInv, this.id, "gameSessionData", "playAgainRequested"), {
      playAgainRequested: false,
      requester: null,
      playAgainAccepted: null,
    });
    await updateDoc(doc(colRefP, auth.currentUser.uid), {
      "privateData.inviteId": this.id,
      "privateData.joiningCode": joiningCode,
    });
  }
}
