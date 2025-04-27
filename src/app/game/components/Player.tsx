import { useGameContext } from "@/contexts/GameContext";
import { BuyType, PlayerType } from "@/types/gameTypes";
import Fields from "./Field/Fields";
import { useParams } from "next/navigation";
import Image from "next/image";
import tractorPNG from "@/app/assets/tokens/tractor.png";
import CoinIcon from "@/app/components/ui/icons/CoinIcon";
import Button from "@/app/components/ui/Button";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Player({
  thisPlayer,
  handleBuy,
}: {
  thisPlayer: PlayerType;
  handleBuy: (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => void;
}) {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState } = useGameContext();

  const itsYourTurn = thisPlayer.id === gameState?.currentPlayer.id;

  const prevIsYourTurn = useRef(false);
  useEffect(() => {
    if (itsYourTurn && !prevIsYourTurn.current) {
      toast.success("🎉 It's your turn!"); // ✨ Replaced alert with toast
    }
    prevIsYourTurn.current = itsYourTurn;
  }, [itsYourTurn]);

  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { currentPlayer } = gameState;
  const handleShowMarket = async () => {
    try {
      await showMarketcardsAction(roomId);
    } catch (error) {
      console.error("Error showing market:", error);
    }
  };

  const handleAddCardsToHand = async (playerId: number) => {
    try {
      await addCardsToHandAction(roomId, playerId);
    } catch (error) {
      console.error("Error adding cards:", error);
    }
  };
  return (
    <div
      className="col-span-7 flex justify-center rounded-2xl border-2 border-secondary p-5"
      style={{
        borderColor: itsYourTurn ? "#FFB800" : "",
        borderWidth: itsYourTurn ? "5px" : "",
      }}
    >
      <div className="flex flex-col items-center justify-between">
        <div className="flex gap-1 text-xl text-secondary">
          Your Farm : {thisPlayer.money} <CoinIcon />
        </div>
        <div className="relative">
          <Image
            src={thisPlayer.fieldImage}
            alt={thisPlayer.playerName}
            width={172}
            height={242}
            className="mt-2"
          />
          {thisPlayer.tractor && (
            <div>
              <Image
                src={tractorPNG}
                alt="Tractor"
                className="absolute left-1/3 top-16"
                width={75}
                height={75}
              />
            </div>
          )}
        </div>

        {thisPlayer.id === currentPlayer.id && (
          <div className="w-36">
            {currentPlayer.turnStatus === "planting" && (
              <Button
                onClick={handleShowMarket}
                disabled={currentPlayer.turnStatus !== "planting"}
              >
                Start Marketting
              </Button>
            )}
            {currentPlayer.turnStatus === "marketing" && (
              <Button onClick={() => handleAddCardsToHand(thisPlayer.id)}>
                Add Cards To Hand
              </Button>
            )}
          </div>
        )}
        {thisPlayer.id !== currentPlayer.id && (
          <Button onClick={() => {}} disabled={true}>
            Wait ...
          </Button>
        )}
      </div>
      <Fields playerId={thisPlayer.id} handleBuy={handleBuy} />
    </div>
  );
}
