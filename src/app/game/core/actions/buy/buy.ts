import { fromDeckToHand } from "@/app/game/utils/cardsUtils";
import { BuyType, PlayerType } from "@/types/gameTypes";

const MAX_FIELDS = 3;
const CARDS_TO_DRAW = 3;
export const buy = (
  player: PlayerType,
  deck: number[],
  availableManures: number,
  availableTractors: number,
  type: BuyType,
  price: number,
  fieldId?: number,
) => {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];
  let updatedManures = availableManures;
  let updatedTractors = availableTractors;

  switch (type) {
    case "field":
      if (
        updatedPlayer.money >= price &&
        updatedPlayer.fields.length < MAX_FIELDS
      ) {
        updatedPlayer.money -= price;
        updatedPlayer.fields.push({
          //This is one time purchase, so no problem for id
          id: 2,
          crops: null,
          manure: false,
        });
      }
      break;

    case "manure":
      if (typeof fieldId === "number" && updatedPlayer.fields[fieldId]) {
        if (updatedPlayer.money >= price) {
          updatedPlayer.money -= price;
          updatedPlayer.fields[fieldId].manure = true;
          updatedManures -= 1;
        }
      } else {
        console.error("Invalid fieldId or field does not exist");
      }
      break;

    case "tractor":
      if (updatedPlayer.money >= price && !updatedPlayer.tractor) {
        updatedPlayer.money -= price;
        updatedPlayer.tractor = true;
        updatedTractors -= 1;
      }
      break;

    case "cards":
      if (updatedPlayer.money >= price && !updatedPlayer.hasBoughtCards) {
        updatedPlayer.money -= price;
        updatedPlayer.hasBoughtCards = true;
        let newHand = [...updatedPlayer.hand];
        //Todo: this is problem, maybe we dont have enough cards in deck, it fixed now, but needs better solution
        if (updatedDeck.length < CARDS_TO_DRAW) {
          throw new Error(
            `Not enough cards in deck. Required: ${CARDS_TO_DRAW}, Available: ${updatedDeck.length}`,
          );
        }
        for (let i = 0; i < CARDS_TO_DRAW; i++) {
          const newCardId = updatedDeck.pop();
          if (newCardId !== undefined) {
            newHand = fromDeckToHand(newCardId, newHand);
          }
        }
        updatedPlayer.hand = newHand;
      }
      break;

    default:
      console.error("Unknown purchase type");
  }

  return { updatedPlayer, updatedDeck, updatedManures, updatedTractors };
};
