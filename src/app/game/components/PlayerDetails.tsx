import Button from "@/app/components/ui/Button";
import { useGameContext } from "@/contexts/GameContext";
import { CardsType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../utils/cardsUtils";
import { plantFromHand } from "../core/plantFromHand";

export default function PlayerDetails({ player }: { player: PlayerType }) {
  const { gameState, updateGameState } = useGameContext();
  if (!gameState) return;
  const { players, currentPlayer } = gameState;

  const handlePlantFromHand = async (fieldIndex: number, card: CardsType) => {
    const {
      hand: newHand,
      field: newField,
      currentPlayer: newCurrentPlayer,
    } = plantFromHand(
      player.hand,
      player.fields[fieldIndex],
      card,
      currentPlayer,
    );

    await updateGameState({
      players: players.map((p) =>
        p.id === player.id
          ? {
              ...p,
              hand: newHand,
              fields: p.fields.map((f, i) => (i === fieldIndex ? newField : f)),
            }
          : p,
      ),
      currentPlayer: newCurrentPlayer,
    });
  };

  return (
    <>
      <h1>Player Details</h1>
      <p>id :{player.id}</p>
      <p>name :{player.playerName}</p>
      <p>tractor : {player.tractor ? "yes" : "no"}</p>
      <p>money : {player.money}</p>
      <p>
        hat :
        {player.playerHat.owenedBy === player.playerHat.ownerId
          ? "here"
          : players[player.playerHat.owenedBy].playerName}
      </p>
      <ol className="border border-blue-500">
        {player.hand.map((card, handIndex) => (
          <li key={handIndex}>
            {cardName(card.id)} {card.quantity}
            {player.id === currentPlayer.id &&
              currentPlayer.turnStatus === "planting" &&
              (currentPlayer.plantCounts < 2 ||
                (currentPlayer.plantCounts < 3 && player.tractor)) && (
                <div>
                  <Button onClick={() => handlePlantFromHand(0, card)}>
                    F1
                  </Button>
                  <Button onClick={() => handlePlantFromHand(1, card)}>
                    F2
                  </Button>
                  {player.fields.length > 2 && (
                    <Button onClick={() => handlePlantFromHand(2, card)}>
                      F3
                    </Button>
                  )}
                </div>
              )}
          </li>
        ))}
      </ol>
    </>
  );
}
