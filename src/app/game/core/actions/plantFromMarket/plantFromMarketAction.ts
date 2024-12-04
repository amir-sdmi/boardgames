import { CardsType } from "@/types/gameTypes";
import { plantFromMarket } from "./plantFromMarket";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";

export async function plantFromMarketAction(
  roomId: string,
  playerId: number,
  fieldIndex: number,
  cardId: CardsType["id"],
  markettingCardId: number,
) {
  const gameState = await fetchGameState(roomId);
  const { players, currentPlayer } = gameState;

  const card = currentPlayer.marketingCards.find((c) => c.id === cardId);
  if (!card) throw new Error("Card not found in Marketing cards");

  const { currentPlayer: newCurrentPlayer, player } = plantFromMarket(
    currentPlayer,
    fieldIndex,
    players[currentPlayer.id],
    card,
    markettingCardId,
  );

  const updatedGameState = {
    ...gameState,
    players: players.map((p) => (p.id === playerId ? player : p)),
    currentPlayer: newCurrentPlayer,
  };
  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
}
