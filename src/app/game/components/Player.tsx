import { useGameContext } from "@/contexts/GameContext";
import PlayerDetails from "./PlayerDetails";
import PlayerBuyingActions from "./PlayerBuyingActions";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { buyAction } from "../core/actions/buyAction";

export default function Player({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}) {
  const { gameState } = useGameContext();
  if (!gameState) return;
  const thisPlayer = gameState.players.find(
    (player) => player.userId === userId,
  );
  if (!thisPlayer) return;

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
    <>
      <PlayerDetails player={thisPlayer} roomId={roomId} />
      <PlayerBuyingActions player={thisPlayer} handleBuy={handleBuy} />;
    </>
  );
}
