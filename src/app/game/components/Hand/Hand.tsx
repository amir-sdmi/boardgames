import { CardsType, CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import { plantFromHandAction } from "../../core/actions/plantFromHand/plantFromHandAction";
import { useState } from "react";
import CardToPlant from "./CardToPlant";

export default function Hand({
  player,
  roomId,
  currentPlayer,
}: {
  player: PlayerType;
  roomId: string;
  currentPlayer: CurrentPlayerType;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  const canPlant =
    player.id === currentPlayer.id &&
    currentPlayer.turnStatus === "planting" &&
    (currentPlayer.plantCounts < 2 ||
      (currentPlayer.plantCounts < 3 && player.tractor));

  const handlePlantFromHand = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromHandAction(roomId, player.id, fieldIndex, card.id);
      if (player.fields[fieldIndex].crops?.quantity === 0) {
        setOpenId(null);
      }
    } catch (error) {
      console.error("Error planting from hand:", error);
    }
  };
  return (
    <div className="border-secondary col-span-5 flex h-[533px] w-[466px] flex-col gap-2 rounded-2xl border-2 px-6 pb-6 pt-5">
      <h2 className="text-secondary text-lg font-bold">Your Hand</h2>
      <ul className="flex h-full flex-col flex-wrap gap-2">
        {player.hand.map((card, handIndex) => (
          <li key={handIndex}>
            <CardToPlant
              fields={player.fields}
              canPlant={canPlant}
              card={card}
              openId={openId}
              setOpenId={setOpenId}
              hasThirdField={player.thirdField}
              handlePlantFromHand={handlePlantFromHand}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
