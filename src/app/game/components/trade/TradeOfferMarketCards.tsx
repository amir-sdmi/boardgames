import Button from "@/app/components/ui/Button";
import { cardName } from "../../utils/cardsUtils";
import { CardsType, TradeOfferType } from "@/types/gameTypes";

export default function TradeOfferMarketCards({
  marketCards,
  tradeOffer,
  setTradeOffer,
}: {
  marketCards: CardsType[];
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
}) {
  const handleAddMarketCardToTradeOffer = (cardId: number, i: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      marketCards: [
        ...tradeOffer.marketCards,
        { id: cardId, quantity: 1, index: i },
      ],
    };
    setTradeOffer(newTradeOffer);
  };
  const handleRemoveMarketCardFromTradeOffer = (i: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      marketCards: tradeOffer.marketCards.filter((card) => card.index !== i),
    };
    setTradeOffer(newTradeOffer);
  };
  return (
    <div>
      <h3>Market Cards :</h3>
      <ul className="border border-green-300">
        {marketCards.map((card, index) => (
          <li
            className="flex justify-between border border-green-600"
            key={index}
          >
            <p> {cardName(card.id)}</p>
            <Button
              onClick={() => handleAddMarketCardToTradeOffer(card.id, index)}
              disabled={tradeOffer.marketCards.some(
                (card) => card.index === index,
              )}
            >
              Add
            </Button>
            {tradeOffer.marketCards.some((card) => card.index === index) && (
              <Button
                onClick={() => handleRemoveMarketCardFromTradeOffer(index)}
              >
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
