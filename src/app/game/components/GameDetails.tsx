import { useGameContext } from "@/contexts/GameContext";

export default function GameDetails() {
  const { gameState } = useGameContext();

  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const {
    players,
    availableManures,
    availableTractors,
    currentPlayer,
    endTurnReceivingCardsCount,
    deck,
    discardPile,
    round,
  } = gameState;

  return (
    <div>
      <h1>Gameboard</h1>
      <p>round : {round}</p>
      <p>deck : {deck.length} cards</p>
      <p>
        discards :
        {discardPile.reduce((count, item) => item.quantity + count, 0)}
      </p>
      <p>players number: {players.length}</p>
      <p>
        current player: {currentPlayer.id} : {currentPlayer.turnStatus}
      </p>
      <p>available manures: {availableManures}</p>
      <p>available tractors: {availableTractors}</p>
      <p>end turn receiving cards count: {endTurnReceivingCardsCount}</p>
      <hr />
    </div>
  );
}
