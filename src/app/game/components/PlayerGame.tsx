import { useGameContext } from "@/contexts/GameContext";
import GameDetails from "./GameDetails";
import Market from "./Market";
import Player from "./Player";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { buyAction } from "../core/actions/buy/buyAction";
import { useParams } from "next/navigation";

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
  return (
    <>
      <GameDetails />
      <Market thisPlayer={thisPlayer} handleBuy={handleBuy} />
      <Player thisPlayer={thisPlayer} handleBuy={handleBuy} />
    </>
  );
}
