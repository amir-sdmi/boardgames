import { db } from "@/lib/firebase";
import { doc, FieldValue, getDoc, updateDoc } from "firebase/firestore";
import { GameType } from "@/types/gameTypes";

export async function fetchGameState(roomId: string): Promise<GameType> {
  const roomRef = doc(db, "rooms", roomId);
  const roomDoc = await getDoc(roomRef);

  if (!roomDoc.exists()) {
    throw new Error("Room not found");
  }

  return roomDoc.data().gameState as GameType;
}

export async function updateFirestoreDocument(
  collectionPath: string,
  docId: string,
  data: { [key: string]: FieldValue | Partial<unknown> | undefined },
): Promise<void> {
  const docRef = doc(db, collectionPath, docId);
  await updateDoc(docRef, data);
}
