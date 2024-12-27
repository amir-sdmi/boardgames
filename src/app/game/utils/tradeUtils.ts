import { TradeOfferType } from "@/types/gameTypes";

export const emptyTradeOffer: TradeOfferType = {
  give: { marketCards: [], handCards: [], hats: [] },
  recieve: { expextedCards: [], expectedHats: false },
};
