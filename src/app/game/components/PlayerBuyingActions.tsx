import { BuyType, PlayerType } from "@/types/gameTypes";
import Button from "@/app/components/ui/Button";
import { useState } from "react";
const PRICES = {
  cards: 1,
  tractor: 2,
} as const;

type PlayerBuyingActionsProps = {
  player: PlayerType;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
};
export default function PlayerBuyingActions({
  player,
  handleBuy,
}: PlayerBuyingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchases = async (type: BuyType, price: number) => {
    setIsLoading(true);
    try {
      await handleBuy(player, type, price);
    } catch (error) {
      console.error("Error buying:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 border border-purple-700">
      <p>Available Purchases :</p>

      {!player.hasBoughtCards && (
        <Button
          onClick={() => handlePurchases("cards", PRICES.cards)}
          disabled={isLoading || player.money < PRICES.cards}
        >
          Buy Cards ({PRICES.cards})
        </Button>
      )}
      {!player.tractor && (
        <Button
          onClick={() => handlePurchases("tractor", PRICES.tractor)}
          disabled={isLoading || player.money < PRICES.tractor}
        >
          Buy Tractor ({PRICES.tractor})
        </Button>
      )}
    </div>
  );
}
