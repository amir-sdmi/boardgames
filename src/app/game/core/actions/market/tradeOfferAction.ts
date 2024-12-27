import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import {
  PlayerDealType,
  PlayerType,
  TradeOfferType,
  TradeProposalType,
} from "@/types/gameTypes";

export async function tradeOfferAction(
  roomId: string,
  tradeOffer: TradeOfferType,
) {
  const gameState = await fetchGameState(roomId);
  const { currentPlayer, players } = gameState;

  const emptyPlayersDeals = players
    .filter((player) => player.id !== currentPlayer.id)
    .map((player) => ({
      playerId: player.id,
      accepted: null,
      newTradeOffer: null,
    }));

  //TODO: change later
  const newTradeProposal: TradeProposalType = {
    ...currentPlayer.tradeProposal,
    proposerTradeOffer: tradeOffer,
    playersDeals: emptyPlayersDeals,
  };

  const updatedGameState = {
    ...gameState,
    currentPlayer: {
      ...currentPlayer,
      tradeProposal: newTradeProposal,
    },
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

export async function acceptOrRejectTradeAction(
  roomId: string,
  dealerId: PlayerType["id"],
  acceptedOrNot: boolean,
) {
  const gameState = await fetchGameState(roomId);
  const { currentPlayer } = gameState;

  const newPlayerDeal: PlayerDealType = {
    playerId: dealerId,
    accepted: acceptedOrNot,
    newTradeOffer: null,
  };

  const newPlayersDeals = currentPlayer.tradeProposal?.playersDeals.map(
    (deal) => (deal.playerId === dealerId ? newPlayerDeal : deal),
  );

  const updatedGameState = {
    ...gameState,
    currentPlayer: {
      ...currentPlayer,
      tradeProposal: {
        ...currentPlayer.tradeProposal,
        playersDeals: newPlayersDeals,
      },
    },
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
