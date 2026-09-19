import { describe, expect, it, vi } from "vitest";
import { buy } from "@/app/game/core/actions/buy/buy";
import { plantFromHand } from "@/app/game/core/actions/plantFromHand/plantFromHand";
import { plantFromMarket } from "@/app/game/core/actions/plantFromMarket/plantFromMarket";
import { plantFromTrade } from "@/app/game/core/actions/plantFromTrade/plantFromTrade";
import { harvest } from "@/app/game/core/actions/harvest/harvest";
import { findThePrice } from "@/app/game/core/actions/harvest/findThePrice";
import { createNewGame } from "@/app/game/core/initializeGame";
import { cardData } from "@/app/game/utils/cardData";
import { fromDeckToHand } from "@/app/game/utils/cardsUtils";
import { playerHasAllTheRequestedCards } from "@/app/game/utils/tradeUtils";
import {
  addCardsToArray,
  removeCardsFromArray,
  shuffleArray,
} from "@/app/game/utils/utils";
import { game, player } from "./fixtures";

// Characterization tests lock down current behavior; they do not establish the official game rules.
describe("current harvest prices", () => {
  const prices = [
    [2, null, 4, null],
    [2, 3, 5, null],
    [2, 4, 5, null],
    [2, 4, 6, null],
    [3, 4, 5, 7],
    [3, 5, 6, 7],
    [3, 5, 6, 8],
    [3, 5, 7, 8],
    [4, 5, 7, 8],
    [4, 6, 7, 8],
    [4, 6, 7, 9],
    [4, 6, 8, 9],
    [4, 6, 8, 10],
  ];
  it.each(prices.map((thresholds, id) => ({ id, thresholds })))(
    "card $id uses the recorded payout thresholds",
    ({ id, thresholds }) => {
      for (const manure of [false, true])
        for (let quantity = 0; quantity <= 12; quantity++) {
          let expected = 0;
          if (quantity >= 2)
            thresholds.forEach((threshold, index) => {
              if (threshold !== null && quantity + Number(manure) >= threshold)
                expected = index + 1;
            });
          expect(findThePrice({ id, quantity }, manure)).toBe(expected);
        }
    },
  );
  it("unknown crops pay zero", () =>
    expect(findThePrice({ id: 99, quantity: 10 }, false)).toBe(0));
  it("harvest clears crops, preserves manure, and adds all crops to discard", () => {
    const field = { id: 0, crops: { id: 1, quantity: 3 }, manure: true };
    const result = harvest(field, [{ id: 1, quantity: 2 }]);
    expect(result).toEqual({
      field: { id: 0, crops: null, manure: true },
      harvestMoney: 2,
      discardPile: [{ id: 1, quantity: 5 }],
    });
    expect(field.crops.quantity).toBe(3);
  });
  it("empty harvest pays nothing", () =>
    expect(harvest(player().fields[0], []).harvestMoney).toBe(0));
});

describe("current purchases", () => {
  it("buys a third field for the supplied price", () => {
    const result = buy(player(), [1, 2, 3], 3, 2, "field", 3);
    expect(result.updatedPlayer.money).toBe(7);
    expect(result.updatedPlayer.thirdField).toBe(true);
    expect(result.updatedPlayer.fields).toHaveLength(3);
  });
  it("does not buy a fourth field", () => {
    const p = player({
      fields: [...player().fields, { id: 2, crops: null, manure: false }],
    });
    expect(buy(p, [], 3, 2, "field", 3).updatedPlayer.money).toBe(10);
  });
  it("cannot buy with insufficient funds", () =>
    expect(
      buy(player({ money: 0 }), [], 3, 2, "tractor", 2).updatedPlayer.tractor,
    ).toBe(false));
  it("tractor ownership prevents another purchase", () =>
    expect(
      buy(player({ tractor: true }), [], 3, 2, "tractor", 2).updatedPlayer
        .money,
    ).toBe(10));
  it("manure reduces money and stock", () => {
    const result = buy(player(), [], 3, 2, "manure", 2, 0);
    expect(result.updatedPlayer.fields[0].manure).toBe(true);
    expect(result.updatedPlayer.money).toBe(8);
    expect(result.updatedManures).toBe(2);
  });
  it("buying cards draws three in pop order and marks the purchase", () => {
    const result = buy(player({ hand: [] }), [1, 2, 2, 0], 3, 2, "cards", 1);
    expect(result.updatedPlayer.hand).toEqual([
      { id: 0, quantity: 1 },
      { id: 2, quantity: 2 },
    ]);
    expect(result.updatedDeck).toEqual([1]);
    expect(result.updatedPlayer.money).toBe(9);
    expect(result.updatedPlayer.hasBoughtCards).toBe(true);
  });
  it("refuses a short purchase deck", () =>
    expect(() => buy(player(), [1], 3, 2, "cards", 1)).toThrow(
      "Not enough cards",
    ));
});

describe("current planting", () => {
  it("plants one hand card and increments the turn count", () => {
    const p = player();
    const result = plantFromHand(
      p.hand,
      p.fields[0],
      p.hand[0],
      game().currentPlayer,
    );
    expect(result.newHand).toEqual([
      { id: 1, quantity: 1 },
      { id: 2, quantity: 1 },
    ]);
    expect(result.newField.crops).toEqual({ id: 1, quantity: 1 });
    expect(result.newCurrentPlayer.plantCounts).toBe(1);
  });
  it("removes a consumed trade card", () => {
    const result = plantFromTrade(
      [{ id: 1, quantity: 1 }],
      player().fields[0],
      { id: 1, quantity: 1 },
    );
    expect(result.newAcceptedTrade).toEqual([]);
    expect(result.newField.crops).toEqual({ id: 1, quantity: 1 });
  });
  it("rejects planting a different crop into an occupied field", () => {
    const field = { id: 0, manure: false, crops: { id: 2, quantity: 1 } };
    expect(() =>
      plantFromTrade([{ id: 1, quantity: 1 }], field, { id: 1, quantity: 1 }),
    ).toThrow("different crop");
    expect(() =>
      plantFromHand(
        [{ id: 1, quantity: 1 }],
        field,
        { id: 1, quantity: 1 },
        game().currentPlayer,
      ),
    ).toThrow("different crop");
  });
  it("market planting removes the selected index", () => {
    const current = {
      ...game().currentPlayer,
      marketingCards: [
        { id: 1, quantity: 1 },
        { id: 2, quantity: 1 },
      ],
    };
    const result = plantFromMarket(
      current,
      0,
      player(),
      { id: 2, quantity: 1 },
      1,
    );
    expect(result.currentPlayer.marketingCards).toEqual([
      { id: 1, quantity: 1 },
    ]);
    expect(result.player.fields[0].crops).toEqual({ id: 2, quantity: 1 });
  });
});

describe("initialization and card utilities", () => {
  it.each([1, 2, 3, 4, 5, 6, 7])(
    "records initialization for %i players",
    (count) => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const result = createNewGame(
        Array.from({ length: count }, (_, i) => ({
          id: `u${i}`,
          name: `Player ${i}`,
        })),
        cardData,
      );
      expect(result.players).toHaveLength(count);
      expect(
        result.players.every(
          (p) => p.money === 10 && p.fields.length === 2 && !p.hasBoughtCards,
        ),
      ).toBe(true);
      expect(result.currentPlayer).toEqual(game().currentPlayer);
      expect(result.availableManures).toBe(count + 1);
      expect(result.availableTractors).toBe(count);
      expect(result.endTurnReceivingCardsCount).toBe(
        count === 3 || count === 4 ? 2 : 3,
      );
      expect(result.round).toBe(1);
      expect(result.gameStatus).toBe("initial");
      expect(result.discardPile.every((card) => card.quantity === 0)).toBe(
        true,
      );
    },
  );
  it("shuffle preserves the multiset and original array", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const input = [1, 2, 2, 3];
    const result = shuffleArray(input);
    expect(result).toEqual([2, 2, 3, 1]);
    expect(input).toEqual([1, 2, 2, 3]);
  });
  it("requested trade quantities must be present", () => {
    expect(
      playerHasAllTheRequestedCards(
        [{ id: 1, quantity: 2 }],
        [{ id: 1, quantity: 2 }],
      ),
    ).toBe(true);
    expect(
      playerHasAllTheRequestedCards(
        [{ id: 1, quantity: 1 }],
        [{ id: 1, quantity: 2 }],
      ),
    ).toBe(false);
    expect(playerHasAllTheRequestedCards([], [{ id: 1, quantity: 1 }])).toBe(
      false,
    );
  });
  it("groups added cards and removes exhausted stacks", () => {
    expect(fromDeckToHand(0, [])).toEqual([{ id: 0, quantity: 1 }]);
    expect(
      addCardsToArray([{ id: 1, quantity: 1 }], [{ id: 1, quantity: 2 }]),
    ).toEqual([{ id: 1, quantity: 3 }]);
    expect(
      removeCardsFromArray([{ id: 1, quantity: 2 }], [{ id: 1, quantity: 2 }]),
    ).toEqual([]);
  });
});

// These explicitly describe defects, not desired future rules. See docs/REMAINING_WORK.md.
describe("known legacy behavior preserved by request", () => {
  it("GAME-01: initialization drops card zero after drawing it", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = createNewGame(
      Array.from({ length: 4 }, (_, i) => ({ id: String(i), name: "Player" })),
      cardData,
    );
    expect(
      result.players[0].hand.reduce((sum, card) => sum + card.quantity, 0),
    ).toBe(4);
  });
  it("GAME-02: card helpers mutate nested input objects", () => {
    const hand = [{ id: 1, quantity: 1 }];
    fromDeckToHand(1, hand);
    expect(hand[0].quantity).toBe(2);
    const p = player();
    buy(p, [], 3, 2, "field", 3);
    expect(p.fields).toHaveLength(3);
  });
  it("GAME-03: zero stock does not prevent tractor purchase", () =>
    expect(buy(player(), [], 0, 0, "tractor", 2).updatedTractors).toBe(-1));
});
