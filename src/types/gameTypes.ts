type PlayerType = {
  id: number;
  userId: string;
  playerName: string;
  money: number;
  hand: CardsType[];
  fields: FieldType[];
  thirdField: boolean;
  playerHat: HatType;
  tractor: boolean;
  otherPlayersHats: PlayerType["id"][];
  hasBoughtCards: boolean;
};

type FieldType = {
  id: number;
  crops: CardsType;
  manure: boolean;
};

type HatType = {
  ownerId: PlayerType["id"];
  owenedBy: PlayerType["id"];
};
type CardInformationType = {
  id: number;
  name: string;
  totalQuantity: number;
  value: [
    2 | 3 | 4,
    3 | 4 | 5 | 6 | null,
    4 | 5 | 6 | 7 | 8,
    7 | 8 | 9 | 10 | null,
  ];
};
type CardsType = {
  id: number | null;
  quantity: number;
};
type GameType = {
  players: PlayerType[];
  currentPlayer: CurrentPlayer;
  deck: CardInformationType["id"][];
  discardPile: CardsType[];
  round: 1 | 2 | 3 | 4;
  availableManures: number;
  availableTractors: number;
  endTurnReceivingCardsCount: 2 | 3;
  gameStatus: "initial" | "playing" | "finished";
};
type CurrentPlayer = {
  id: PlayerType["id"];
  turnStatus: "planting" | "marketing" | "addingCardsToHand";
  plantCounts: number;
  marketingCards: CardsType[];
  tradeOffer: TradeOffer;
};
type TradeOffer = {
  proposerId: PlayerType["id"];
  cardsFromProposersHand: CardsType[];
  cardsFromMarket: CardsType[];
  requestCards: CardsType[];
  otherPlayersHats: PlayerType["id"][];
  includePlayerHat: boolean;
};
type BuyType = "manure" | "tractor" | "cards" | "field";
export type {
  BuyType,
  PlayerType,
  CardsType,
  CardInformationType,
  HatType,
  FieldType,
  GameType,
  CurrentPlayer,
  TradeOffer,
};
