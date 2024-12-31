"use client";

import Button from "@/app/components/ui/Button";
import { CardsType, CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../utils/cardsUtils";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";
import { plantFromTradeAction } from "../core/actions/plantFromTrade/plantFromTradeAction";
import Hand from "./Hand/Hand";

export default function PlayerDetails({
  player,
  roomId,
  currentPlayer,
}: {
  player: PlayerType;
  roomId: string;
  currentPlayer: CurrentPlayerType;
}) {
  const handlePlantFromTrade = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromTradeAction(roomId, player.id, fieldIndex, card.id);
    } catch (error) {
      console.error("Error planting from trade:", error);
    }
  };

  const handleShowMarket = async () => {
    try {
      await showMarketcardsAction(roomId);
    } catch (error) {
      console.error("Error showing market:", error);
    }
  };

  const handleAddCardsToHand = async (playerId: number) => {
    try {
      await addCardsToHandAction(roomId, playerId);
    } catch (error) {
      console.error("Error adding cards:", error);
    }
  };
  return (
    <>
      {player.id === currentPlayer.id && (
        <div className="border border-green-400">
          <Button
            onClick={handleShowMarket}
            disabled={currentPlayer.turnStatus !== "planting"}
          >
            Start Marketting
          </Button>
          <Button
            onClick={() => handleAddCardsToHand(player.id)}
            // disabled={
            //   //TODO : this is not totally correct, later should change it
            //   (currentPlayer.marketingCards.length !== 0 &&
            //     currentPlayer.turnStatus === "marketing") ||
            //   currentPlayer.turnStatus === "planting"
            // }
          >
            Add Cards To Hand
          </Button>
        </div>
      )}

      <Hand player={player} roomId={roomId} currentPlayer={currentPlayer} />
      <ul className="border border-yellow-500">
        {player.acceptedTrade?.map((card) => (
          <li key={card.id}>
            {cardName(card.id)} x {card.quantity}
            <div>
              <Button onClick={() => handlePlantFromTrade(0, card)}>F1</Button>
              <Button onClick={() => handlePlantFromTrade(1, card)}>F2</Button>
              {player.fields.length > 2 && (
                <Button onClick={() => handlePlantFromTrade(2, card)}>
                  F3
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
