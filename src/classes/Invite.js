import { addDoc, doc, updateDoc } from "firebase/firestore";
import _ from "lodash";
import { auth, ColRefInv, colRefP } from "../firebase";
import { inviteMaxJoins } from "../globalVariables";

export class Invite {
  constructor(inviteId, player) {
    this.id = inviteId;
    this.invitedBy = player.data.name;
    this.maxJoins = inviteMaxJoins;
    this.room = [player];
    this.created_at = Date.now();
  }
  async publish(joiningCode) {
    const docRef = await addDoc(ColRefInv, {
      id: this.id,
      invitedBy: this.invitedBy,
      maxJoins: this.maxJoins,
      created_at: this.created_at,
      room: this.room,
    });
    await updateDoc(doc(colRefP, auth.currentUser.uid), {
      "privateData.inviteId": [docRef.id, this.id],
      "privateData.joiningCode": joiningCode,
    });
  }
}
