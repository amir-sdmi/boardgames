import { useGameContext } from "@/contexts/GameContext";
import PlayerDetails from "./PlayerDetails";
import { BuyType, PlayerType } from "@/types/gameTypes";
import Fields from "./Field/Fields";
import { useParams } from "next/navigation";

export default function Player({
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
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }

  return (
    <div className="flex">
      <Fields roomId={roomId} playerId={thisPlayer.id} handleBuy={handleBuy} />
      <PlayerDetails
        player={thisPlayer}
        roomId={roomId}
        currentPlayer={gameState.currentPlayer}
      />
    </div>
  );
}
