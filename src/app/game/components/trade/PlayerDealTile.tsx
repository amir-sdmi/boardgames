import Button from "@/app/components/ui/Button";
import { CardsType, PlayerDealType, PlayerType } from "@/types/gameTypes";

import OfferTile from "./OfferTile";
import { acceptBetweenAcceptedPlayers } from "../../core/actions/market/acceptTradeDealAction";
import { useParams } from "next/navigation";

export default function PlayersDealTile({
  dealer,
  deal,
  traderHand,
}: {
  dealer: PlayerType;
  deal: PlayerDealType;
  traderHand: CardsType[];
}) {
  const { roomId } = useParams<{ roomId: string }>();
  const handlePickForDeal = (dealerId: number) => {
    acceptBetweenAcceptedPlayers(roomId, dealerId);
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
      {deal?.newTradeOffer && <OfferTile deal={deal} traderHand={traderHand} />}
    </div>
  );
}
