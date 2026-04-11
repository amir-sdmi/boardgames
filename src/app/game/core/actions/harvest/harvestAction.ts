import { runGameStateTransaction } from "../../../utils/gameStateUtils";
import { findPlayer } from "../../../utils/utils";
import { harvest } from "./harvest";

export const harvestAction = async (
  roomId: string,
  playerId: number,
  fieldIndex: number,
) => {
  if (
    !roomId ||
    typeof playerId !== "number" ||
    typeof fieldIndex !== "number"
  ) {
    throw new Error("Invalid input parameters");
  }

  await runGameStateTransaction(roomId, (gameState) => {
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

    return {
      ...gameState,
      players: updatedPlayers,
      discardPile: newDiscardPile,
    };
  });
};
