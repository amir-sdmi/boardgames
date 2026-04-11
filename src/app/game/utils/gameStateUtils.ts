import { db } from "@/lib/firebase";
import {
  doc,
  FieldValue,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { GameType } from "@/types/gameTypes";

export async function runGameStateTransaction(
  roomId: string,
  updateFn: (gameState: GameType) => GameType,
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId);
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) {
      throw new Error("Room not found");
    }
    const data = roomDoc.data();
    if (!data?.gameState) {
      throw new Error("Invalid game state");
    }
    const gameState = data.gameState as GameType;
    const updatedGameState = updateFn(gameState);
    transaction.update(roomRef, { gameState: updatedGameState });
  });
}

export async function fetchGameState(roomId: string): Promise<GameType> {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomDoc = await getDoc(roomRef);
    if (!roomDoc.exists()) {
      throw new Error("Room not found");
    }

    const data = roomDoc.data();
    if (!data?.gameState) {
      throw new Error("Invalid game state");
    }
    return data.gameState as GameType;
  } catch (err) {
    console.error(`Failed to fetch game state for room "${roomId}":`, err);
    throw err; //
  }
}

export async function updateFirestoreDocument(
  collectionPath: string,
  docId: string,
  data: Record<string, FieldValue | Partial<unknown> | undefined>,
): Promise<void> {
  const docRef = doc(db, collectionPath, docId);
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Document ${docId} not found in ${collectionPath}`);
    }
    await updateDoc(docRef, data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update document");
  }
}
