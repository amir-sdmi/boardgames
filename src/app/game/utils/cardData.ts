import { CardInformationType } from "@/types/gameTypes";
import { cropsIcons } from "./images";

export const cardData: CardInformationType[] = [
  {
    id: 0,
    name: "pepperoni",
    totalQuantity: 6,
    value: [2, null, 4, null],
    icon: cropsIcons.pepperoni,
  },
  {
    id: 1,
    name: "peas",
    totalQuantity: 7,
    value: [2, 3, 5, null],
    icon: cropsIcons.peas,
  },
  {
    id: 2,
    name: "eggplant",
    totalQuantity: 8,
    value: [2, 4, 5, null],
    icon: cropsIcons.eggplant,
  },
  {
    id: 3,
    name: "tomato",
    totalQuantity: 9,
    value: [2, 4, 6, null],
    icon: cropsIcons.tomato,
  },
  {
    id: 4,
    name: "watermelon",
    totalQuantity: 10,
    value: [3, 4, 5, 7],
    icon: cropsIcons.watermelon,
  },
  {
    //TODO: add icons ! thisis wrong for now
    id: 5,
    name: "kharboze",
    totalQuantity: 11,
    value: [3, 5, 6, 7],
    icon: cropsIcons.watermelon,
  },
  {
    id: 6,
    name: "pumpkin",
    totalQuantity: 12,
    value: [3, 5, 6, 8],
    icon: cropsIcons.pumpkin,
  },
  {
    id: 7,
    name: "turnip",
    totalQuantity: 13,
    value: [3, 5, 7, 8],
    icon: cropsIcons.turnip,
  },
  {
    id: 8,
    name: "carrot",
    totalQuantity: 14,
    value: [4, 5, 7, 8],
    icon: cropsIcons.carrot,
  },
  {
    id: 9,
    name: "bean",
    totalQuantity: 15,
    value: [4, 6, 7, 8],
    icon: cropsIcons.bean,
  },
  {
    id: 10,
    name: "onion",
    totalQuantity: 16,
    value: [4, 6, 7, 9],
    icon: cropsIcons.onion,
  },
  {
    id: 11,
    name: "potato",
    totalQuantity: 17,
    value: [4, 6, 8, 9],
    icon: cropsIcons.potato,
  },
  {
    id: 12,
    name: "cucumber",
    totalQuantity: 18,
    value: [4, 6, 8, 10],
    icon: cropsIcons.cucumber,
  },
];
