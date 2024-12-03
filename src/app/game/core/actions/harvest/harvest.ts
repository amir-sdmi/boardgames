import { CardsType, FieldType } from "@/types/gameTypes";
import { findThePrice } from "./findThePrice";
import { updateDiscardPile } from "./updateDiscardPile";

export const harvest = (
  field: FieldType,
  discardPile: CardsType[],
): { field: FieldType; harvestMoney: number; discardPile: CardsType[] } => {
  const newField = JSON.parse(JSON.stringify(field));

  if (newField.crops === null) {
    console.log("no crops to harvest");
    return { field, harvestMoney: 0, discardPile };
  } else {
    const harvestMoney = findThePrice(newField.crops, newField.manure) ?? 0;
    //add cards to discard pile
    const discardCard = discardPile.find(
      (card) => card.id === newField.crops?.id,
    );
    if (discardCard && newField.crops) {
      discardCard.quantity += newField.crops.quantity;
    }
    const updatedDiscardPile = updateDiscardPile(discardPile, newField.crops);

    newField.crops = null;
    return {
      field: newField,
      harvestMoney,
      discardPile: updatedDiscardPile,
    };
  }
};
