import type {
  CardsType,
  FieldType,
  GameType,
  PlayerType,
  TradeOfferType,
} from "@/types/gameTypes";
import type { PlantSelection } from "./types";

export const freshOffer = (): TradeOfferType => ({
  marketCards: [],
  give: { handCards: [], hats: [] },
  receive: { expectedCards: [], expectedHats: false },
});
export const turnKey = (game: GameType) =>
  `${game.round}:${game.currentPlayer.id}:${game.currentPlayer.turnStatus}`;
export const canPlantHand = (game: GameType, player: PlayerType) =>
  player.id === game.currentPlayer.id &&
  game.currentPlayer.turnStatus === "planting" &&
  (game.currentPlayer.plantCounts < 2 ||
    (game.currentPlayer.plantCounts < 3 && player.tractor));
export const compatibleField = (field: FieldType, cardId: number) =>
  field.crops === null || field.crops.id === cardId;
export function selectedCard(
  game: GameType,
  player: PlayerType,
  selection: PlantSelection | null,
): CardsType | undefined {
  if (!selection) return;
  if (selection.source === "hand")
    return canPlantHand(game, player)
      ? player.hand.find((c) => c.id === selection.cardId && c.quantity > 0)
      : undefined;
  if (selection.source === "trade")
    return player.acceptedTrade?.find(
      (c) => c.id === selection.cardId && c.quantity > 0,
    );
  const card = game.currentPlayer.marketingCards[selection.index ?? -1];
  return player.id === game.currentPlayer.id && card?.id === selection.cardId
    ? card
    : undefined;
}

/** Validate a draft against the snapshot. Never silently trim the offer. */
export function draftIssue(
  offer: TradeOfferType,
  hand: CardsType[],
  market: CardsType[],
  originalMarket: string,
): string | null {
  if (offer.marketCards.length && JSON.stringify(market) !== originalMarket)
    return "The market changed. Clear your draft and select the market cards again.";
  if (
    offer.give.handCards.some(
      (c) => (hand.find((h) => h.id === c.id)?.quantity ?? 0) < c.quantity,
    )
  )
    return "Your hand changed. Adjust the cards you give before sending this offer.";
  return null;
}
export function setQuantity(
  cards: CardsType[],
  id: number,
  quantity: number,
): CardsType[] {
  if (quantity <= 0) return cards.filter((c) => c.id !== id);
  return cards.some((c) => c.id === id)
    ? cards.map((c) => (c.id === id ? { ...c, quantity } : c))
    : [...cards, { id, quantity }];
}
