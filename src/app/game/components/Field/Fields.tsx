import Button from "@/app/components/ui/Button";
import { useGameContext } from "@/contexts/GameContext";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { PRICES } from "@/config/constants";
import Field from "./Field";
import { findPlayer } from "../../utils/utils";

import CoinIcon from "@/app/components/ui/icons/CoinIcon";

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
    <div className="flex items-center">
      {player.fields.map((field) => (
        <div key={field.id}>
          <Field field={field} playerId={player.id} />
        </div>
      ))}
      <div>
        {player.fields.length < MAX_FIELDS && (
          <Button onClick={() => handleBuy(player, "field", PRICES.field)}>
            <div className="flex gap-1">
              + Field: 3
              <span>
                <CoinIcon width={18} height={18} />
              </span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
