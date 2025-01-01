import { useGameContext } from "@/contexts/GameContext";
import { cardName } from "../utils/cardsUtils";
import Button from "@/app/components/ui/Button";
import { BuyType, CardsType, PlayerType } from "@/types/gameTypes";
import { useParams } from "next/navigation";
import { plantFromMarketAction } from "../core/actions/plantFromMarket/plantFromMarketAction";
import { useUser } from "@clerk/nextjs";
import Trade from "./trade/Trade";

export default function Market({
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
  const { roomId } = useParams<{ roomId: string }>();

  if (!gameState) {
    return <div>Loading game state ...</div>;
  }

  const { currentPlayer, players } = gameState;

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

  return (
    <div className="border border-white">
      {currentPlayer.turnStatus === "marketing" ? (
        <div>
          <ul className="flex gap-4 border border-yellow-700">
            {currentPlayer.marketingCards.map((card, index) => (
              <li className="w-32 border border-green-600" key={index}>
                <p> {cardName(card.id)}</p>
                {currentPlayer.id === thisPlayer.id && (
                  <div>
                    <Button
                      onClick={() => handlePlantFromMarket(0, card, index)}
                    >
                      F1
                    </Button>
                    <Button
                      onClick={() => handlePlantFromMarket(1, card, index)}
                    >
                      F2
                    </Button>
                    {players[currentPlayer.id].thirdField && (
                      <Button
                        onClick={() => handlePlantFromMarket(2, card, index)}
                      >
                        F3
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {currentPlayer.marketingCards.length !== 0 && <Trade />}
        </div>
      ) : (
        <div>
          <h2>Market</h2>
          <p>It is not your turn to market</p>
        </div>
      )}
    </div>
  );
}
