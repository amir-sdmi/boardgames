import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { plantFromHand } from "../core/plantFromHand";
import { GameType } from "@/types/gameTypes";

export async function handlePlantFromHandAction(
  roomId: string,
  playerId: number,
  fieldIndex: number,
  cardId: number,
) {
  // Fetch the current game state
  const roomRef = doc(db, "rooms", roomId);
  const roomDoc = await getDoc(roomRef);

  if (!roomDoc.exists()) {
    throw new Error("Room not found");
  }

  const gameState = roomDoc.data().gameState as GameType;
  const { players, currentPlayer } = gameState;

  // Find the player
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not found");
  }

  // Perform game logic
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) {
    throw new Error("Card not found in hand");
  }

  const {
    hand: newHand,
    field: newField,
    currentPlayer: newCurrentPlayer,
  } = plantFromHand(
    player.hand,
    player.fields[fieldIndex],
    card,
    currentPlayer,
  );

  // Update the game state
  const updatedPlayers = players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          hand: newHand,
          fields: p.fields.map((f, i) => (i === fieldIndex ? newField : f)),
        }
      : p,
  );

  const updatedGameState = {
    ...gameState,
    players: updatedPlayers,
    currentPlayer: newCurrentPlayer,
  };

  await updateDoc(roomRef, {
    gameState: updatedGameState,
  });

  return updatedGameState;
}
