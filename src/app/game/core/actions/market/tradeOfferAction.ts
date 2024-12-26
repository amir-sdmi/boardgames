import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import { CurrentPlayerType, TradeOfferType } from "@/types/gameTypes";

export async function tradeOfferAction(
  roomId: string,
  tradeOffer: TradeOfferType,
) {
  const gameState = await fetchGameState(roomId);
  const { currentPlayer } = gameState;

  const newCurrentPlayer: CurrentPlayerType = {
    ...currentPlayer,
    tradeProposal: {
      ...currentPlayer.tradeProposal,
      proposerTradeOffer: tradeOffer,
    },
  };

  const updatedGameState = {
    ...gameState,
    currentPlayer: newCurrentPlayer,
  };

  try {
    await updateFirestoreDocument("rooms", roomId, {
      gameState: updatedGameState,
    });
  } catch (error) {
    console.error("Error updating firestore document", error);
    throw new Error("Error updating firestore document");
  }
}
