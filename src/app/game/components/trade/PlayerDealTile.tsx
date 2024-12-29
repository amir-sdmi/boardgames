import Button from "@/app/components/ui/Button";
import { PlayerDealType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../../utils/cardsUtils";
import { useParams } from "next/navigation";
import { acceptTradeDealAction } from "../../core/actions/market/acceptTradeDealAction";

export default function PlayersDealTile({
  dealer,
  deal,
}: {
  dealer: PlayerType;
  deal: PlayerDealType;
}) {
  const handlePickForDeal = (dealerId: number) => {
    console.log("handlePickForDeal", dealerId);
  };
  return (
    <div className="border border-white" key={dealer.id}>
      <h4>{dealer.playerName}</h4>
      {deal?.accepted === null && deal?.newTradeOffer === null && (
        <p>wait...</p>
      )}
      {deal?.accepted === true && (
        <>
          <p>accepted</p>
          <Button onClick={() => handlePickForDeal(dealer.id)}>Accept</Button>
        </>
      )}
      {deal?.accepted === false && <p>rejected</p>}
      {deal?.newTradeOffer && <OfferTile deal={deal} />}
    </div>
  );
}

function OfferTile({ deal }: { deal: PlayerDealType }) {
  const { roomId } = useParams<{ roomId: string }>();

  //market to dealer, traderHand to dealer, dealerHand to trader
  const handleAcceptDeal = () => {
    acceptTradeDealAction(roomId, deal.playerId);
  };

  return (
    <div>
      <h3>Market Cards</h3>
      {deal.newTradeOffer?.marketCards.map((card, index) => (
        <li key={index}>
          {cardName(card.id)} x {card.quantity}
        </li>
      ))}
      <h3>Give</h3>
      {// since expectedCards in deals is given cards of trader
      deal.newTradeOffer?.receive.expectedCards.map((card, index) => (
        <li key={index}>
          {cardName(card.id)} x {card.quantity}
        </li>
      ))}
      <h3>Receive</h3>
      {//since giveen handcards are received cards for trader
      deal.newTradeOffer?.give.handCards.map((card, index) => (
        <li key={index}>
          {cardName(card.id)} x {card.quantity}
        </li>
      ))}
      <Button onClick={handleAcceptDeal}>Accept</Button>
    </div>
  );
}
