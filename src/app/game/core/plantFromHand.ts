import { CardsType, CurrentPlayer, FieldType } from "@/types/gameTypes";

export const plantFromHand = (
  hand: CardsType[],
  field: FieldType,
  card: CardsType,
  currentPlayer: CurrentPlayer,
): { hand: CardsType[]; field: FieldType; currentPlayer: CurrentPlayer } => {
  const newHand = [...hand];
  const newField = { ...field };
  const newCurrentPlayer = { ...currentPlayer };

  //check if same card has been planted before, or field is empty, plant the card
  if (newField.crops.quantity === 0 || newField.crops.id === card.id) {
    newField.crops.quantity++;
    newField.crops.id = card.id;
    newCurrentPlayer.plantCounts++;
  } else {
    console.log(
      "you can not plant this card here, some other crops has been planted here before",
    );
    return { hand, field, currentPlayer };
  }

  //remove card from hand
  const updatedHand = newHand
    .map((newHandCard) => {
      if (newHandCard.id === card.id) {
        newHandCard.quantity--;
      }
      return newHandCard;
    })
    .filter((newHandCard) => newHandCard.quantity > 0);

  return {
    hand: updatedHand,
    field: newField,
    currentPlayer: newCurrentPlayer,
  };
};
