import { CardsType, PlayerDealType } from "@/types/gameTypes";
import { useParams } from "next/navigation";
import { acceptTradeDealFromDealerTile } from "../../core/actions/market/acceptTradeDealAction";
import { cardName } from "../../utils/cardsUtils";
import { playerHasAllTheRequestedCards } from "../../utils/tradeUtils";
import Button from "@/app/components/ui/Button";

export default function OfferTile({
  deal,
  traderHand,
}: {
  deal: PlayerDealType;
  traderHand: CardsType[];
}) {
  const { roomId } = useParams<{ roomId: string }>();

  if (!deal.newTradeOffer) {
    return <div>no deal</div>;
  }
  //market to dealer, traderHand to dealer, dealerHand to trader
  const handleAcceptDeal = () => {
    acceptTradeDealFromDealerTile(roomId, deal.playerId);
  };

  return (
    <div>
      <h3>Market Cards</h3>
      {deal.newTradeOffer.marketCards.map((card, index) => (
        <li key={index}>
          {cardName(card.id)} x {card.quantity}
        </li>
      ))}
      <h3>Give</h3>
      {
        // since expectedCards in deals is given cards of trader
        deal.newTradeOffer.receive.expectedCards.map((card, index) => (
          <li key={index}>
            {cardName(card.id)} x {card.quantity}
          </li>
        ))
      }
      <h3>Receive</h3>
      {
        //since giveen handcards are received cards for trader
        deal.newTradeOffer.give.handCards.map((card, index) => (
          <li key={index}>
            {cardName(card.id)} x {card.quantity}
          </li>
        ))
      }
      <Button
        onClick={handleAcceptDeal}
        disabled={
          !playerHasAllTheRequestedCards(
            traderHand,
            deal.newTradeOffer.receive.expectedCards,
          )
        }
      >
        Accept
      </Button>
    </div>
  );
}
