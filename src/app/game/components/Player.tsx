import { useGameContext } from "@/contexts/GameContext";
import { BuyType, PlayerType } from "@/types/gameTypes";
import Fields from "./Field/Fields";
import { useParams } from "next/navigation";
import Image from "next/image";
import greenPlayer from "@/app/assets/fields/greenPlayer.png";
import CoinIcon from "@/app/components/ui/icons/CoinIcon";
import Button from "@/app/components/ui/Button";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";
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
    <>
      <div className="flex items-stretch justify-center">
        <div className="flex flex-col items-center justify-between">
          <div className="flex text-black">
            Your Farm : {thisPlayer.money} <CoinIcon />
          </div>
          <Image
            src={greenPlayer}
            alt="Green Player"
            width={172}
            height={242}
            className="mt-4"
          />
          <>
            {thisPlayer.id === currentPlayer.id && (
              <div className="border border-green-400">
                <Button
                  onClick={handleShowMarket}
                  disabled={currentPlayer.turnStatus !== "planting"}
                >
                  Start Marketting
                </Button>
                <Button
                  onClick={() => handleAddCardsToHand(thisPlayer.id)}
                  // disabled={
                  //   //TODO : this is not totally correct, later should change it
                  //   (currentPlayer.marketingCards.length !== 0 &&
                  //     currentPlayer.turnStatus === "marketing") ||
                  //   currentPlayer.turnStatus === "planting"
                  // }
                >
                  Add Cards To Hand
                </Button>
              </div>
            )}
          </>
        </div>
        <Fields
          roomId={roomId}
          playerId={thisPlayer.id}
          handleBuy={handleBuy}
        />
      </div>
    </>
  );
}
