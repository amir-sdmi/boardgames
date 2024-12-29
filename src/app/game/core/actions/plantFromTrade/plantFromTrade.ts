import { CardsType, FieldType } from "@/types/gameTypes";

export const plantFromTrade = (
  acceptedTrade: CardsType[],
  field: FieldType,
  card: CardsType,
) => {
  if (field.crops === null || field.crops.id === card.id) {
    const newAcceptedTrade = acceptedTrade.filter(
      (c) => c.id !== card.id || --c.quantity > 0,
    );
    const newField = {
      ...field,
      crops: { id: card.id, quantity: (field.crops?.quantity || 0) + 1 },
    };

    return {
      newAcceptedTrade,
      newField,
    };
  } else {
    throw new Error("Field already has a different crop");
  }
};
