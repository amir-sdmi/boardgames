import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import {
  addCardsToArray,
  findPlayer,
  removeCardsFromArray,
} from "@/app/game/utils/utils";
import { CardsType, CurrentPlayerType, PlayerType } from "@/types/gameTypes";

export async function acceptTradeDealAction(
  roomId: string,
  dealerId: PlayerType["id"],
) {
  const gameState = await fetchGameState(roomId);
  const { currentPlayer, players } = gameState;

  const dealer = findPlayer(players, dealerId);
  if (!dealer) throw new Error("Dealer not found");
  const trader = findPlayer(players, currentPlayer.id);
  const deal = currentPlayer.tradeProposal?.playersDeals.find(
    (deal) => deal.playerId === dealerId,
  );
  if (!deal?.newTradeOffer) throw new Error("Deal offer not found");
  const { marketCards, give, receive } = deal.newTradeOffer;

  // dealer, should remove giving cards from hand and add received cards to accepted TradeOffer
  // trader, should remove received cards from hand and add giving cards to accepted TradeOffer

  const newDealerHand = removeCardsFromArray(dealer.hand, give.handCards);
  const newTraderHand = removeCardsFromArray(
    trader.hand,
    receive.expectedCards,
  );

  const dealerAcceptedTradeOffer: CardsType[] = addCardsToArray(
    receive.expectedCards,
    marketCards,
  );
  const traderAcceptedTradeOffer: CardsType[] = [...give.handCards];

  const newMakettingCards: CardsType[] = removeCardsFromArray(
    currentPlayer.marketingCards,
    marketCards,
  );
  const updatedDealer: PlayerType = {
    ...dealer,
    hand: newDealerHand,
    acceptedTrade: dealerAcceptedTradeOffer,
  };
  const updatedTrader: PlayerType = {
    ...trader,
    hand: newTraderHand,
    acceptedTrade: traderAcceptedTradeOffer,
  };
  const updatedCurrentPlayer: CurrentPlayerType = {
    ...currentPlayer,
    marketingCards: newMakettingCards,
    tradeProposal: null,
  };

  const updatedPlayers = players.map((player) =>
    player.id === dealerId
      ? updatedDealer
      : player.id === trader.id
        ? updatedTrader
        : player,
  );

  const updatedGameState = {
    ...gameState,
    players: updatedPlayers,
    currentPlayer: updatedCurrentPlayer,
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
