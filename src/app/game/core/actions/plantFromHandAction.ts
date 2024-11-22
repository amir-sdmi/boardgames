import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  CardsType,
  GameType,
  CurrentPlayer,
  FieldType,
} from "@/types/gameTypes";
import { fetchGameState, findPlayer } from "../../utils/gameStateUtils";

const plantFromHand = (
  hand: CardsType[],
  field: FieldType,
  card: CardsType,
  currentPlayer: CurrentPlayer,
) => {
  const newHand = hand.filter((c) => c.id !== card.id || --c.quantity > 0);
  const newField =
    field.crops?.id === card.id || !field.crops?.quantity
      ? {
          ...field,
          crops: { id: card.id, quantity: (field.crops?.quantity || 0) + 1 },
        }
      : field;

  return {
    newHand,
    newField,
    newCurrentPlayer: {
      ...currentPlayer,
      plantCounts: currentPlayer.plantCounts + 1,
    },
  };
};

export async function plantFromHandAction(
  roomId: string,
  playerId: number,
  fieldIndex: number,
  cardId: number,
) {
  const gameState = await fetchGameState(roomId);
  const { players, currentPlayer } = gameState;

  const player = findPlayer(players, playerId);

  const card = player.hand.find((c) => c.id === cardId);
  if (!card) throw new Error("Card not found in hand");

  const { newHand, newField, newCurrentPlayer } = plantFromHand(
    player.hand,
    player.fields[fieldIndex],
    card,
    currentPlayer,
  );

  const updatedPlayers = players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          hand: newHand,
          fields: p.fields.map((f, i) => (i === fieldIndex ? newField : f)),
        }
      : p,
  );

  const updatedGameState: GameType = {
    ...gameState,
    players: updatedPlayers,
    currentPlayer: newCurrentPlayer,
  };

  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { gameState: updatedGameState });
}
