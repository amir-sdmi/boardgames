import {
  CardInformationType,
  CurrentPlayerType,
  GameType,
} from "@/types/gameTypes";
import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../utils/gameStateUtils";
import { findPlayer } from "../../utils/utils";
import { fromDeckToHand } from "../../utils/cardsUtils";
import { emptyTempTradeOffer } from "../initializeGame";
import { nextRound } from "../gameMaster";

export async function addCardsToHandAction(roomId: string, playerId: number) {
  let gameState = await fetchGameState(roomId);
  if (gameState.deck.length < gameState.endTurnReceivingCardsCount) {
    await nextRound(roomId);
    gameState = await fetchGameState(roomId);
  }
  const { players, deck, endTurnReceivingCardsCount, currentPlayer } =
    gameState;
  const player = findPlayer(players, playerId);
  const newDeck = [...deck];
  let newHand = [...player.hand];

  // Draw cards from deck
  for (let i = 0; i < endTurnReceivingCardsCount; i++) {
    const cardId = newDeck.pop() as CardInformationType["id"];
    if (!cardId) {
      throw new Error("Insufficient cards in the deck to draw.");
    }
    newHand = fromDeckToHand(cardId, newHand);
  }
  //next player turn
  const nextPlayerId =
    currentPlayer.id < players.length - 1 ? currentPlayer.id + 1 : 0;
  const newCurrentPlayer: CurrentPlayerType = {
    id: nextPlayerId,
    turnStatus: "planting",
    plantCounts: 0,
    marketingCards: [],
    tradeOffer: emptyTempTradeOffer(nextPlayerId),
  };
  const updatedPlayers = players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          hand: newHand,
        }
      : p,
  );

  const updatedGameState: GameType = {
    ...gameState,
    deck: newDeck,
    players: updatedPlayers,
    currentPlayer: newCurrentPlayer,
  };
  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
}
