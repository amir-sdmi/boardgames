import type { BuyType, PlayerType } from "./gameTypes";

/** Callback shared by purchase controls; game prices remain in config/constants. */
export type BuyHandler = (
  player: PlayerType,
  type: BuyType,
  price: number,
  fieldId?: number,
) => void;
