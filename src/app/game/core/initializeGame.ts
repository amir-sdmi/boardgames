import { fromDeckToHand } from "@/app/game/utils/cardsUtils";
import { shuffleArray } from "@/app/game/utils/utils";
import { UserType } from "@/types/firebaseTypes";
import {
  CardInformationType,
  CardsType,
  CurrentPlayer,
  GameType,
  PlayerType,
  TradeOffer,
} from "@/types/gameTypes";

const createNewPlayer = (
  id: number,
  playerName: string,
  userId: string,
): PlayerType => {
  return {
    id,
    userId,
    playerName,
    money: 0,
    hand: [],
    fields: [
      { id: 0, crops: null, manure: false },
      { id: 1, crops: null, manure: false },
    ],
    thirdField: false,
    playerHat: { ownerId: id, owenedBy: id },
    tractor: false,
    otherPlayersHats: [],
    hasBoughtCards: false,
  };
};

//TODO: chnage game for not having undefined here ! i did it by adding default to them
const activeCardsPerPlayer = (
  playerCount: number,
): { from: number; to: number } => {
  switch (playerCount) {
    case 3:
      return { from: 1, to: 3 };
    case 4:
      return { from: 0, to: 9 };
    case 5:
      return { from: 0, to: 10 };
    case 6:
      return { from: 0, to: 11 };
    case 7:
      return { from: 0, to: 12 };
    default:
      return { from: 1, to: 3 };
  }
};
//TODO: chnage game for not having undefined here ! i did it by adding default to them
const endTurnReceivingCards = (playerCount: number) => {
  switch (playerCount) {
    case 3:
      return 2;
    case 4:
      return 2;
    case 5:
      return 3;
    case 6:
      return 3;
    case 7:
      return 3;
    default:
      return 3;
  }
};

export const createNewGame = (
  roomPlayers: UserType[],
  cardData: CardInformationType[],
): GameType => {
  const players = roomPlayers.map((player, index) =>
    createNewPlayer(index, player.name, player.id),
  );
  //choosing initial player randomly
  const randomId: number = Math.floor(Math.random() * players.length);
  const currentPlayer: CurrentPlayer = {
    id: randomId,
    turnStatus: "planting",
    plantCounts: 0,
    marketingCards: [],
    tradeOffer: emptyTempTradeOffer(randomId),
  };
  //create deck of cards, randomly but with some rules, about number of players
  const filteredCards = cardData.filter(
    (card) =>
      card.id >= activeCardsPerPlayer(players.length).from &&
      card.id <= activeCardsPerPlayer(players.length).to,
  );
  const tempDeck: CardInformationType["id"][] = [];
  filteredCards.forEach((card) => {
    for (let i = 0; i < card.totalQuantity; i++) {
      tempDeck.push(card.id);
    }
  });
  const deck = shuffleArray(tempDeck);

  //giving five card to each player
  players.forEach((player) => {
    for (let i = 0; i < 5; i++) {
      const cardId = deck.pop();
      if (cardId) player.hand = fromDeckToHand(cardId, player.hand);
    }
  });

  const discardPile: CardsType[] = cardData.map((card) => {
    return { id: card.id, quantity: 0 };
  });

  return {
    players,
    currentPlayer,
    deck,
    discardPile,
    availableManures: players.length + 1,
    availableTractors: players.length,
    endTurnReceivingCardsCount: endTurnReceivingCards(players.length),
    round: 1,
    gameStatus: "initial",
  };
};

export const emptyTempTradeOffer = (
  currentPlayerId: PlayerType["id"],
): TradeOffer => {
  return {
    proposerId: currentPlayerId,
    cardsFromProposersHand: [],
    cardsFromMarket: [],
    requestCards: [],
    otherPlayersHats: [],
    includePlayerHat: false,
  };
};
