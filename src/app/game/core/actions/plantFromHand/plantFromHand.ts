import { CardsType, CurrentPlayerType, FieldType } from "@/types/gameTypes";

export const plantFromHand = (
  hand: CardsType[],
  field: FieldType,
  card: CardsType,
  currentPlayer: CurrentPlayerType,
) => {
  if (field.crops === null || field.crops.id === card.id) {
    const newHand = hand.filter((c) => c.id !== card.id || --c.quantity > 0);
    const newField = {
      ...field,
      crops: { id: card.id, quantity: (field.crops?.quantity || 0) + 1 },
    };

    return {
      newHand,
      newField,
      newCurrentPlayer: {
        ...currentPlayer,
        plantCounts: currentPlayer.plantCounts + 1,
      },
    };
  } else {
    throw new Error("Field already has a different crop");
  }
};
