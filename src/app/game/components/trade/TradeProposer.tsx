import { CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import { useState } from "react";
import { tradeOfferAction } from "../../core/actions/market/tradeOfferAction";
import { useParams } from "next/navigation";
import TradeOffer from "./TradeOffer";
import { emptyTradeOffer } from "../../utils/tradeUtils";
import PlayersDealTile from "./PlayerDealTile";

export default function TradeProposer({
  thisPlayer,
  currentPlayer,
  players,
}: {
  thisPlayer: PlayerType;
  currentPlayer: CurrentPlayerType;
  players: PlayerType[];
}) {
  const { roomId } = useParams<{ roomId: string }>();
  const [tradeOffer, setTradeOffer] = useState(emptyTradeOffer);
  const [trader, setTrader] = useState(thisPlayer);
  const [showPlayersDeals, setShowPlayersDeals] = useState(false);
  const deals = currentPlayer.tradeProposal?.playersDeals;
  const handleProposeTrade = async () => {
    try {
      await tradeOfferAction(roomId, tradeOffer);
      setTradeOffer(emptyTradeOffer);
      setTrader(thisPlayer);
      setShowPlayersDeals(true);
    } catch (error) {
      console.error("Error creating trade offer", error);
    }
  };
  return (
    <div className="border border-pink-400">
      <h2>Proposer</h2>
      <div className="flex justify-between border-4 border-cyan-300">
        <TradeOffer
          marketCards={currentPlayer.marketingCards}
          playerHand={thisPlayer.hand}
          trader={trader}
          setTrader={setTrader}
          handleProposeTrade={handleProposeTrade}
          tradeOffer={tradeOffer}
          setTradeOffer={setTradeOffer}
        />
        {showPlayersDeals && (
          <div className="border-4 border-purple-800">
            <h3>Players</h3>

            {players.map((dealer) =>
              dealer.id !== thisPlayer.id ? (
                <PlayersDealTile
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
        )}
      </div>
    </div>
  );
}
