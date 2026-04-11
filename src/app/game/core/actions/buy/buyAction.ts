import { BuyType } from "@/types/gameTypes";

import { runGameStateTransaction } from "../../../utils/gameStateUtils";
import { findPlayer } from "../../../utils/utils";
import { buy } from "./buy";

export async function buyAction(
  roomId: string,
  playerId: number,
  type: BuyType,
  price: number,
  fieldId?: number,
) {
  await runGameStateTransaction(roomId, (gameState) => {
    const { players, deck, availableManures, availableTractors } = gameState;

    const player = findPlayer(players, playerId);

    const { updatedPlayer, updatedDeck, updatedManures, updatedTractors } = buy(
      player,
      deck,
      availableManures,
      availableTractors,
      type,
      price,
      fieldId,
    );

    const updatedPlayers = players.map((p) =>
      p.id === playerId ? updatedPlayer : p,
    );

    return {
      ...gameState,
      players: updatedPlayers,
      deck: updatedDeck,
      availableManures: updatedManures,
      availableTractors: updatedTractors,
    };
  });
}
