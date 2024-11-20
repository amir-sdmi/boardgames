import { db } from "@/lib/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
export default async function getPlayer(roomId: string) {
  const gameStateRef = collection(db, "rooms", roomId, "gameState");
  const gameStateDoc = doc(gameStateRef);
}
