import type { BuyType, GameType, TradeOfferType } from "@/types/gameTypes";

export type ConnectionStatus =
  "loading" | "syncing" | "ready" | "offline" | "missing" | "denied" | "error";
export type BoardSnapshot = { game: GameType | null; status: ConnectionStatus };
export type PlantSelection = {
  source: "hand" | "market" | "trade";
  cardId: number;
  index?: number;
};
export type BoardActions = {
  plant: (selection: PlantSelection, fieldIndex: number) => Promise<void>;
  harvest: (fieldIndex: number) => Promise<void>;
  buy: (type: BuyType, fieldIndex?: number) => Promise<void>;
  advance: () => Promise<void>;
  propose: (offer: TradeOfferType, counteroffer: boolean) => Promise<void>;
  respond: (accepted: boolean) => Promise<void>;
  accept: (dealerId: number, counteroffer: boolean) => Promise<void>;
};
