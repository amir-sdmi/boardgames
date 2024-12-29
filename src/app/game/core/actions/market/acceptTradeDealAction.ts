import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import {
  addCardsToArray,
  findPlayer,
  removeCardsFromArray,
} from "@/app/game/utils/utils";
import {
  CardsType,
  CurrentPlayerType,
  GameType,
  PlayerType,
} from "@/types/gameTypes";
async function fetchTradeDetails(roomId: string, dealerId: PlayerType["id"]) {
  const gameState = await fetchGameState(roomId);
  const { players, currentPlayer } = gameState;

  const dealer = findPlayer(players, dealerId);
  if (!dealer) throw new Error(`Dealer not found for dealerId: ${dealerId}`);

  const trader = findPlayer(players, currentPlayer.id);
  if (!trader)
    throw new Error(`Trader not found for playerId: ${currentPlayer.id}`);

  return { gameState, dealer, trader, currentPlayer };
}
export async function acceptBetweenAcceptedPlayers(
  roomId: string,
  dealerId: PlayerType["id"],
) {
  const { gameState, dealer, trader, currentPlayer } = await fetchTradeDetails(
    roomId,
    dealerId,
  );
  const tradeOffer = currentPlayer.tradeProposal?.proposerTradeOffer;

  if (!tradeOffer) throw new Error("Trade offer not found");

  const { marketCards, give, receive } = tradeOffer;
  const traderGive = give.handCards;
  const dealerGive = receive.expectedCards;
  const tradeDetails = {
    dealer,
    dealerGive,
    trader,
    traderGive,
    marketCards,
  };
  await acceptTradeDealAction({
    roomId,
    gameState,
    tradeDetails,
  });
}
export async function acceptTradeDealFromDealerTile(
  roomId: string,
  dealerId: PlayerType["id"],
) {
  const { gameState, dealer, trader, currentPlayer } = await fetchTradeDetails(
    roomId,
    dealerId,
  );
  const deal = currentPlayer.tradeProposal?.playersDeals.find(
    (deal) => deal.playerId === dealerId,
  );
  if (!deal?.newTradeOffer) throw new Error("Deal offer not found");

  const { marketCards, give, receive } = deal.newTradeOffer;

  const traderGive = receive.expectedCards;
  const dealerGive = give.handCards;
  const tradeDetails = {
    dealer,
    dealerGive,
    trader,
    traderGive,
    marketCards,
  };

  await acceptTradeDealAction({
    roomId,
    gameState,
    tradeDetails,
  });
}
export async function acceptTradeDealAction({
  roomId,
  gameState,
  tradeDetails,
}: {
  roomId: string;
  gameState: GameType;
  tradeDetails: {
    dealer: PlayerType;
    dealerGive: CardsType[];
    trader: PlayerType;
    traderGive: CardsType[];
    marketCards: CardsType[];
  };
}) {
  const { currentPlayer, players } = gameState;
  const { dealer, dealerGive, trader, traderGive, marketCards } = tradeDetails;
  const newDealerHand = removeCardsFromArray(dealer.hand, dealerGive);
  const newTraderHand = removeCardsFromArray(trader.hand, traderGive);
  const dealerAcceptedTradeOffer: CardsType[] = addCardsToArray(
    traderGive,
    marketCards,
  );
  const traderAcceptedTradeOffer: CardsType[] = [...dealerGive];

  const newMaketingCards: CardsType[] = removeCardsFromArray(
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
    marketingCards: newMaketingCards,
    tradeProposal: null,
  };

  const updatedPlayers = players.map((player) => {
    if (player.id === dealer.id) return updatedDealer;
    if (player.id === trader.id) return updatedTrader;
    return player;
  });

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
