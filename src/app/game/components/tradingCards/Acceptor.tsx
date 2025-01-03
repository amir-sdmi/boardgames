import { CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import Button from "@/app/components/ui/Button";
import { acceptOrRejectTradeAction } from "../../core/actions/market/tradeOfferAction";
import { useParams } from "next/navigation";

import { playerHasAllTheRequestedCards } from "../../utils/tradeUtils";
import CardAvatar from "../ui/cards/CardAvatar";
import NumberBadge from "@/app/components/ui/NumberBadge";
import AcceptButton from "@/app/components/ui/AcceptButton";
import RejectButton from "@/app/components/ui/RejectButton";

export default function Acceptor({
  currentPlayer,
  thisPlayer,
  setIsChangeOpen,
}: {
  currentPlayer: CurrentPlayerType;
  thisPlayer: PlayerType;
  setIsChangeOpen: (value: boolean) => void;
}) {
  const { roomId } = useParams<{ roomId: string }>();

  if (!currentPlayer.tradeProposal) {
    return <div>No trade proposal available.</div>;
  }
  const { give, receive, marketCards } =
    currentPlayer.tradeProposal.proposerTradeOffer;
  const handleAcceptOrRejectTrade = (acceptedOrNot: boolean) => {
    acceptOrRejectTradeAction(roomId, thisPlayer.id, acceptedOrNot);
  };
  const handleCreateOffer = () => {
    setIsChangeOpen(true);
  };

  return (
    <div className="col-span-7 h-[379px]">
      <div className="border-secondary text-secondary flex w-[172px] flex-col items-center justify-between rounded-2xl border-2 bg-white p-2">
        <p>Trade</p>
        <div className="border-secondary w-full border-b-2 p-1 text-left">
          <h3>recieve</h3>
          <div className="flex items-center justify-around">
            {marketCards.map((card, index) => (
              <div key={index} className="relative">
                <CardAvatar cardId={card.id} />
                <NumberBadge>{card.quantity}</NumberBadge>
              </div>
            ))}
            {give.handCards.map((card, index) => (
              <div key={index} className="relative">
                <CardAvatar cardId={card.id} />
                <NumberBadge>{card.quantity}</NumberBadge>
              </div>
            ))}
          </div>
        </div>
        <div className="border-secondary w-full border-b-2 p-1 text-left">
          <h3>Give </h3>
          <div className="flex items-center justify-around">
            {receive.expectedCards.length === 0 &&
            receive.expectedHats === false ? (
              <p> nothing, Its a gift ! </p>
            ) : (
              receive.expectedCards.map((card, index) => (
                <div key={index} className="relative">
                  <CardAvatar cardId={card.id} />
                  <NumberBadge>{card.quantity}</NumberBadge>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex h-full w-full items-center justify-between gap-2 p-1">
          <AcceptButton
            onClick={() => handleAcceptOrRejectTrade(true)}
            disabled={
              !playerHasAllTheRequestedCards(
                thisPlayer.hand,
                receive.expectedCards,
              )
            }
          >
            Accept
          </AcceptButton>
          <RejectButton onClick={() => handleAcceptOrRejectTrade(false)}>
            Reject
          </RejectButton>
          {currentPlayer.id !== thisPlayer.id && (
            <Button onClick={handleCreateOffer}>Change</Button>
          )}
        </div>
        {/* {showChange && (
          <TradingOffer
            marketCards={currentPlayer.marketingCards}
            playerHand={thisPlayer.hand}
            trader={dealer}
            setTrader={setDealer}
            setTradeOffer={setDealerTradeOffer}
            tradeOffer={dealerTradeOffer}
            handleProposeTrade={handleDealerTradeOffer}
          />
        )} */}
      </div>
    </div>
  );
}
