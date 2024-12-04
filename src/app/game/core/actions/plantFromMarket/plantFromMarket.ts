import {
  CardsType,
  CurrentPlayerType,
  FieldType,
  PlayerType,
} from "@/types/gameTypes";
export const plantFromMarket = (
  currentPlayer: CurrentPlayerType,
  fieldIndex: FieldType["id"],
  player: PlayerType,
  card: CardsType,
  markettingCardId: number,
) => {
  const newCurrentPlayer = { ...currentPlayer };
  const newField = {
    ...player.fields[fieldIndex],
  };

  //plant card
  if (newField.crops === null || newField.crops.id === card.id) {
    const plantedField = {
      ...newField,
      crops: { id: card.id, quantity: (newField.crops?.quantity || 0) + 1 },
    };

    //remove card from marketing cards
    newCurrentPlayer.marketingCards.splice(markettingCardId, 1);

    return {
      currentPlayer: newCurrentPlayer,
      player: {
        ...player,
        fields: player.fields.map((f) =>
          f.id === fieldIndex ? plantedField : f,
        ),
      },
    };
  } else {
    throw new Error("Field already has a different crop");
  }
};
