import { CardsType, FieldType } from "@/types/gameTypes";
import { cardName } from "../../utils/cardsUtils";
import ChevronDownIcon from "@/app/components/ui/icons/ChevronDownIcon";
import ChevronUpIcon from "@/app/components/ui/icons/ChevronUpIcon";
import Button from "@/app/components/ui/Button";
import CardAvatar from "../ui/cards/CardAvatar";

interface CardInHandProps {
  card: CardsType;
  openId: number | null;
  hasThirdField: boolean;
  handlePlantFromHand: (fieldIndex: number, card: CardsType) => void;
  canPlant: boolean;
  fields: FieldType[];
  setOpenId: (id: number | null) => void;
}

export default function CardToPlant({
  card,
  openId,
  setOpenId,
  hasThirdField,
  handlePlantFromHand,
  canPlant,
  fields,
}: CardInHandProps) {
  const isOpen = openId === card.id;
  const handleToggle = () => {
    //TODO: this may be a bug
    if (openId !== card.id) {
      setOpenId(card.id);
    } else {
      setOpenId(null);
    }
  };
  return (
    <div
      className="border-secondary text-secondary relative flex w-[177px] flex-col justify-between gap-3 rounded-2xl border-2 bg-white p-2 font-semibold"
      onClick={handleToggle}
    >
      <div className="bg-badge absolute -right-2 -top-2 h-6 w-6 rounded-full text-center text-sm font-semibold text-white">
        {card.quantity}
      </div>
      <div className="relative grid grid-cols-[30%_1fr_10%] items-center justify-between gap-4">
        <CardAvatar cardId={card.id} />
        <p>{cardName(card.id)}</p>
        {canPlant && (isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />)}
      </div>
      {isOpen && canPlant && (
        <div className="flex justify-between gap-1 overflow-hidden">
          <Button
            onClick={() => {
              handlePlantFromHand(0, card);
            }}
            disabled={
              fields[0].crops !== null && card.id !== fields[0].crops.id
            }
          >
            Field 1
          </Button>
          <Button
            onClick={() => handlePlantFromHand(1, card)}
            disabled={
              fields[1].crops !== null && card.id !== fields[1].crops.id
            }
          >
            Field 2
          </Button>
          {hasThirdField && (
            <Button
              onClick={() => handlePlantFromHand(2, card)}
              disabled={
                fields[2].crops !== null && card.id !== fields[2].crops.id
              }
            >
              Field 3
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
