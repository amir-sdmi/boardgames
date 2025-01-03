import { StaticImageData } from "next/image";

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
  acceptedTrade: CardsType[] | null;
  color: StaticImageData;
};

type FieldType = {
  id: number;
  crops: CardsType | null;
  manure: boolean;
};

type HatType = {
  ownerId: PlayerType["id"];
  ownedBy: PlayerType["id"];
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
  svg: StaticImageData;
};
type CardsType = {
  id: number;
  quantity: number;
};
type GameType = {
  players: PlayerType[];
  currentPlayer: CurrentPlayerType;
  deck: CardInformationType["id"][];
  discardPile: CardsType[];
  round: number;
  availableManures: number;
  availableTractors: number;
  endTurnReceivingCardsCount: 2 | 3;
  gameStatus: "initial" | "playing" | "finished";
};
type CurrentPlayerType = {
  id: PlayerType["id"];
  turnStatus: "planting" | "marketing" | "addingCardsToHand";
  plantCounts: number;
  marketingCards: CardsType[];
  tradeProposal: TradeProposalType | null;
};
type TradeProposalType = {
  proposerTradeOffer: TradeOfferType;
  playersDeals: PlayerDealType[];
};
type PlayerDealType = {
  playerId: PlayerType["id"];
  accepted: boolean | null;
  newTradeOffer: TradeOfferType | null;
};
type TradeOfferType = {
  marketCards: {
    id: number;
    quantity: number;
    index: number;
  }[];

  give: {
    handCards: CardsType[];
    hats: HatType[];
  };
  receive: {
    expectedCards: CardsType[];
    expectedHats: boolean;
  };
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
  CurrentPlayerType,
  TradeProposalType,
  TradeOfferType,
  PlayerDealType,
};
