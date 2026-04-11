import { fetchGameState, runGameStateTransaction } from "@/app/game/utils/gameStateUtils";
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

  const trader = findPlayer(players, currentPlayer.id);

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
    dealerId: dealer.id,
    traderId: trader.id,
    dealerGive,
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
    (d) => d.playerId === dealerId,
  );
  if (!deal?.newTradeOffer) throw new Error("Deal offer not found");

  const { marketCards, give, receive } = deal.newTradeOffer;

  const traderGive = receive.expectedCards;
  const dealerGive = give.handCards;
  const tradeDetails = {
    dealerId: dealer.id,
    traderId: trader.id,
    dealerGive,
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
    dealerId: PlayerType["id"];
    traderId: PlayerType["id"];
    dealerGive: CardsType[];
    traderGive: CardsType[];
    marketCards: CardsType[];
  };
}) {
  const proposalSnapshot = gameState.currentPlayer.tradeProposal;

  await runGameStateTransaction(roomId, (current) => {
    if (
      JSON.stringify(current.currentPlayer.tradeProposal) !==
      JSON.stringify(proposalSnapshot)
    ) {
      throw new Error("Trade proposal changed; please try again");
    }

    const { dealerId, traderId, dealerGive, traderGive, marketCards } =
      tradeDetails;
    const dealer = findPlayer(current.players, dealerId);
    const trader = findPlayer(current.players, traderId);
    const { currentPlayer } = current;

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

    const updatedPlayers = current.players.map((player) => {
      if (player.id === dealer.id) return updatedDealer;
      if (player.id === trader.id) return updatedTrader;
      return player;
    });

    return {
      ...current,
      players: updatedPlayers,
      currentPlayer: updatedCurrentPlayer,
    };
  });
}
