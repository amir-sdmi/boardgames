import { useGameContext } from "@/contexts/GameContext";
import OtherPlayer from "./OtherPlayer";

export default function OtherPlayers({
  thisPlayerId,
}: {
  thisPlayerId: number;
}) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { players } = gameState;
  return (
    <div className="col-span-12 grid grid-cols-2 gap-4">
      {players.map(
        (player) =>
          player.id !== thisPlayerId && (
            <OtherPlayer key={player.id} player={player} />
          ),
      )}
    </div>
  );
}
