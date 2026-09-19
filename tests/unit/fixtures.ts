import type { GameType, PlayerType } from "@/types/gameTypes";

export function player(overrides: Partial<PlayerType> = {}): PlayerType {
  return {
    id: 0,
    userId: "user-0",
    playerName: "Player Zero",
    money: 10,
    hand: [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ],
    fields: [
      { id: 0, crops: null, manure: false },
      { id: 1, crops: null, manure: false },
    ],
    thirdField: false,
    playerHat: { ownerId: 0, ownedBy: 0 },
    tractor: false,
    otherPlayersHats: [],
    hasBoughtCards: false,
    acceptedTrade: null,
    fieldImage: { src: "/test-field.png", width: 1, height: 1 },
    color: "#61cf59",
    ...overrides,
  };
}

export function game(overrides: Partial<GameType> = {}): GameType {
  return {
    players: [player(), player({ id: 1, userId: "user-1" })],
    currentPlayer: {
      id: 0,
      turnStatus: "planting",
      plantCounts: 0,
      marketingCards: [],
      tradeProposal: null,
    },
    deck: [1, 2, 3, 4, 5],
    discardPile: [
      { id: 1, quantity: 0 },
      { id: 2, quantity: 0 },
    ],
    round: 1,
    availableManures: 3,
    availableTractors: 2,
    endTurnReceivingCardsCount: 2,
    gameStatus: "initial",
    ...overrides,
  };
}
