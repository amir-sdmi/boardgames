import { GameType } from "@/types/gameTypes";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../../utils/gameStateUtils";
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

  const gameState = await fetchGameState(roomId);
  if (!gameState) {
    throw new Error("Game state not found");
  }
  const { players } = gameState;
  const player = findPlayer(players, playerId);
  if (!player) {
    throw new Error("Player not found");
  }

  const {
    field: newField,
    harvestMoney,
    discardPile: newDiscardPile,
  } = harvest(player.fields[fieldIndex], gameState.discardPile);

  //Todo: prevent race condition ! like here :
  //     // Use transaction to prevent race conditions
  //  await updateGameStateTransaction(roomId, (currentState) => {
  //       // Verify state hasn't changed
  //       if (currentState.version !== gameState.version) {
  //        throw new Error('Game state has changed');
  //       }

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
