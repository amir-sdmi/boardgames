import { BuyType, PlayerType } from "@/types/gameTypes";
import Button from "@/app/components/ui/Button";
interface PlayerBuyingActionsProps {
  player: PlayerType;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
}
export default function PlayerBuyingActions({
  player,
  handleBuy,
}: PlayerBuyingActionsProps) {
  return (
    <div className="flex flex-col gap-2 border border-purple-700">
      <p>Buy :</p>

      {!player.hasBoughtCards && (
        <Button onClick={() => handleBuy(player, "cards", 1)}>Buy Cards</Button>
      )}
      {!player.tractor && (
        <Button onClick={() => handleBuy(player, "tractor", 2)}>
          Buy Tractor
        </Button>
      )}
    </div>
  );
}
