import { useGameContext } from "@/contexts/GameContext";
import { BuyType, CardsType, PlayerType } from "@/types/gameTypes";
import BuyManure from "./BuyManure";
import BuyTractor from "./BuyTractor";
import BuyCards from "./BuyCards";
import PriceInfo from "./PriceInfo";
import DecCard from "../ui/cards/DecCard";
import CropsCard from "../ui/cards/CropsCard";
import Button from "@/app/components/ui/Button";
import { plantFromMarketAction } from "../../core/actions/plantFromMarket/plantFromMarketAction";
import { useParams } from "next/navigation";

export default function Deck({
  thisPlayer,
  handleBuy,
  setIsTradeOpen,
}: {
  thisPlayer: PlayerType;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
  setIsTradeOpen: (value: boolean) => void;
}) {
  const { roomId } = useParams<{ roomId: string }>();

  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { availableTractors, deck, currentPlayer } = gameState;
  const handlePlantFromMarket = async (
    fieldIndex: number,
    card: CardsType,
    markettingCardId: number,
  ) => {
    try {
      await plantFromMarketAction(
        roomId,
        currentPlayer.id,
        fieldIndex,
        card.id,
        markettingCardId,
      );
    } catch (error) {
      console.error("Error planting from market:", error);
    }
  };
  const handleOpenTrade = () => {
    setIsTradeOpen(true);
  };
  return (
    <div className="col-span-7 flex h-[379px] flex-col justify-between rounded-2xl border-2 border-secondary p-5">
      <div className="flex justify-between">
        <p className="text-lg font-bold text-secondary">Deck</p>
        <PriceInfo />
      </div>

      <div className="flex justify-between">
        <BuyManure handleBuy={handleBuy} thisPlayer={thisPlayer} />
        <BuyTractor
          handleBuy={handleBuy}
          thisPlayer={thisPlayer}
          availableTractors={availableTractors}
        />
        <BuyCards thisPlayer={thisPlayer} handleBuy={handleBuy} />
      </div>
      <div className="flex justify-between">
        <DecCard deckLength={deck.length} />
        {currentPlayer.marketingCards.map((card, index) => (
          <div key={index} className="flex flex-col gap-4">
            <CropsCard cardId={card.id} />
            {currentPlayer.id === thisPlayer.id && (
              <div className="flex justify-between gap-1">
                <Button onClick={() => handlePlantFromMarket(0, card, index)}>
                  F1
                </Button>
                <Button onClick={() => handlePlantFromMarket(1, card, index)}>
                  F2
                </Button>
                {thisPlayer.thirdField && (
                  <Button onClick={() => handlePlantFromMarket(2, card, index)}>
                    F3
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col gap-4">
          <DecCard type="discard" />
          {currentPlayer.marketingCards.length !== 0 && (
            <Button onClick={handleOpenTrade}>Trade ! </Button>
          )}
        </div>
      </div>
    </div>
  );
}
