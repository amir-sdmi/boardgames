import { cardData } from "@/app/game/utils/cardData";
import { MIN_HARVEST_QUANTITY } from "@/config/constants";
import { CardsType } from "@/types/gameTypes";

export function findThePrice(
  sellingCrops: CardsType,
  hasManure: boolean,
): number {
  // on the field should be at least 2 crops to harvest
  if (sellingCrops.quantity < MIN_HARVEST_QUANTITY) return 0;

  const cardDetails = cardData.find((card) => card.id === sellingCrops.id);

  //manure works as an additional crop
  const quantity = hasManure
    ? sellingCrops.quantity + 1
    : sellingCrops.quantity;
  let closestIndex: null | number = null;
  let closestValue = 0;
  if (cardDetails) {
    cardDetails.value.forEach((value, index) => {
      if (value !== null && value <= quantity && value > closestValue) {
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
