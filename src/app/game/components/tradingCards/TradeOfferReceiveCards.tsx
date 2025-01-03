import Button from "@/app/components/ui/Button";
import { cardData } from "../../utils/cardData";
import { TradeOfferType } from "@/types/gameTypes";
import { useState } from "react";
import Image from "next/image";
import ChevronUpIcon from "@/app/components/ui/icons/ChevronUpIcon";
import ChevronDownIcon from "@/app/components/ui/icons/ChevronDownIcon";
import cardsPNG from "@/app/assets/tokens/cards.png";
import { cardImage, cardName } from "../../utils/cardsUtils";
import PlusIcon from "@/app/components/ui/icons/PlusIcon";
import TrashIcon from "@/app/components/ui/icons/TrashIcon";
import CardAvatar from "../ui/cards/CardAvatar";

export default function TradeOfferReceiveCards({
  tradeOffer,
  setTradeOffer,
}: {
  tradeOffer: TradeOfferType;
  setTradeOffer: (tradeOffer: TradeOfferType) => void;
}) {
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
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
    <div className="w-[185px]">
      <h3>You Recieve</h3>
      <div className="border-secondary text-secondary flex flex-col justify-between gap-3 rounded-2xl border-2 bg-white p-2 font-semibold">
        <div
          className="relative flex items-center justify-between gap-2"
          onClick={() => setIsReceiveOpen(!isReceiveOpen)}
        >
          <Image src={cardsPNG} alt={"tractors"} width={42} height={42} />
          <p className="text-xs">Your Receive</p>
          {isReceiveOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      {isReceiveOpen && (
        <ul className="border-secondary mt-2 flex h-72 flex-col overflow-auto overflow-x-hidden rounded-2xl border-2 bg-white p-2">
          {cardData.map((card) => (
            <li
              key={card.id}
              className="border-secondary grid grid-cols-[1fr_3fr_1fr] items-center border-b p-1.5"
            >
              <CardAvatar cardId={card.id} />

              <p className="text-xs">{cardName(card.id)}</p>
              <div className="mr-auto flex items-center justify-center gap-0.5">
                <Button onClick={() => handleAddRecieveCard(card.id)}>
                  <PlusIcon />
                </Button>

                <p className="text-xs">
                  {
                    tradeOffer.receive.expectedCards.find(
                      (c) => card.id === c.id,
                    )?.quantity
                  }
                </p>
                {tradeOffer.receive.expectedCards.some(
                  (c) => c.id === card.id,
                ) && (
                  <Button onClick={() => handleRemoveRecieveCard(card.id)}>
                    <TrashIcon />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!isReceiveOpen && (
        <ul className="mt-2 flex flex-col gap-2">
          {tradeOffer.receive.expectedCards.map((card, index) => (
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
