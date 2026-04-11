import { CardsType, FieldType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../../utils/cardsUtils";
import Button from "@/app/components/ui/Button";
import CardAvatar from "../ui/cards/CardAvatar";
import { plantFromTradeAction } from "../../core/actions/plantFromTrade/plantFromTradeAction";

export default function AcceptedTradePlant({
  player,
  roomId,
  acceptedTrade,
}: {
  player: PlayerType;
  roomId: string;
  acceptedTrade: CardsType[];
}) {
  const handlePlant = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromTradeAction(roomId, player.id, fieldIndex, card.id);
    } catch (error) {
      console.error("Error planting from trade:", error);
    }
  };

  return (
    <div className="col-span-5 flex flex-col gap-2 rounded-2xl border-2 border-amber-500/80 px-6 pb-6 pt-5">
      <h2 className="text-lg font-bold text-amber-800">
        Plant cards from your trade
      </h2>
      <p className="text-sm text-neutral-600">
        Plant each received bean onto a matching field before continuing.
      </p>
      <ul className="flex flex-col gap-3">
        {acceptedTrade.map((card) => (
          <li
            key={card.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/60 bg-amber-50/50 p-3"
          >
            <div className="flex items-center gap-3">
              <CardAvatar cardId={card.id} />
              <span className="font-semibold">
                {cardName(card.id)} × {card.quantity}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              <FieldPlantButtons
                fields={player.fields}
                hasThirdField={player.thirdField}
                card={card}
                onPlant={handlePlant}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FieldPlantButtons({
  fields,
  hasThirdField,
  card,
  onPlant,
}: {
  fields: FieldType[];
  hasThirdField: boolean;
  card: CardsType;
  onPlant: (fieldIndex: number, card: CardsType) => void;
}) {
  const disabled = (field: FieldType) =>
    field.crops !== null && field.crops.id !== card.id;

  return (
    <>
      <Button
        onClick={() => onPlant(0, card)}
        disabled={disabled(fields[0])}
      >
        F1
      </Button>
      <Button
        onClick={() => onPlant(1, card)}
        disabled={disabled(fields[1])}
      >
        F2
      </Button>
      {hasThirdField && fields[2] && (
        <Button
          onClick={() => onPlant(2, card)}
          disabled={disabled(fields[2])}
        >
          F3
        </Button>
      )}
    </>
  );
}
