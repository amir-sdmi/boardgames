import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameType } from "@/types/gameTypes";
import { game, player } from "./fixtures";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "@/app/game/utils/gameStateUtils";
import { addCardsToHandAction } from "@/app/game/core/actions/addCardsToHandAction";
import { showMarketcardsAction } from "@/app/game/core/actions/market/showMarketcardsAction";
import { nextRound } from "@/app/game/core/gameMaster";
import {
  tradeOfferAction,
  acceptOrRejectTradeAction,
  dealerTradeOfferAction,
} from "@/app/game/core/actions/market/tradeOfferAction";
import {
  acceptBetweenAcceptedPlayers,
  acceptTradeDealFromDealerTile,
} from "@/app/game/core/actions/market/acceptTradeDealAction";
import { emptyTradeOffer } from "@/app/game/utils/tradeUtils";
import { plantFromHandAction } from "@/app/game/core/actions/plantFromHand/plantFromHandAction";
import { plantFromMarketAction } from "@/app/game/core/actions/plantFromMarket/plantFromMarketAction";
import { plantFromTradeAction } from "@/app/game/core/actions/plantFromTrade/plantFromTradeAction";
import { harvestAction } from "@/app/game/core/actions/harvest/harvestAction";
import { buyAction } from "@/app/game/core/actions/buy/buyAction";

vi.mock("@/app/game/utils/gameStateUtils", () => ({
  fetchGameState: vi.fn(),
  updateFirestoreDocument: vi.fn(),
}));
let state: GameType;
beforeEach(() => {
  state = game();
  vi.mocked(fetchGameState).mockImplementation(async () =>
    structuredClone(state),
  );
  vi.mocked(updateFirestoreDocument).mockImplementation(
    async (_collection, _id, update) => {
      state = structuredClone(update.gameState as GameType);
    },
  );
});

describe("game actions with an in-memory persistence boundary", () => {
  it("draws end-of-turn cards and advances to the next player", async () => {
    await addCardsToHandAction("room", 0);
    expect(state.deck).toEqual([1, 2, 3]);
    expect(state.players[0].hand.slice(-2)).toEqual([
      { id: 5, quantity: 1 },
      { id: 4, quantity: 1 },
    ]);
    expect(state.currentPlayer).toEqual({
      id: 1,
      turnStatus: "planting",
      plantCounts: 0,
      marketingCards: [],
      tradeProposal: null,
    });
    expect(updateFirestoreDocument).toHaveBeenCalledWith("rooms", "room", {
      gameState: state,
    });
  });
  it("wraps turn order after the last player", async () => {
    state.currentPlayer.id = 1;
    await addCardsToHandAction("room", 1);
    expect(state.currentPlayer.id).toBe(0);
  });
  it("shows two market cards in deck order", async () => {
    await showMarketcardsAction("room");
    expect(state.currentPlayer.marketingCards).toEqual([
      { id: 5, quantity: 1 },
      { id: 4, quantity: 1 },
    ]);
    expect(state.currentPlayer.turnStatus).toBe("marketing");
    expect(state.deck).toEqual([1, 2, 3]);
  });
  it("recycles discard and marks the game finished after round three", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    state.round = 3;
    state.deck = [];
    state.discardPile = [{ id: 1, quantity: 2 }];
    await nextRound("room");
    expect(state.round).toBe(4);
    expect(state.gameStatus).toBe("finished");
    expect(state.deck).toEqual([1, 1]);
    expect(state.discardPile.every((card) => card.quantity === 0)).toBe(true);
  });
  it("plants a hand card through the persistence boundary", async () => {
    await plantFromHandAction("room", 0, 0, 1);
    expect(state.players[0].fields[0].crops).toEqual({ id: 1, quantity: 1 });
    expect(state.currentPlayer.plantCounts).toBe(1);
  });
  it("plants a market card through the persistence boundary", async () => {
    state.currentPlayer.marketingCards = [{ id: 2, quantity: 1 }];
    await plantFromMarketAction("room", 0, 0, 2, 0);
    expect(state.players[0].fields[0].crops).toEqual({ id: 2, quantity: 1 });
    expect(state.currentPlayer.marketingCards).toEqual([]);
  });
  it("plants an accepted trade through the persistence boundary", async () => {
    state.players[0].acceptedTrade = [{ id: 1, quantity: 1 }];
    await plantFromTradeAction("room", 0, 0, 1);
    expect(state.players[0].acceptedTrade).toEqual([]);
    expect(state.players[0].fields[0].crops).toEqual({ id: 1, quantity: 1 });
  });
  it("persists harvest money and discard changes", async () => {
    state.players[0].fields[0].crops = { id: 1, quantity: 3 };
    await harvestAction("room", 0, 0);
    expect(state.players[0].money).toBe(12);
    expect(state.players[0].fields[0].crops).toBeNull();
    expect(state.discardPile[0].quantity).toBe(3);
  });
  it("persists purchases", async () => {
    await buyAction("room", 0, "tractor", 2);
    expect(state.players[0].tractor).toBe(true);
    expect(state.players[0].money).toBe(8);
    expect(state.availableTractors).toBe(1);
  });
  it("creates and accepts the proposer's trade", async () => {
    state.currentPlayer.marketingCards = [{ id: 2, quantity: 1 }];
    const offer = {
      ...structuredClone(emptyTradeOffer),
      marketCards: [{ id: 2, quantity: 1, index: 0 }],
      give: { handCards: [{ id: 1, quantity: 1 }], hats: [] },
      receive: { expectedCards: [{ id: 1, quantity: 1 }], expectedHats: false },
    };
    await tradeOfferAction("room", offer);
    expect(state.currentPlayer.tradeProposal?.playersDeals).toEqual([
      { playerId: 1, accepted: null, newTradeOffer: null },
    ]);
    await acceptOrRejectTradeAction("room", 1, true);
    expect(state.currentPlayer.tradeProposal?.playersDeals[0].accepted).toBe(
      true,
    );
    await acceptBetweenAcceptedPlayers("room", 1);
    expect(state.currentPlayer.tradeProposal).toBeNull();
    expect(state.currentPlayer.marketingCards).toEqual([]);
    expect(state.players[0].acceptedTrade).toEqual([{ id: 1, quantity: 1 }]);
    expect(state.players[1].acceptedTrade).toEqual([
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1, index: 0 },
    ]);
    expect(
      state.players.map((p) => p.hand.find((c) => c.id === 1)?.quantity),
    ).toEqual([1, 1]);
  });
  it("records a rejection and replaces it with a counteroffer", async () => {
    await tradeOfferAction("room", structuredClone(emptyTradeOffer));
    await acceptOrRejectTradeAction("room", 1, false);
    expect(state.currentPlayer.tradeProposal?.playersDeals[0].accepted).toBe(
      false,
    );
    const counter = {
      ...structuredClone(emptyTradeOffer),
      give: { handCards: [{ id: 2, quantity: 1 }], hats: [] },
      receive: { expectedCards: [{ id: 1, quantity: 1 }], expectedHats: false },
    };
    await dealerTradeOfferAction("room", counter, 1);
    expect(
      state.currentPlayer.tradeProposal?.playersDeals[0].accepted,
    ).toBeNull();
    await acceptTradeDealFromDealerTile("room", 1);
    expect(state.players[0].acceptedTrade).toEqual([{ id: 2, quantity: 1 }]);
    expect(state.players[1].acceptedTrade).toEqual([{ id: 1, quantity: 1 }]);
  });
});

describe("known action defects preserved by request", () => {
  it("GAME-01: the market rejects a valid zero card ID", async () => {
    state.deck = [1, 2, 0];
    await expect(showMarketcardsAction("room")).rejects.toThrow(
      "Card not found in deck",
    );
    expect(updateFirestoreDocument).not.toHaveBeenCalled();
  });
  it("GAME-04: ending a turn does not reset hasBoughtCards", async () => {
    state.players[0] = player({ hasBoughtCards: true });
    await addCardsToHandAction("room", 0);
    expect(state.players[0].hasBoughtCards).toBe(true);
  });
});
