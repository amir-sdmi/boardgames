import Button from "@/app/components/ui/Button";
import { cardData } from "../../utils/cardData";
import { TradeOfferType } from "@/types/gameTypes";

export default function TradeOfferReceiveCards({
  tradeOffer,
  setTradeOffer,
}: {
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
}) {
  const handleRemoveRecieveCard = (cardId: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      receive: {
        ...tradeOffer.receive,
        expectedCards: tradeOffer.receive.expectedCards.filter(
          (card) => card.id !== cardId,
        ),
      },
    };
    setTradeOffer(newTradeOffer);
  };
  const handleAddRecieveCard = (cardId: number) => {
    if (!tradeOffer.receive.expectedCards.find((card) => card.id === cardId)) {
      const newTradeOffer = {
        ...tradeOffer,
        receive: {
          ...tradeOffer.receive,
          expectedCards: [
            ...tradeOffer.receive.expectedCards,
            { id: cardId, quantity: 1 },
          ],
        },
      };
      setTradeOffer(newTradeOffer);
    } else {
      const newTradeOffer = {
        ...tradeOffer,
        receive: {
          ...tradeOffer.receive,
          expectedCards: tradeOffer.receive.expectedCards.map((card) =>
            card.id === cardId
              ? { ...card, quantity: card.quantity + 1 }
              : card,
          ),
        },
      };
      setTradeOffer(newTradeOffer);
    }
  };
  return (
    <div className="border-2 border-pink-500">
      <h3>Recieve</h3>
      <ul className="border border-yellow-300">
        {cardData.map((card) => (
          <li className="flex justify-between" key={card.id}>
            <p>{card.name}</p>
            <Button onClick={() => handleAddRecieveCard(card.id)}>Add</Button>
            {tradeOffer.receive.expectedCards.find((c) => c.id === card.id) && (
              <>
                <p>
                  {
                    tradeOffer.receive.expectedCards.find(
                      (c) => c.id === card.id,
                    )?.quantity
                  }
                </p>
                <Button onClick={() => handleRemoveRecieveCard(card.id)}>
                  Remove
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
