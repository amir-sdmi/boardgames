import Button from "@/app/components/ui/Button";
import manurePNG from "@/app/assets/tokens/manure.png";
import { useGameContext } from "@/contexts/GameContext";
import Image from "next/image";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { PRICES } from "@/config/constants";
import NumberBadge from "@/app/components/ui/NumberBadge";

export default function BuyManure({
  thisPlayer,
  handleBuy,
}: {
  thisPlayer: PlayerType;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
}) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { availableManures } = gameState;
  const { thirdField, fields } = thisPlayer;

  return (
    <div className="relative flex w-[177px] flex-col justify-between gap-3 rounded-2xl border-2 border-secondary bg-white p-2 font-semibold text-secondary">
      <NumberBadge>{availableManures}</NumberBadge>
      <div className="relative grid grid-cols-[30%_1fr_10%] items-center justify-between gap-4">
        <Image src={manurePNG} alt={"manuares"} width={42} height={42} />
        <p>Manures</p>
      </div>

      <div className="flex justify-between gap-1 overflow-hidden">
        <Button
          onClick={() => handleBuy(thisPlayer, "manure", PRICES.manure, 0)}
          disabled={fields[0].manure || thisPlayer.money < PRICES.manure}
        >
          Field 1
        </Button>
        <Button
          onClick={() => handleBuy(thisPlayer, "manure", PRICES.manure, 1)}
          disabled={fields[1].manure || thisPlayer.money < PRICES.manure}
        >
          Field 2
        </Button>
        {thirdField && (
          <Button
            onClick={() => handleBuy(thisPlayer, "manure", PRICES.manure, 2)}
            disabled={fields[2].manure || thisPlayer.money < PRICES.manure}
          >
            Field 3
          </Button>
        )}
      </div>
    </div>
  );
}
