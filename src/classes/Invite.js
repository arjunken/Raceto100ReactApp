import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import _ from "lodash";
import { auth, ColRefInv, colRefP } from "../firebase";
import { inviteMaxJoins } from "../globalVariables";

export class Invite {
  constructor(inviteId, player) {
    this.id = inviteId;
    this.maxJoins = inviteMaxJoins;
    this.player = player;
    this.created_at = Date.now();
  }
  async publish() {
    await setDoc(doc(ColRefInv, this.id), {
      id: this.id,
      maxJoins: this.maxJoins,
      created_at: this.created_at,
    });
    await setDoc(doc(ColRefInv, this.id, "room", auth.currentUser.uid), this.player);
    await updateDoc(doc(colRefP, auth.currentUser.uid), { hasInvite: true, inviteId: this.id });
  }
}
