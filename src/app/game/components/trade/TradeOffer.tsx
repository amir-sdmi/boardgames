import Button from "@/app/components/ui/Button";
import { cardName } from "../../utils/cardsUtils";
import { CardsType, PlayerType, TradeOfferType } from "@/types/gameTypes";
import { cardData } from "../../utils/cardData";

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
  const handleAddMarketCardToTradeOffer = (cardId: number, i: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      give: {
        ...tradeOffer.give,
        marketCards: [
          ...tradeOffer.give.marketCards,
          { id: cardId, quantity: 1, index: i },
        ],
      },
    };
    setTradeOffer(newTradeOffer);
  };

  const handleRemoveMarketCardFromTradeOffer = (i: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      give: {
        ...tradeOffer.give,
        marketCards: tradeOffer.give.marketCards.filter(
          (card) => card.index !== i,
        ),
      },
    };
    setTradeOffer(newTradeOffer);
  };
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
  const handleRemoveRecieveCard = (cardId: number) => {
    const newTradeOffer = {
      ...tradeOffer,
      recieve: {
        ...tradeOffer.recieve,
        expextedCards: tradeOffer.recieve.expextedCards.filter(
          (card) => card.id !== cardId,
        ),
      },
    };
    setTradeOffer(newTradeOffer);
  };
  const handleAddRecieveCard = (cardId: number) => {
    if (!tradeOffer.recieve.expextedCards.find((card) => card.id === cardId)) {
      const newTradeOffer = {
        ...tradeOffer,
        recieve: {
          ...tradeOffer.recieve,
          expextedCards: [
            ...tradeOffer.recieve.expextedCards,
            { id: cardId, quantity: 1 },
          ],
        },
      };
      setTradeOffer(newTradeOffer);
    } else {
      const newTradeOffer = {
        ...tradeOffer,
        recieve: {
          ...tradeOffer.recieve,
          expextedCards: tradeOffer.recieve.expextedCards.map((card) =>
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
    <>
      <div className="border-2 border-blue-300">
        <h3>Give :</h3>
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
                disabled={tradeOffer.give.marketCards.some(
                  (card) => card.index === index,
                )}
              >
                Add
              </Button>
              {tradeOffer.give.marketCards.some(
                (card) => card.index === index,
              ) && (
                <Button
                  onClick={() => handleRemoveMarketCardFromTradeOffer(index)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
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
      <div className="border-2 border-pink-500">
        <h3>Recieve</h3>
        <ul className="border border-yellow-300">
          {cardData.map((card) => (
            <li className="flex justify-between" key={card.id}>
              <p>{card.name}</p>
              <Button onClick={() => handleAddRecieveCard(card.id)}>Add</Button>
              {tradeOffer.recieve.expextedCards.find(
                (c) => c.id === card.id,
              ) && (
                <>
                  <p>
                    {
                      tradeOffer.recieve.expextedCards.find(
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
        <Button onClick={handleProposeTrade}>Propose Trade</Button>
      </div>
    </>
  );
}
