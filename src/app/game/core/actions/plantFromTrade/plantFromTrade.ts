import { CardsType, FieldType } from "@/types/gameTypes";

export const plantFromTrade = (
  acceptedTrade: CardsType[],
  field: FieldType,
  card: CardsType,
) => {
  if (field.crops !== null && field.crops.id !== card.id) {
    throw new Error("Field already has a different crop");
  }
  const stack = acceptedTrade.find((c) => c.id === card.id);
  if (!stack || stack.quantity < 1) {
    throw new Error("Card not available in accepted trade");
  }
  const newQty = stack.quantity - 1;
  const newAcceptedTrade =
    newQty <= 0
      ? acceptedTrade.filter((c) => c.id !== card.id)
      : acceptedTrade.map((c) =>
          c.id === card.id ? { ...c, quantity: newQty } : c,
        );
  const newField = {
    ...field,
    crops: { id: card.id, quantity: (field.crops?.quantity || 0) + 1 },
  };
  return {
    newAcceptedTrade,
    newField,
  };
};
