import Button from "@/app/components/ui/Button";
import { cardName } from "../../utils/cardsUtils";
import { CardsType, PlayerType, TradeOfferType } from "@/types/gameTypes";

export default function TradeOfferHandCards({
  trader,
  tradeOffer,
  setTrader,
  setTradeOffer,
  playerHand,
}: {
  trader: PlayerType;
  tradeOffer: TradeOfferType;
  setTrader: (player: PlayerType) => void;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
  playerHand: CardsType[];
}) {
  const handleAddHandCardsToTradeOffer = (cardId: number) => {
    const newHandCards = tradeOffer.give.handCards;
    if (!newHandCards.find((card) => card.id === cardId)) {
      const newTradeOffer = {
        ...tradeOffer,
        give: {
          ...tradeOffer.give,
          handCards: [...newHandCards, { id: cardId, quantity: 1 }],
        },
      };
      setTradeOffer(newTradeOffer);
    } else {
      const newTradeOffer = {
        ...tradeOffer,
        give: {
          ...tradeOffer.give,
          handCards: tradeOffer.give.handCards.map((card) =>
            card.id === cardId
              ? { ...card, quantity: card.quantity + 1 }
              : card,
          ),
        },
      };
      setTradeOffer(newTradeOffer);
    }
    setTrader({
      ...trader,
      hand: trader.hand.map((card) =>
        card.id === cardId ? { ...card, quantity: card.quantity - 1 } : card,
      ),
    });
  };
  const handleRemoveHandCardFromTradeOffer = (cardId: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      give: {
        ...tradeOffer.give,
        handCards: tradeOffer.give.handCards.filter(
          (card) => card.id !== cardId,
        ),
      },
    };
    setTradeOffer(newTradeOffer);

    setTrader({
      ...trader,
      hand: trader.hand.map((card) =>
        card.id === cardId
          ? playerHand.find((c) => c.id === cardId) || card
          : card,
      ),
    });
  };
  return (
    <div>
      <h3>Hand Cards :</h3>
      <ul className="border border-red-300">
        <ul className="border border-blue-500">
          {trader.hand.map((card, handIndex) => (
            <li className="flex justify-between" key={handIndex}>
              <p>
                {cardName(card.id)} {card.quantity}
              </p>
              <Button
                onClick={() => handleAddHandCardsToTradeOffer(card.id)}
                disabled={card.quantity === 0}
              >
                Add
              </Button>
              {tradeOffer.give.handCards.some((c) => c.id === card.id) && (
                <Button
                  onClick={() => handleRemoveHandCardFromTradeOffer(card.id)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </ul>
    </div>
  );
}
