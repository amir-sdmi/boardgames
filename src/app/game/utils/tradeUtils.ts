import { TradeOfferType } from "@/types/gameTypes";

export const emptyTradeOffer: TradeOfferType = {
  marketCards: [],
  give: { handCards: [], hats: [] },
  receive: { expectedCards: [], expectedHats: false },
};
