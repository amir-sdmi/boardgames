import { PRICES } from "@/config/constants";
import type { GameType } from "@/types/gameTypes";
import type { BoardActions } from "./types";
import { buyAction } from "../core/actions/buy/buyAction";
import { harvestAction } from "../core/actions/harvest/harvestAction";
import { plantFromHandAction } from "../core/actions/plantFromHand/plantFromHandAction";
import { plantFromMarketAction } from "../core/actions/plantFromMarket/plantFromMarketAction";
import { plantFromTradeAction } from "../core/actions/plantFromTrade/plantFromTradeAction";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";
import {
  acceptOrRejectTradeAction,
  dealerTradeOfferAction,
  tradeOfferAction,
} from "../core/actions/market/tradeOfferAction";
import {
  acceptBetweenAcceptedPlayers,
  acceptTradeDealFromDealerTile,
} from "../core/actions/market/acceptTradeDealAction";

export function liveActions(
  roomId: string,
  playerId: number,
  game: GameType,
): BoardActions {
  return {
    plant: (selection, field) =>
      selection.source === "hand"
        ? plantFromHandAction(roomId, playerId, field, selection.cardId)
        : selection.source === "trade"
          ? plantFromTradeAction(roomId, playerId, field, selection.cardId)
          : plantFromMarketAction(
              roomId,
              playerId,
              field,
              selection.cardId,
              selection.index!,
            ),
    harvest: (field) => harvestAction(roomId, playerId, field),
    buy: (type, field) =>
      buyAction(roomId, playerId, type, PRICES[type], field),
    advance: () =>
      game.currentPlayer.turnStatus === "planting"
        ? showMarketcardsAction(roomId)
        : addCardsToHandAction(roomId, playerId),
    propose: (offer, counter) =>
      counter
        ? dealerTradeOfferAction(roomId, offer, playerId)
        : tradeOfferAction(roomId, offer),
    respond: (accepted) =>
      acceptOrRejectTradeAction(roomId, playerId, accepted),
    accept: (dealerId, counter) =>
      counter
        ? acceptTradeDealFromDealerTile(roomId, dealerId)
        : acceptBetweenAcceptedPlayers(roomId, dealerId),
  };
}
