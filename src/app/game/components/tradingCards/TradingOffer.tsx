import { CardsType, PlayerType, TradeOfferType } from "@/types/gameTypes";
import TradeOfferReceiveCards from "./TradeOfferReceiveCards";
import Button from "@/app/components/ui/Button";
import TradeOfferHandCards from "./TradeOfferHandCards";
import TradeOfferMarketCards from "./TradeOfferMarketCards";

export default function TradingOffer({
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
  const isMarketCardsEmpty = tradeOffer.marketCards.length === 0;
  return (
    <div className="border-secondary text-secondary col-span-5 rounded-2xl border-2 p-4 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <TradeOfferMarketCards
          marketCards={marketCards}
          tradeOffer={tradeOffer}
          setTradeOffer={setTradeOffer}
        />
      </div>
      <div className="flex justify-between">
        <TradeOfferHandCards
          setTrader={setTrader}
          tradeOffer={tradeOffer}
          setTradeOffer={setTradeOffer}
          playerHand={playerHand}
          trader={trader}
        />

        <TradeOfferReceiveCards
          tradeOffer={tradeOffer}
          setTradeOffer={setTradeOffer}
        />
      </div>
      <Button onClick={handleProposeTrade} disabled={isMarketCardsEmpty}>
        Propose Trade
      </Button>
    </div>
  );
}
