import { describe, expect, it, vi } from "vitest";
import { liveActions } from "../../src/app/game/board/liveActions";
import { freshOffer } from "../../src/app/game/board/selectors";
import { boardFixture } from "../board/fixture";
import { PRICES } from "../../src/config/constants";
import { buyAction } from "../../src/app/game/core/actions/buy/buyAction";
import { harvestAction } from "../../src/app/game/core/actions/harvest/harvestAction";
import { plantFromHandAction } from "../../src/app/game/core/actions/plantFromHand/plantFromHandAction";
import { plantFromMarketAction } from "../../src/app/game/core/actions/plantFromMarket/plantFromMarketAction";
import { plantFromTradeAction } from "../../src/app/game/core/actions/plantFromTrade/plantFromTradeAction";
import { showMarketcardsAction } from "../../src/app/game/core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../../src/app/game/core/actions/addCardsToHandAction";
import {
  acceptOrRejectTradeAction,
  dealerTradeOfferAction,
  tradeOfferAction,
} from "../../src/app/game/core/actions/market/tradeOfferAction";
import {
  acceptBetweenAcceptedPlayers,
  acceptTradeDealFromDealerTile,
} from "../../src/app/game/core/actions/market/acceptTradeDealAction";
vi.mock("../../src/app/game/core/actions/buy/buyAction", () => ({
  buyAction: vi.fn(),
}));
vi.mock("../../src/app/game/core/actions/harvest/harvestAction", () => ({
  harvestAction: vi.fn(),
}));
vi.mock(
  "../../src/app/game/core/actions/plantFromHand/plantFromHandAction",
  () => ({ plantFromHandAction: vi.fn() }),
);
vi.mock(
  "../../src/app/game/core/actions/plantFromMarket/plantFromMarketAction",
  () => ({ plantFromMarketAction: vi.fn() }),
);
vi.mock(
  "../../src/app/game/core/actions/plantFromTrade/plantFromTradeAction",
  () => ({ plantFromTradeAction: vi.fn() }),
);
vi.mock("../../src/app/game/core/actions/market/showMarketcardsAction", () => ({
  showMarketcardsAction: vi.fn(),
}));
vi.mock("../../src/app/game/core/actions/addCardsToHandAction", () => ({
  addCardsToHandAction: vi.fn(),
}));
vi.mock("../../src/app/game/core/actions/market/tradeOfferAction", () => ({
  acceptOrRejectTradeAction: vi.fn(),
  dealerTradeOfferAction: vi.fn(),
  tradeOfferAction: vi.fn(),
}));
vi.mock("../../src/app/game/core/actions/market/acceptTradeDealAction", () => ({
  acceptBetweenAcceptedPlayers: vi.fn(),
  acceptTradeDealFromDealerTile: vi.fn(),
}));
describe("unchanged live command contracts", () => {
  it("routes each planting source and harvest to the existing actions", async () => {
    const actions = liveActions("room", 0, boardFixture());
    await actions.plant({ source: "hand", cardId: 1 }, 1);
    expect(plantFromHandAction).toHaveBeenCalledWith("room", 0, 1, 1);
    await actions.plant({ source: "market", cardId: 3, index: 0 }, 1);
    expect(plantFromMarketAction).toHaveBeenCalledWith("room", 0, 1, 3, 0);
    await actions.plant({ source: "trade", cardId: 2 }, 1);
    expect(plantFromTradeAction).toHaveBeenCalledWith("room", 0, 1, 2);
    await actions.harvest(0);
    expect(harvestAction).toHaveBeenCalledWith("room", 0, 0);
  });
  it("retains configured purchase prices and phase transition functions", async () => {
    const g = boardFixture(),
      actions = liveActions("room", 0, g);
    for (const type of ["tractor", "manure", "cards", "field"] as const) {
      await actions.buy(type, 1);
      expect(buyAction).toHaveBeenLastCalledWith(
        "room",
        0,
        type,
        PRICES[type],
        1,
      );
    }
    await actions.advance();
    expect(showMarketcardsAction).toHaveBeenCalledWith("room");
    g.currentPlayer.turnStatus = "marketing";
    await liveActions("room", 0, g).advance();
    expect(addCardsToHandAction).toHaveBeenCalledWith("room", 0);
  });
  it("routes original offers, responses, counters and both acceptance paths", async () => {
    const actions = liveActions("room", 0, boardFixture()),
      offer = freshOffer();
    await actions.propose(offer, false);
    expect(tradeOfferAction).toHaveBeenCalledWith("room", offer);
    await actions.propose(offer, true);
    expect(dealerTradeOfferAction).toHaveBeenCalledWith("room", offer, 0);
    await actions.respond(false);
    expect(acceptOrRejectTradeAction).toHaveBeenCalledWith("room", 0, false);
    await actions.accept(1, false);
    expect(acceptBetweenAcceptedPlayers).toHaveBeenCalledWith("room", 1);
    await actions.accept(1, true);
    expect(acceptTradeDealFromDealerTile).toHaveBeenCalledWith("room", 1);
  });
});
