import {
  CardInformationType,
  CardsType,
  CurrentPlayerType,
} from "@/types/gameTypes";
import { runGameStateTransaction } from "../../../utils/gameStateUtils";
import { applyNextRound } from "../../gameMaster";
import { CARDS_TO_SHOW_IN_MARKET } from "@/config/constants";

export async function showMarketcardsAction(roomId: string) {
  await runGameStateTransaction(roomId, (gameState) => {
    let state = gameState;
    if (state.deck.length < state.endTurnReceivingCardsCount) {
      state = applyNextRound(state);
    }
    const { deck, currentPlayer } = state;
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
    return {
      ...state,
      currentPlayer: newCurrentPlayer,
      deck: newDeck,
    };
  });
}
