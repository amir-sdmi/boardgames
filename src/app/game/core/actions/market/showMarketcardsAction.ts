import {
  CardInformationType,
  CardsType,
  CurrentPlayerType,
  GameType,
} from "@/types/gameTypes";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../../utils/gameStateUtils";
import { nextRound } from "../../gameMaster";
import { CARDS_TO_SHOW_IN_MARKET } from "@/config/constants";

export async function showMarketcardsAction(roomId: string) {
  let gameState = await fetchGameState(roomId);
  if (gameState.deck.length < gameState.endTurnReceivingCardsCount) {
    await nextRound(roomId);
    gameState = await fetchGameState(roomId);
  }
  const { deck, currentPlayer } = gameState;
  const newDeck = [...deck];
  const newMarketingCards: CardsType[] = [];
  for (let i = 0; i < CARDS_TO_SHOW_IN_MARKET; i++) {
    const cardId = newDeck.pop() as CardInformationType["id"];
    if (!cardId) {
      throw new Error("Card not found in deck");
    }
    const newCard: CardsType = {
      id: cardId,
      quantity: 1,
    };
    newMarketingCards.push(newCard);
  }
  const newCurrentPlayer: CurrentPlayerType = {
    ...currentPlayer,
    marketingCards: newMarketingCards,
    turnStatus: "marketing",
  };
  const updatedGameState: GameType = {
    ...gameState,
    currentPlayer: newCurrentPlayer,
    deck: newDeck,
  };
  try {
    await updateFirestoreDocument("rooms", roomId, {
      gameState: updatedGameState,
    });
  } catch (error) {
    console.error("Error updating firestore document", error);
    throw new Error("Error updating firestore document");
  }
}
