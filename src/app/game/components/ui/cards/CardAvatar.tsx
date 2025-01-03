import { cardImage, cardName } from "@/app/game/utils/cardsUtils";
import Image from "next/image";

export default function CardAvatar({ cardId }: { cardId: number }) {
  return (
    <div className="border-secondary flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border-2 bg-yellow-100">
      <Image
        src={cardImage(cardId)}
        alt={cardName(cardId)}
        width={30}
        height={30}
      />
    </div>
  );
}
