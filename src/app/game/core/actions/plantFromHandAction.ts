import {
  CardsType,
  GameType,
  CurrentPlayer,
  FieldType,
} from "@/types/gameTypes";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../utils/gameStateUtils";
import { findPlayer } from "../../utils/utils";

const plantFromHand = (
  hand: CardsType[],
  field: FieldType,
  card: CardsType,
  currentPlayer: CurrentPlayer,
) => {
  if (field.crops === null || field.crops.id === card.id) {
    const newHand = hand.filter((c) => c.id !== card.id || --c.quantity > 0);
    const newField = {
      ...field,
      crops: { id: card.id, quantity: (field.crops?.quantity || 0) + 1 },
    };

    return {
      newHand,
      newField,
      newCurrentPlayer: {
        ...currentPlayer,
        plantCounts: currentPlayer.plantCounts + 1,
      },
    };
  } else {
    throw new Error("Field already has a different crop");
  }
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

  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
}
