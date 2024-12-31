import Button from "@/app/components/ui/Button";
import { useGameContext } from "@/contexts/GameContext";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { PRICES } from "@/config/constants";
import Field from "./Field";
import { findPlayer } from "../../utils/utils";

const MAX_FIELDS = 3 as const;

type FieldsProps = {
  roomId: string;
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
    <ul className="flex gap-4 border border-yellow-700">
      {player.fields.map((field) => (
        <li className="w-32 border border-green-600" key={field.id}>
          <Field field={field} playerId={player.id} />

          {
            //TODO: move this logic near to game Cars based on design
            !field.manure && gameState.availableManures > 0 && (
              <Button
                disabled={player.money < PRICES.manure}
                onClick={() =>
                  handleBuy(player, "manure", PRICES.manure, field.id)
                }
              >
                Buy manure for {PRICES.manure}
              </Button>
            )
          }
        </li>
      ))}
      {player.fields.length < MAX_FIELDS && (
        <Button onClick={() => handleBuy(player, "field", PRICES.field)}>
          + Buy Field for {PRICES.field} coins
        </Button>
      )}
    </ul>
  );
}
