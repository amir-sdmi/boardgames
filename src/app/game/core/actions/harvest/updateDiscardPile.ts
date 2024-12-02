import { CardsType } from "@/types/gameTypes";

export function updateDiscardPile(
  discardPile: CardsType[],
  crops: CardsType | null,
): CardsType[] {
  if (!crops) return discardPile;

  return discardPile.map((card) =>
    card.id === crops.id
      ? { ...card, quantity: card.quantity + crops.quantity }
      : card,
  );
}
