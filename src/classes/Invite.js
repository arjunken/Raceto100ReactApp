import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, ColRefInv, colRefP } from "../firebase";
import { inviteMaxJoins } from "../globalVariables";

export class Invite {
  constructor(inviteId, player) {
    this.id = inviteId;
    this.player = player;
  }
  async publish() {
    await setDoc(doc(ColRefInv, this.id), {
      maxJoins: inviteMaxJoins,
      created_at: serverTimestamp(),
    });
    await setDoc(doc(ColRefInv, this.id, "room", auth.currentUser.uid), this.player);
    await updateDoc(doc(colRefP, auth.currentUser.uid), { hasInvite: true });
  }
}
