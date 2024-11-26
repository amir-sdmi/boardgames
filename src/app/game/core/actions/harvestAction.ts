import { CardsType, FieldType, GameType } from "@/types/gameTypes";
import { cardData } from "../../utils/cardData";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../utils/gameStateUtils";
import { findPlayer } from "../../utils/utils";
//find the price of the card
function findThePrice(sellingCrops: CardsType): number {
  const cardDetails = cardData.find((card) => card.id === sellingCrops.id);
  let closestIndex: null | number = null;
  let closestValue = 0;
  if (cardDetails) {
    cardDetails.value.forEach((value, index) => {
      if (
        value !== null &&
        value <= sellingCrops.quantity &&
        value > closestValue
      ) {
        closestValue = value;
        closestIndex = index;
      }
    });
    const harvestMoney = closestIndex !== null ? closestIndex + 1 : 0;
    return harvestMoney;
  } else {
    return 0;
  }
}
export const harvest = (
  field: FieldType,
  discardPile: CardsType[],
): { field: FieldType; harvestMoney: number; discardPile: CardsType[] } => {
  const newField = { ...field };

  if (newField.crops === null) {
    console.log("no crops to harvest");
    return { field, harvestMoney: 0, discardPile };
  } else {
    const harvestMoney = findThePrice(newField.crops) ?? 0;
    //add cards to discard pile
    const discardCard = discardPile.find(
      (card) => card.id === newField.crops?.id,
    );
    if (discardCard && newField.crops) {
      discardCard.quantity += newField.crops.quantity;
    }

    const updatedDiscardPile = discardPile.map((card) => {
      if (discardCard && card.id === discardCard.id) {
        return discardCard;
      }
      return card;
    });

    newField.crops = null;
    return {
      field: newField,
      harvestMoney,
      discardPile: updatedDiscardPile,
    };
  }
};

export const harvestAction = async (
  roomId: string,
  playerId: number,
  fieldIndex: number,
) => {
  const gameState = await fetchGameState(roomId);
  const { players } = gameState;

  const player = findPlayer(players, playerId);

  const {
    field: newField,
    harvestMoney,
    discardPile: newDiscardPile,
  } = harvest(player.fields[fieldIndex], gameState.discardPile);

  const updatedPlayers = players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          fields: p.fields.map((f, i) => (i === fieldIndex ? newField : f)),
          money: p.money + harvestMoney,
        }
      : p,
  );

  const updatedGameState: GameType = {
    ...gameState,
    players: updatedPlayers,
    discardPile: newDiscardPile,
  };
  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
};
