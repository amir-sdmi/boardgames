import Button from "@/app/components/ui/Button";
import { useGameContext } from "@/contexts/GameContext";
import { cardData } from "../utils/cardData";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { harvestAction } from "../core/actions/harvestAction";
import { PRICES } from "@/config/constants";

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
export default function Fields({ roomId, playerId, handleBuy }: FieldsProps) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const player = gameState.players.find((player) => player.id === playerId);
  if (!player) {
    return <div> Player not found in game</div>;
  }
  const handleHarvest = async (fieldIndex: number, playerId: number) => {
    try {
      await harvestAction(roomId, playerId, fieldIndex);
    } catch (error) {
      console.error("Error harvesting:", error);
    }
  };
  return (
    <ul className="flex gap-4 border border-yellow-700">
      {player.fields.map((field, fieldIndex) => (
        <li className="w-32 border border-green-600" key={fieldIndex}>
          <p>id: {field.id}</p>
          <Button
            onClick={() => handleHarvest(fieldIndex, playerId)}
            disabled={!field.crops}
          >
            Harvest
          </Button>

          <p>manure : {field.manure ? "yes" : "no"}</p>
          {!field.manure && gameState.availableManures > 0 && (
            <Button
              onClick={() =>
                handleBuy(player, "manure", PRICES.manure, field.id)
              }
            >
              Buy manure for {PRICES.manure}
            </Button>
          )}
          {field.crops && (
            <div>
              <p>id: {field.crops.id}</p>
              <p>
                name: {cardData.find((c) => c.id === field.crops?.id)?.name}
              </p>
              <p>quantity: {field.crops.quantity}</p>
            </div>
          )}
        </li>
      ))}
      {player.fields.length < 3 && (
        <Button onClick={() => handleBuy(player, "field", PRICES.field)}>
          + Buy Field for {PRICES.field} coins
        </Button>
      )}
    </ul>
  );
}
