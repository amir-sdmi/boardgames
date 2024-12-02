import { GameType } from "@/types/gameTypes";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../../utils/gameStateUtils";
import { findPlayer } from "../../../utils/utils";
import { plantFromHand } from "./plantFromHand";

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
