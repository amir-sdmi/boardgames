import { runGameStateTransaction } from "@/app/game/utils/gameStateUtils";
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
  await runGameStateTransaction(roomId, (gameState) => {
    const { currentPlayer, players } = gameState;

    const emptyPlayersDeals = players
      .filter((player) => player.id !== currentPlayer.id)
      .map((player) => ({
        playerId: player.id,
        accepted: null,
        newTradeOffer: null,
      }));

    const newTradeProposal: TradeProposalType = {
      ...currentPlayer.tradeProposal,
      proposerTradeOffer: tradeOffer,
      playersDeals: emptyPlayersDeals,
    };

    return {
      ...gameState,
      currentPlayer: {
        ...currentPlayer,
        tradeProposal: newTradeProposal,
      },
    };
  });
}

export async function acceptOrRejectTradeAction(
  roomId: string,
  dealerId: PlayerType["id"],
  acceptedOrNot: boolean,
) {
  await runGameStateTransaction(roomId, (gameState) => {
    const { currentPlayer } = gameState;

    if (!currentPlayer.tradeProposal?.playersDeals) {
      throw new Error("No trade proposal found");
    }

    const newPlayerDeal: PlayerDealType = {
      playerId: dealerId,
      accepted: acceptedOrNot,
      newTradeOffer: null,
    };

    const newPlayersDeals = currentPlayer.tradeProposal.playersDeals.map(
      (deal) => (deal.playerId === dealerId ? newPlayerDeal : deal),
    );

    return {
      ...gameState,
      currentPlayer: {
        ...currentPlayer,
        tradeProposal: {
          ...currentPlayer.tradeProposal,
          playersDeals: newPlayersDeals,
        },
      },
    };
  });
}

export async function dealerTradeOfferAction(
  roomId: string,
  tradeOffer: TradeOfferType,
  dealerId: PlayerType["id"],
) {
  await runGameStateTransaction(roomId, (gameState) => {
    const { currentPlayer } = gameState;

    if (!currentPlayer.tradeProposal?.playersDeals) {
      throw new Error("No trade proposal found");
    }

    const newPlayerDeal: PlayerDealType = {
      playerId: dealerId,
      accepted: null,
      newTradeOffer: tradeOffer,
    };

    const newPlayersDeals = currentPlayer.tradeProposal.playersDeals.map(
      (dealer) => (dealer.playerId === dealerId ? newPlayerDeal : dealer),
    );

    return {
      ...gameState,
      currentPlayer: {
        ...currentPlayer,
        tradeProposal: {
          ...currentPlayer.tradeProposal,
          playersDeals: newPlayersDeals,
        },
      },
    };
  });
}
