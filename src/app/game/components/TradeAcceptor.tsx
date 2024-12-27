import { CardsType, CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../utils/cardsUtils";
import Button from "@/app/components/ui/Button";
import { useState } from "react";
import { acceptOrRejectTradeAction } from "../core/actions/market/tradeOfferAction";
import { useParams } from "next/navigation";

export default function TradeAcceptor({
  currentPlayer,
  thisPlayer,
}: {
  currentPlayer: CurrentPlayerType;
  thisPlayer: PlayerType;
}) {
  const { roomId } = useParams<{ roomId: string }>();

  const [showTrade, setShowTrade] = useState(false);
  if (!currentPlayer.tradeProposal) {
    return <div>No trade proposal available.</div>;
  }
  const { give, recieve } = currentPlayer.tradeProposal.proposerTradeOffer;

  const handleAcceptOrRejectTrade = (acceptedOrNot: boolean) => {
    acceptOrRejectTradeAction(roomId, thisPlayer.id, acceptedOrNot);
  };
  const handleCreateOffer = () => {
    console.log("Create an offer");
    setShowTrade(true);
  };
  return (
    <div>
      <p>Acceptor</p>
      <div className="border-4 border-pink-300">
        <h3>you will recieve : </h3>
        <p>from Market</p>
        {give.marketCards.map((card, index) => (
          <li key={index}>{cardName(card.id)}</li>
        ))}
        <p>Cards From Hand</p>
        {give.handCards.map((card, index) => (
          <li key={index}>
            {cardName(card.id)} x {card.quantity}
          </li>
        ))}
      </div>
      <div className="border-4 border-red-500">
        <h3>You will Give : </h3>
        {recieve.expextedCards.length === 0 &&
        recieve.expectedHats === false ? (
          <p> nothing, Its a gift ! </p>
        ) : (
          recieve.expextedCards.map((card, index) => (
            <li key={index}>
              {cardName(card.id)} x {card.quantity}
            </li>
          ))
        )}
      </div>
      <Button
        onClick={() => handleAcceptOrRejectTrade(true)}
        disabled={
          !playerHasAllTheRequestedCards(thisPlayer.hand, recieve.expextedCards)
        }
      >
        Accept
      </Button>
      <Button onClick={() => handleAcceptOrRejectTrade(false)}>Reject</Button>
      <Button onClick={handleCreateOffer} disabled={showTrade}>
        Create an Offer
      </Button>
      {/* {showTrade && <TradeOffer marketCards={currentPlayer.marketingCards} />} */}
    </div>
  );
}

function playerHasAllTheRequestedCards(
  playerHand: CardsType[],
  requestedCards: CardsType[],
) {
  return requestedCards.every((requestedCard) => {
    const playerCard = playerHand.find((card) => card.id === requestedCard.id);
    return (
      playerCard !== undefined && playerCard.quantity >= requestedCard.quantity
    );
  });
}
