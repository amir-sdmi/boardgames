import { useGameContext } from "@/contexts/GameContext";
import Deal from "./Deal";
import { PlayerType } from "@/types/gameTypes";

export default function Deals({ thisPlayer }: { thisPlayer: PlayerType }) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { players, currentPlayer } = gameState;
  const deals = currentPlayer.tradeProposal?.playersDeals;
  return (
    <div className="col-span-7">
      <div className="flex gap-2">
        {players.map((dealer) =>
          dealer.id !== thisPlayer.id ? (
            <Deal
              key={dealer.id}
              dealer={dealer}
              deal={
                deals?.find((deal) => deal.playerId === dealer.id) ?? {
                  playerId: dealer.id,
                  accepted: null,
                  newTradeOffer: null,
                }
              }
              traderHand={thisPlayer.hand}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
