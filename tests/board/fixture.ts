import { game, player } from "../unit/fixtures";
import { freshOffer } from "../../src/app/game/board/selectors";
import type { GameType } from "../../src/types/gameTypes";
export function boardFixture(): GameType {
  return game({
    gameStatus: "playing",
    round: 2,
    players: [
      player({
        playerName: "Alex",
        money: 12,
        color: "#dce7b7",
        fields: [
          { id: 0, crops: { id: 3, quantity: 3 }, manure: true },
          { id: 1, crops: null, manure: false },
        ],
        hand: [
          { id: 1, quantity: 3 },
          { id: 2, quantity: 2 },
          { id: 5, quantity: 1 },
          { id: 8, quantity: 2 },
          { id: 3, quantity: 1 },
        ],
      }),
      player({
        id: 1,
        userId: "user-1",
        playerName: "Maya",
        money: 8,
        color: "#e6c7b8",
        fields: [
          { id: 0, crops: { id: 2, quantity: 4 }, manure: false },
          { id: 1, crops: null, manure: false },
        ],
      }),
      player({
        id: 2,
        userId: "user-2",
        playerName: "Oliver",
        money: 15,
        color: "#d6dcb4",
      }),
      player({
        id: 3,
        userId: "user-3",
        playerName: "Sofia",
        money: 6,
        color: "#c3dcd7",
      }),
    ],
    currentPlayer: {
      id: 0,
      turnStatus: "planting",
      plantCounts: 0,
      marketingCards: [
        { id: 3, quantity: 1 },
        { id: 1, quantity: 1 },
      ],
      tradeProposal: null,
    },
    deck: Array.from({ length: 42 }, (_, i) => i % 13),
    discardPile: [
      { id: 3, quantity: 4 },
      { id: 1, quantity: 2 },
    ],
  });
}
export function incomingFixture() {
  const state = boardFixture();
  const offer = freshOffer();
  offer.marketCards = [{ id: 3, quantity: 1, index: 0 }];
  offer.receive.expectedCards = [{ id: 1, quantity: 1 }];
  state.currentPlayer.id = 1;
  state.currentPlayer.turnStatus = "marketing";
  state.currentPlayer.tradeProposal = {
    proposerTradeOffer: offer,
    playersDeals: [{ playerId: 0, accepted: null, newTradeOffer: null }],
  };
  return state;
}
