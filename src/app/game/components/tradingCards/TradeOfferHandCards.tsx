import Button from "@/app/components/ui/Button";
import { cardName } from "../../utils/cardsUtils";
import { CardsType, PlayerType, TradeOfferType } from "@/types/gameTypes";
import Image from "next/image";
import cardsPNG from "@/app/assets/tokens/cards.png";
import { useState } from "react";
import ChevronUpIcon from "@/app/components/ui/icons/ChevronUpIcon";
import ChevronDownIcon from "@/app/components/ui/icons/ChevronDownIcon";
import TrashIcon from "@/app/components/ui/icons/TrashIcon";
import PlusIcon from "@/app/components/ui/icons/PlusIcon";
import CardAvatar from "../ui/cards/CardAvatar";

export default function TradeOfferHandCards({
  tradeOffer,
  setTradeOffer,
  playerHand,
  trader,
  setTrader,
}: {
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
  trader: PlayerType;
  setTrader: (player: PlayerType) => void;
  playerHand: CardsType[];
}) {
  const [isGiveOpen, setIsGiveOpen] = useState(false);
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
    <div className="w-[185px]">
      <h3>You Give</h3>
      <div className="border-secondary text-secondary flex flex-col justify-between gap-3 rounded-2xl border-2 bg-white p-2 font-semibold">
        <div
          className="relative flex items-center justify-between gap-2"
          onClick={() => setIsGiveOpen(!isGiveOpen)}
        >
          <Image src={cardsPNG} alt={"tractors"} width={42} height={42} />
          <p className="text-xs">Your Give</p>
          {isGiveOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {isGiveOpen && (
        <div className="border-secondary mt-2 flex h-72 flex-col overflow-auto overflow-x-hidden rounded-2xl border-2 bg-white p-2">
          {trader.hand.map((card) => (
            <div
              key={card.id}
              className="border-secondary grid grid-cols-[1fr_3fr_1fr] items-center border-b p-1.5"
            >
              <CardAvatar cardId={card.id} />

              <p className="text-xs">{cardName(card.id)}</p>
              <div className="mr-auto flex items-center justify-center gap-0.5">
                <Button
                  onClick={() => handleAddHandCardsToTradeOffer(card.id)}
                  disabled={card.quantity === 0}
                >
                  <PlusIcon />
                </Button>

                <p className="text-xs">
                  {
                    tradeOffer.give.handCards.find((c) => card.id === c.id)
                      ?.quantity
                  }
                </p>
                {tradeOffer.give.handCards.some((c) => c.id === card.id) && (
                  <Button
                    onClick={() => handleRemoveHandCardFromTradeOffer(card.id)}
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {!isGiveOpen && (
        <ul className="mt-2 flex flex-col gap-2">
          {tradeOffer.give.handCards.map((card, index) => (
            <li
              className="border-secondary text-secondary flex h-14 items-center justify-evenly rounded-2xl border-2 bg-white p-2"
              key={index}
            >
              <CardAvatar cardId={card.id} />

              <p>{cardName(card.id)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
