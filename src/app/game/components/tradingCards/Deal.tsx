import { CardsType, PlayerDealType, PlayerType } from "@/types/gameTypes";
import { useParams } from "next/navigation";
import { acceptBetweenAcceptedPlayers } from "../../core/actions/market/acceptTradeDealAction";
import OfferTile from "./OfferTile";
import RemoveIcon from "@/app/components/ui/icons/RemoveIcon";
import AcceptButton from "@/app/components/ui/AcceptButton";

export default function Deal({
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
    <div
      className="border-secondary text-secondary flex h-[218px] w-[172px] flex-col items-center justify-center rounded-2xl border-2 bg-white p-3"
      key={dealer.id}
    >
      <h4 className="text-center">{dealer.playerName} :</h4>
      {deal?.accepted === null && deal?.newTradeOffer === null && (
        <p>wait...</p>
      )}
      {deal?.accepted === true && (
        <>
          <p>accepted</p>

          <AcceptButton onClick={() => handlePickForDeal(dealer.id)}>
            Accept
          </AcceptButton>
        </>
      )}
      {deal?.accepted === false && (
        <div className="flex items-center gap-2">
          <p>rejected</p> <RemoveIcon />
        </div>
      )}
      {deal?.newTradeOffer && <OfferTile deal={deal} traderHand={traderHand} />}
    </div>
  );
}
