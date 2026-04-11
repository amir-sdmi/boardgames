import { CardInformationType, CurrentPlayerType } from "@/types/gameTypes";
import { runGameStateTransaction } from "../../utils/gameStateUtils";
import { findPlayer } from "../../utils/utils";
import { fromDeckToHand } from "../../utils/cardsUtils";
import { applyNextRound } from "../gameMaster";

export async function addCardsToHandAction(roomId: string, playerId: number) {
  await runGameStateTransaction(roomId, (gameState) => {
    let state = gameState;
    if (state.deck.length < state.endTurnReceivingCardsCount) {
      state = applyNextRound(state);
    }
    const { players, deck, endTurnReceivingCardsCount, currentPlayer } = state;
    const player = findPlayer(players, playerId);
    const newDeck = [...deck];
    let newHand = [...player.hand];

    for (let i = 0; i < endTurnReceivingCardsCount; i++) {
      const cardId = newDeck.pop() as CardInformationType["id"];
      if (cardId === undefined) {
        throw new Error("couldn't draw card from deck");
      }
      newHand = fromDeckToHand(cardId, newHand);
    }
    const nextPlayerId =
      currentPlayer.id < players.length - 1 ? currentPlayer.id + 1 : 0;
    const newCurrentPlayer: CurrentPlayerType = {
      id: nextPlayerId,
      turnStatus: "planting",
      plantCounts: 0,
      marketingCards: [],
      tradeProposal: null,
    };
    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            hand: newHand,
          }
        : p,
    );

    return {
      ...state,
      deck: newDeck,
      players: updatedPlayers,
      currentPlayer: newCurrentPlayer,
    };
  });
}
