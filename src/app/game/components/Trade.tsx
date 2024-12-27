import { useGameContext } from "@/contexts/GameContext";
import { useUser } from "@clerk/nextjs";
import TradeProposer from "./TradeProposer";
import TradeAcceptor from "./TradeAcceptor";

export default function Trade() {
  const { gameState } = useGameContext();
  const { user } = useUser();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  if (!user) return <div> User not found</div>;

  const { currentPlayer } = gameState;
  const thisPlayer = gameState.players.find(
    (player) => player.userId === user.id,
  );
  if (!thisPlayer) {
    return <div> Player not found in game</div>;
  }

  return (
    <div className="border border-yellow-600">
      <div className="border border-green-600">
        {currentPlayer.id === thisPlayer.id ? (
          <TradeProposer
            currentPlayer={currentPlayer}
            thisPlayer={thisPlayer}
            players={gameState.players}
          />
        ) : (
          <TradeAcceptor
            currentPlayer={currentPlayer}
            thisPlayer={thisPlayer}
          />
        )}
      </div>
    </div>
  );
}
