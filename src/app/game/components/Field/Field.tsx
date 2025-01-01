import Image from "next/image";
import emptyField from "../../../assets/fields/emptyField.png";
import Button from "@/app/components/ui/Button";
import Info from "@/app/components/ui/Info";
import { FieldType, PlayerType } from "@/types/gameTypes";
import { harvestAction } from "../../core/actions/harvest/harvestAction";
import { useParams } from "next/navigation";
import manurePNG from "../../../assets/tokens/manure.png";
import { cardName } from "../../utils/cardsUtils";
import CropsCard from "../ui/cards/CropsCard";
import NumberBadge from "@/app/components/ui/NumberBadge";
import { findThePrice } from "../../core/actions/harvest/findThePrice";
export default function Field({
  field,
  playerId,
}: {
  field: FieldType;
  playerId: PlayerType["id"];
}) {
  const { roomId } = useParams<{ roomId: string }>();
  const handleHarvest = async (fieldIndex: number, playerId: number) => {
    try {
      await harvestAction(roomId, playerId, fieldIndex);
    } catch (error) {
      console.error("Error harvesting:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Info>Field {field.id + 1}</Info>
      <div className="relative h-[242px] w-[152px]">
        <Image
          src={emptyField}
          alt="Empty Field"
          layout="fit"
          objectFit="cover"
          objectPosition="center"
          className="-z-10"
        />
        {field.manure && (
          <Image
            src={manurePNG}
            alt="Manure"
            className="absolute left-1/3 top-0"
          />
        )}
        <div className="absolute left-6 top-16 h-10 w-10">
          {field.crops && (
            <div>
              <CropsCard cardId={field.crops.id} />
            </div>
          )}
        </div>
        {field.crops && (
          <div className="absolute right-4 top-16">
            <NumberBadge>{field.crops?.quantity}</NumberBadge>
          </div>
        )}
      </div>
      <Button
        onClick={() => handleHarvest(field.id, playerId)}
        disabled={!field.crops}
      >
        Harvest {field.crops ? findThePrice(field.crops, field.manure) : 0}
      </Button>
    </div>
  );
}
