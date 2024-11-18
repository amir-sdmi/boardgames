import { BuyType, GameType, PlayerType } from "@/types/gameTypes";
import { fromDeckToHand } from "../../utils/cardsUtils";

import {
  fetchGameState,
  updateFirestoreDocument,
} from "../../utils/gameStateUtils";
import { findPlayer } from "../../utils/utils";

const MAX_FIELDS = 3;
const CARDS_TO_DRAW = 3;

const buying = (
  player: PlayerType,
  deck: number[],
  availableManures: number,
  availableTractors: number,
  type: BuyType,
  price: number,
  fieldId?: number,
) => {
  const updatedPlayer = { ...player };
  const updatedDeck = [...deck];
  let updatedManures = availableManures;
  let updatedTractors = availableTractors;

  switch (type) {
    case "field":
      if (
        updatedPlayer.money >= price &&
        updatedPlayer.fields.length < MAX_FIELDS
      ) {
        updatedPlayer.money -= price;
        updatedPlayer.fields.push({
          //This is one time purchase, so no problem for id
          id: 2,
          crops: null,
          manure: false,
        });
      }
      break;

    case "manure":
      if (typeof fieldId === "number" && updatedPlayer.fields[fieldId]) {
        if (updatedPlayer.money >= price) {
          updatedPlayer.money -= price;
          updatedPlayer.fields[fieldId].manure = true;
          updatedManures -= 1;
        }
      } else {
        console.error("Invalid fieldId or field does not exist");
      }
      break;

    case "tractor":
      if (updatedPlayer.money >= price && !updatedPlayer.tractor) {
        updatedPlayer.money -= price;
        updatedPlayer.tractor = true;
        updatedTractors -= 1;
      }
      break;

    case "cards":
      if (updatedPlayer.money >= price && !updatedPlayer.hasBoughtCards) {
        updatedPlayer.money -= price;
        updatedPlayer.hasBoughtCards = true;
        let newHand = [...updatedPlayer.hand];
        //Todo: this is problem, maybe we dont have enough cards in deck, it fixed now, but needs better solution
        if (updatedDeck.length < CARDS_TO_DRAW) {
          throw new Error(
            `Not enough cards in deck. Required: ${CARDS_TO_DRAW}, Available: ${updatedDeck.length}`,
          );
        }
        for (let i = 0; i < CARDS_TO_DRAW; i++) {
          const newCardId = updatedDeck.pop();
          if (newCardId !== undefined) {
            newHand = fromDeckToHand(newCardId, newHand);
          }
        }
        updatedPlayer.hand = newHand;
      }
      break;

    default:
      console.error("Unknown purchase type");
  }

  return { updatedPlayer, updatedDeck, updatedManures, updatedTractors };
};

export async function buyAction(
  roomId: string,
  playerId: number,
  type: BuyType,
  price: number,
  fieldId?: number,
) {
  const gameState = await fetchGameState(roomId);
  const { players, deck, availableManures, availableTractors } = gameState;

  const player = findPlayer(players, playerId);

  const { updatedPlayer, updatedDeck, updatedManures, updatedTractors } =
    buying(
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

  const updatedGameState: GameType = {
    ...gameState,
    players: updatedPlayers,
    deck: updatedDeck,
    availableManures: updatedManures,
    availableTractors: updatedTractors,
  };

  await updateFirestoreDocument("rooms", roomId, {
    gameState: updatedGameState,
  });
}
