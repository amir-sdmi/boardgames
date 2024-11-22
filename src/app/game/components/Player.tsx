import { useGameContext } from "@/contexts/GameContext";
import PlayerDetails from "./PlayerDetails";

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
  return <PlayerDetails player={thisPlayer} roomId={roomId} />;
}
