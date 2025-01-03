import coin from "@/app/assets/coin.png";
import coin2 from "@/app/assets/coin2.png";
import coin3 from "@/app/assets/coin3.png";
import coin4 from "@/app/assets/coin4.png";
import { cardData } from "@/app/game/utils/cardData";
import Image from "next/image";

export default function CropsCard({ cardId }: { cardId: number }) {
  const crop = cardData.find((card) => card.id === cardId);
  if (!crop) return null;
  const { name, svg, totalQuantity, value } = crop;
  return (
    <div className="relative h-40 w-28 rounded-md bg-white p-2">
      <div className="relative h-[115px] w-full rounded-md bg-[#8BCEDB] px-4 pb-0.5 pt-2">
        <div className="h-[25px] w-[64px] rounded-md bg-[#ED6500] text-center text-sm font-normal">
          {name}
        </div>
        <div className="absolute top-6">
          <Image src={svg} alt={name} width={60} height={85} />
        </div>
      </div>
      <div className="mt-2 flex justify-between">
        <div className="h-3 w-3 items-end rounded bg-red-600 text-center text-[10px]">
          {totalQuantity}
        </div>
        <div className="flex gap-1">
          {value.map(
            (v, i) =>
              v && (
                <div key={i} className="flex flex-col items-center justify-end">
                  <Image src={coinImageSelector(i)} alt="coin" width={12} />
                  <p className="text-[10px] text-black">{v}</p>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
}

function coinImageSelector(i: number) {
  switch (i) {
    case 0:
      return coin;
    case 1:
      return coin2;
    case 2:
      return coin3;
    case 3:
      return coin4;
    default:
      return coin;
  }
}
