import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import { findPlayer } from "@/app/game/utils/utils";
import { plantFromTrade } from "./plantFromTrade";

export async function plantFromTradeAction(
  roomId: string,
  playerId: number,
  fieldIndex: number,
  cardId: number,
) {
  const gameState = await fetchGameState(roomId);
  const { players } = gameState;

  const player = findPlayer(players, playerId);
  if (!player.acceptedTrade || player.acceptedTrade.length === 0)
    throw new Error("No accepted trade found");
  const card = player.acceptedTrade.find((c) => c.id === cardId);
  if (!card) throw new Error("Card not found in trade");

  const { newAcceptedTrade, newField } = plantFromTrade(
    player.acceptedTrade,
    player.fields[fieldIndex],
    card,
  );

  const updatedPlayers = players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          acceptedTrade: newAcceptedTrade,
          fields: p.fields.map((f, i) => (i === fieldIndex ? newField : f)),
        }
      : p,
  );

  const updatedGameState = {
    ...gameState,
    players: updatedPlayers,
  };

  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
}
