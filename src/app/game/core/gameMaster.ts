import { CardsType, GameType } from "@/types/gameTypes";
import { cardData } from "../utils/cardData";
import { shuffleArray } from "../utils/utils";
import { runGameStateTransaction } from "../utils/gameStateUtils";
import { MAX_ROUND } from "@/config/constants";

export function applyNextRound(gameState: GameType): GameType {
  const { deck, discardPile, round } = gameState;
  const newDeck = [...deck];
  discardPile.forEach((card) => {
    const cardInfo = cardData.find((c) => c.id === card.id);
    if (!cardInfo) {
      throw new Error(`Invalid card ID: ${card.id}`);
    }

    for (let i = 0; i < card.quantity; i++) {
      newDeck.push(cardInfo.id);
    }
  });
  const shuffledDeck = shuffleArray(newDeck);

  const emptyDiscardPile: CardsType[] = cardData.map((card) => {
    return {
      id: card.id,
      quantity: 0,
    };
  });

  const nextRoundNum = round + 1;
  let updatedGameStatus = gameState.gameStatus;
  if (nextRoundNum > MAX_ROUND) {
    updatedGameStatus = "finished";
  }
  return {
    ...gameState,
    deck: shuffledDeck,
    discardPile: emptyDiscardPile,
    round: nextRoundNum,
    gameStatus: updatedGameStatus,
  };
}

export const nextRound = async (roomId: string) => {
  await runGameStateTransaction(roomId, (gameState) => applyNextRound(gameState));
};
