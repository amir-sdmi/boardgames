import { useGameContext } from "@/contexts/GameContext";
import Market from "./Market";
import Player from "./Player";
import { BuyType, CardsType, PlayerType } from "@/types/gameTypes";
import { buyAction } from "../core/actions/buy/buyAction";
import { useParams } from "next/navigation";
import Deck from "./Deck/Deck";
import Hand from "./Hand/Hand";
import Button from "@/app/components/ui/Button";
import { cardName } from "../utils/cardsUtils";
import { plantFromTradeAction } from "../core/actions/plantFromTrade/plantFromTradeAction";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";

export default function PlayerGame({ userId }: { userId: string }) {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const thisPlayer = gameState.players.find(
    (player) => player.userId === userId,
  );
  if (!thisPlayer) {
    return <div> Player not found in game</div>;
  }
  const handleBuy = async (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => {
    try {
      await buyAction(roomId, player.id, type, price, fieldId);
    } catch (error) {
      console.error("Error buying:", error);
    }
  };
  const handlePlantFromTrade = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromTradeAction(roomId, thisPlayer.id, fieldIndex, card.id);
    } catch (error) {
      console.error("Error planting from trade:", error);
    }
  };

  return (
    <>
      <Deck thisPlayer={thisPlayer} handleBuy={handleBuy} />
      <Market thisPlayer={thisPlayer} handleBuy={handleBuy} />
      <Player thisPlayer={thisPlayer} handleBuy={handleBuy} />
      <Hand
        player={thisPlayer}
        roomId={roomId}
        currentPlayer={gameState.currentPlayer}
      />
      <ul className="border border-yellow-500">
        {thisPlayer.acceptedTrade?.map((card) => (
          <li key={card.id}>
            {cardName(card.id)} x {card.quantity}
            <div>
              <Button onClick={() => handlePlantFromTrade(0, card)}>F1</Button>
              <Button onClick={() => handlePlantFromTrade(1, card)}>F2</Button>
              {thisPlayer.fields.length > 2 && (
                <Button onClick={() => handlePlantFromTrade(2, card)}>
                  F3
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
