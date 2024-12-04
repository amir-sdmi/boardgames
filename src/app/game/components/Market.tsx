import { useGameContext } from "@/contexts/GameContext";
import { useUser } from "@clerk/nextjs";
import { cardName } from "../utils/cardsUtils";
import Button from "@/app/components/ui/Button";
import { CardsType } from "@/types/gameTypes";
import { useParams } from "next/navigation";
import { plantFromMarketAction } from "../core/actions/plantFromMarket/plantFromMarketAction";

export default function Market() {
  const { gameState } = useGameContext();
  const user = useUser();
  const { roomId } = useParams<{ roomId: string }>();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }

  if (!user) return null;
  const { currentPlayer, players } = gameState;

  const handlePlantFromMarket = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromMarketAction(
        roomId,
        currentPlayer.id,
        fieldIndex,
        card.id,
      );
    } catch (error) {
      console.error("Error planting from market:", error);
    }
  };
  return (
    <div className="border border-white">
      {currentPlayer.turnStatus === "marketing" ? (
        <div>
          <h2>Market</h2>
          <ul className="flex gap-4 border border-yellow-700">
            {currentPlayer.marketingCards.map((card, index) => (
              <li className="w-32 border border-green-600" key={index}>
                <p> {cardName(card.id)}</p>
                <div>
                  <Button onClick={() => handlePlantFromMarket(0, card)}>
                    F1
                  </Button>
                  <Button onClick={() => handlePlantFromMarket(1, card)}>
                    F2
                  </Button>
                  {players[currentPlayer.id].thirdField && (
                    <Button onClick={() => handlePlantFromMarket(2, card)}>
                      F3
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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