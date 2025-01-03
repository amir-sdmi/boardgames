import CoinIcon from "@/app/components/ui/icons/CoinIcon";
import Image from "next/image";
import manurePNG from "@/app/assets/tokens/manure.png";

export default function PriceInfo() {
  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-1">
        <Image src={manurePNG} alt="Manure" width={25} height={25} />
        <p className="text-secondary text-lg font-bold">2</p>
        <CoinIcon width={20} height={16} />
      </div>
      <div className="flex items-center gap-1">
        <Image src={manurePNG} alt="Manure" width={25} height={25} />
        <p className="text-secondary text-lg font-bold">2</p>
        <CoinIcon width={20} height={16} />
      </div>
      <div className="flex items-center gap-1">
        <Image src={manurePNG} alt="Manure" width={25} height={25} />
        <p className="text-secondary text-lg font-bold">2</p>
        <CoinIcon width={20} height={16} />
      </div>
    </div>
  );
}
