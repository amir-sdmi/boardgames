import { CardInformationType, CardsType } from "@/types/gameTypes";
import { cardData } from "./cardData";

export function fromDeckToHand(
  cardId: CardInformationType["id"],
  hand: CardsType[],
) {
  const updatedHand = [...hand];

  // Find if the card already exists in hand
  const cardInHand = updatedHand.find((c) => c.id === cardId);

  if (cardInHand) {
    // Increase quantity if card is already in hand
    cardInHand.quantity++;
  } else {
    // Add the card to hand with quantity 1 if not already present
    updatedHand.push({ id: cardId, quantity: 1 });
  }

  return updatedHand;
}
export function cardImage(id: number | null) {
  if (id === null) return "";
  const foundCard = cardData.find((card) => card.id === id);
  return foundCard ? foundCard.icon : "";
}
export function cardName(id: number | null) {
  if (id === null) return "No card";
  const foundCard = cardData.find((card) => card.id === id);
  return foundCard ? foundCard.name : "Unknown card";
}

export function showHandCardsSeperately(hand: CardsType[]) {
  const seperatedHand: CardsType[] = [];

  hand.forEach((card) => {
    for (let i = 0; i < card.quantity; i++) {
      seperatedHand.push({ ...card, quantity: 1 });
    }
  });
  return seperatedHand;
}

export const updateCardQuantityMinusOne = (
  cards: CardsType[],
  cardId: CardsType["id"],
) => {
  if (!cards || !Array.isArray(cards)) {
    throw new Error("Cards parameter must be an array");
  }
  if (cardId === undefined || cardId === null) {
    throw new Error("CardId parameter is required");
  }
  return cards
    .map((c) => (c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c))
    .filter((c) => c.quantity > 0);
};
