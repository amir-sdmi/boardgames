import { CardsType, GameType } from "@/types/gameTypes";
import { cardData } from "../utils/cardData";
import { shuffleArray } from "../utils/utils";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../utils/gameStateUtils";
import { MAX_ROUND } from "@/config/constants";

export const nextRound = async (roomId: string) => {
  const gameState = await fetchGameState(roomId);
  if (!gameState) {
    throw new Error("Game state not found");
  }
  const { deck, discardPile, round } = gameState;
  //creating new CardsInformation Deck from discardPile and deck
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
      name: card.name,
      quantity: 0,
    };
  });

  const newRound = round + 1;
  let updatedGameStatus = gameState.gameStatus;
  if (newRound > MAX_ROUND) {
    updatedGameStatus = "finished";
  }
  const updatedGameState: GameType = {
    ...gameState,
    deck: shuffledDeck,
    discardPile: emptyDiscardPile,
    round: newRound,
    gameStatus: updatedGameStatus,
  };

  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
};
