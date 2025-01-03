import { cardName } from "../../utils/cardsUtils";
import { CardsType, TradeOfferType } from "@/types/gameTypes";
import { useState } from "react";
import CardAvatar from "../ui/cards/CardAvatar";
export default function TradeOfferMarketCards({
  marketCards,
  tradeOffer,
  setTradeOffer,
}: {
  marketCards: CardsType[];
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
}) {
  const [selectFromMarket, setSelectFromMarket] = useState<boolean[]>(
    Array(marketCards.length).fill(false),
  );

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
  const handleSelectFromMarket = (cardId: number, i: number) => {
    if (selectFromMarket[i]) {
      handleRemoveMarketCardFromTradeOffer(i);
    } else {
      handleAddMarketCardToTradeOffer(cardId, i);
    }
    setSelectFromMarket(
      selectFromMarket.map((selected, index) =>
        index === i ? !selected : selected,
      ),
    );
  };
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-secondary">Market Cards</h3>
      <ul className="flex flex-col gap-2 overflow-hidden rounded-2xl border-2 border-secondary p-4">
        {marketCards.map((card, index) => (
          <li
            className="flex h-14 w-32 items-center justify-between rounded-2xl border-2 border-secondary bg-white p-2 text-secondary"
            key={index}
            onClick={() => handleSelectFromMarket(card.id, index)}
          >
            <CardAvatar cardId={card.id} />

            <p>
              {cardName(card.id)}
              <span>{selectFromMarket[index] ? "✔️" : ""}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
