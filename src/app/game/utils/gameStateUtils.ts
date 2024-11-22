import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { GameType, PlayerType } from "@/types/gameTypes";

export async function fetchGameState(roomId: string): Promise<GameType> {
  const roomRef = doc(db, "rooms", roomId);
  const roomDoc = await getDoc(roomRef);

  if (!roomDoc.exists()) {
    throw new Error("Room not found");
  }

  return roomDoc.data().gameState as GameType;
}

export function findPlayer(
  players: PlayerType[],
  playerId: number,
): PlayerType {
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not found");
  }
  return player;
}
