import { CardsType, GameType } from "@/types/gameTypes";
import { cardData } from "../utils/cardData";
import { shuffleArray } from "../utils/utils";

export const nextRound = (game: GameType): GameType => {
  const { deck, discardPile, round } = game;
  console.log("deck is under 2 or 3 cards");
  if (game.round < 4) {
    //creating new CardsInformation Deck from discardPile and deck
    const newDeck = [...deck];
    discardPile.map((card) => {
      const cardInfo = cardData.find((c) => c.id === card.id);
      if (cardInfo) {
        for (let i = 0; i < card.quantity; i++) {
          newDeck.push(cardInfo.id);
        }
      }
    });

    const emptyDiscardPile: CardsType[] = cardData.map((card) => {
      return {
        id: card.id,
        name: card.name,
        quantity: 0,
      };
    });

    const newRound = round === 1 ? 2 : round === 2 ? 3 : 4;
    return {
      ...game,
      deck: shuffleArray(newDeck),
      discardPile: emptyDiscardPile,
      round: newRound,
    };
  } else {
    return { ...game, round: 4, gameStatus: "finished" };
  }
};
