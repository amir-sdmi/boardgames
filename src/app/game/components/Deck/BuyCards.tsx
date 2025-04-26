import cardsPNG from "@/app/assets/tokens/cards.png";
import Button from "@/app/components/ui/Button";
import { PRICES } from "@/config/constants";
import { BuyType, PlayerType } from "@/types/gameTypes";
import Image from "next/image";

export default function BuyCards({
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
  return (
    <div className="flex w-[177px] flex-col justify-between gap-3 rounded-2xl border-2 border-secondary bg-white p-2 font-semibold text-secondary">
      <div className="relative grid grid-cols-3 items-center justify-between gap-2">
        <Image src={cardsPNG} alt={"tractors"} width={42} height={42} />
        <p>cards</p>
      </div>
      <Button
        onClick={() => handleBuy(thisPlayer, "cards", PRICES.cards)}
        disabled={thisPlayer.hasBoughtCards}
      >
        Buy
      </Button>
    </div>
  );
}
