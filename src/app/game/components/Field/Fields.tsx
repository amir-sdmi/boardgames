import Button from "@/app/components/ui/Button";
import { useGameContext } from "@/contexts/GameContext";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { PRICES } from "@/config/constants";
import Field from "./Field";
import { findPlayer } from "../../utils/utils";
import coin3 from "@/app/assets/coin3.png";
import Image from "next/image";

const MAX_FIELDS = 3 as const;

type FieldsProps = {
  playerId: number;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
};
export default function Fields({ playerId, handleBuy }: FieldsProps) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }

  const player = findPlayer(gameState.players, playerId);
  if (!player) {
    return <div> Player not found in game</div>;
  }

  return (
    <ul className="flex items-center">
      {player.fields.map((field) => (
        <li key={field.id}>
          <Field field={field} playerId={player.id} />
        </li>
      ))}
      <li>
        {player.fields.length < MAX_FIELDS && (
          <Button onClick={() => handleBuy(player, "field", PRICES.field)}>
            Buy Field: 3
            <span>
              <Image src={coin3} alt="coins" width={12} height={8} />
            </span>
          </Button>
        )}
      </li>
    </ul>
  );
}
