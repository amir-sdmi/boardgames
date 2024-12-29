import { CardsType, TradeOfferType } from "@/types/gameTypes";

export const emptyTradeOffer: TradeOfferType = {
  marketCards: [],
  give: { handCards: [], hats: [] },
  receive: { expectedCards: [], expectedHats: false },
};

export function playerHasAllTheRequestedCards(
  playerHand: CardsType[],
  requestedCards: CardsType[],
) {
  return requestedCards.every((requestedCard) => {
    const playerCard = playerHand.find((card) => card.id === requestedCard.id);
    return (
      playerCard !== undefined && playerCard.quantity >= requestedCard.quantity
    );
  });
}
