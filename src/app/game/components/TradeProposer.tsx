import {
  CurrentPlayerType,
  PlayerDealType,
  PlayerType,
} from "@/types/gameTypes";
import { useState } from "react";
import { tradeOfferAction } from "../core/actions/market/tradeOfferAction";
import { useParams } from "next/navigation";
import TradeOffer from "./TradeOffer";
import { emptyTradeOffer } from "../utils/tradeUtils";
import Button from "@/app/components/ui/Button";

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
  const handleProposeTrade = () => {
    tradeOfferAction(roomId, tradeOffer);
    setTradeOffer(emptyTradeOffer);
    setTrader(thisPlayer);
    setShowPlayersDeals(true);
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
                  deals={deals || []}
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayersDealTile({
  dealer,
  deals,
}: {
  dealer: PlayerType;
  deals: PlayerDealType[];
}) {
  const playerDeal = deals?.find((deal) => deal.playerId === dealer.id);
  const handlePickForDeal = (dealerId: number) => {
    console.log("handlePickForDeal", dealerId);
  };
  return (
    <div className="border border-white" key={dealer.id}>
      <h4>{dealer.playerName}</h4>
      {playerDeal?.accepted === null && playerDeal?.newTradeOffer === null && (
        <p>wait...</p>
      )}
      {playerDeal?.accepted === true && (
        <>
          <p>accepted</p>
          <Button onClick={() => handlePickForDeal(dealer.id)}>Accept</Button>
        </>
      )}
      {playerDeal?.accepted === false && <p>rejected</p>}
      {playerDeal?.newTradeOffer && <div>newOffer</div>}
    </div>
  );
}
