"use client";

import Button from "@/app/components/ui/Button";
import { CardsType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../utils/cardsUtils";
import { plantFromHandAction } from "@/app/game/core/actions/plantFromHandAction";

export default function PlayerDetails({
  player,
  roomId,
}: {
  player: PlayerType;
  roomId: string;
}) {
  const handlePlantFromHand = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromHandAction(roomId, player.id, fieldIndex, card.id);
    } catch (error) {
      console.error("Error planting from hand:", error);
    }
  };

  return (
    <>
      <h1>Player Details</h1>
      <p>id: {player.id}</p>
      <p>name: {player.playerName}</p>
      <p>tractor: {player.tractor ? "yes" : "no"}</p>
      <p>money: {player.money}</p>
      <ol className="border border-blue-500">
        {player.hand.map((card, handIndex) => (
          <li key={handIndex}>
            {cardName(card.id)} {card.quantity}
            <div>
              <Button onClick={() => handlePlantFromHand(0, card)}>F1</Button>
              <Button onClick={() => handlePlantFromHand(1, card)}>F2</Button>
              {player.fields.length > 2 && (
                <Button onClick={() => handlePlantFromHand(2, card)}>F3</Button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
