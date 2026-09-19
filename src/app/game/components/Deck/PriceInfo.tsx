import CoinIcon from "@/app/components/ui/icons/CoinIcon";
import Image from "next/image";
import manurePNG from "@/app/assets/tokens/manure.png";
import tractorPNG from "@/app/assets/tokens/tractor.png";
import cardsPNG from "@/app/assets/tokens/cards.png";
import { PRICES } from "@/config/constants";

const items = [
  { name: "Manure", image: manurePNG, price: PRICES.manure },
  { name: "Tractor", image: tractorPNG, price: PRICES.tractor },
  { name: "Cards", image: cardsPNG, price: PRICES.cards },
];

export default function PriceInfo() {
  return (
    <div className="flex gap-2">
      {items.map(({ name, image, price }) => (
        <div key={name} className="flex items-center gap-1">
          <Image src={image} alt={name} width={25} height={25} />
          <p className="text-lg font-bold text-secondary">{price}</p>
          <CoinIcon width={20} height={16} />
        </div>
      ))}
    </div>
  );
}
