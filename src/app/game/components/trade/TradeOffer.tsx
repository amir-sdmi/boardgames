import Button from "@/app/components/ui/Button";
import { CardsType, PlayerType, TradeOfferType } from "@/types/gameTypes";
import TradeOfferMarketCards from "./TradeOfferMarketCards";
import TradeOfferHandCards from "./TradeOfferHandCards";
import TradeOfferReceiveCards from "./TradeOfferReceiveCards";

export default function TradeOffer({
  marketCards,
  playerHand,
  tradeOffer,
  setTradeOffer,
  trader,
  setTrader,
  handleProposeTrade,
}: {
  marketCards: CardsType[];
  playerHand: CardsType[];
  trader: PlayerType;
  setTrader: (player: PlayerType) => void;
  handleProposeTrade: () => void;
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
}) {
  return (
    <>
      <div className="border-2 border-blue-300">
        {/* <h3>Give :</h3> */}
        <TradeOfferMarketCards
          marketCards={marketCards}
          tradeOffer={tradeOffer}
          setTradeOffer={setTradeOffer}
        />
        <TradeOfferHandCards
          tradeOffer={tradeOffer}
          trader={trader}
          setTradeOffer={setTradeOffer}
          setTrader={setTrader}
          playerHand={playerHand}
        />
      </div>
      <TradeOfferReceiveCards
        tradeOffer={tradeOffer}
        setTradeOffer={setTradeOffer}
      />
      <Button onClick={handleProposeTrade}>Propose Trade</Button>
    </>
  );
}
