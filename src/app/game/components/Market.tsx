import { useGameContext } from "@/contexts/GameContext";
import { cardName } from "../utils/cardsUtils";
import Button from "@/app/components/ui/Button";
import { CardsType } from "@/types/gameTypes";
import { useParams } from "next/navigation";
import { plantFromMarketAction } from "../core/actions/plantFromMarket/plantFromMarketAction";
import { useUser } from "@clerk/nextjs";
import Trade from "./Trade";

export default function Market() {
  const { gameState } = useGameContext();
  const { user } = useUser();
  const { roomId } = useParams<{ roomId: string }>();

  if (!gameState) {
    return <div>Loading game state ...</div>;
  }

  if (!user) return null;

  const { currentPlayer, players } = gameState;

  const thisPlayer = gameState.players.find(
    (player) => player.userId === user.id,
  );
  if (!thisPlayer) {
    return <div> Player not found in game</div>;
  }

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
          <h2>Market</h2>
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
          <Trade />
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
