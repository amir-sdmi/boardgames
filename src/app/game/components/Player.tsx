import { useGameContext } from "@/contexts/GameContext";
import PlayerDetails from "./PlayerDetails";
import PlayerBuyingActions from "./PlayerBuyingActions";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { buyAction } from "../core/actions/buyAction";
import Fields from "./Fields";

export default function Player({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
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
  return (
    <div className="flex">
      <PlayerDetails player={thisPlayer} roomId={roomId} />
      <PlayerBuyingActions player={thisPlayer} handleBuy={handleBuy} />
      <Fields roomId={roomId} playerId={thisPlayer.id} handleBuy={handleBuy} />
    </div>
  );
}
