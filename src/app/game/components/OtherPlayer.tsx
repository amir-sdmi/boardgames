import NumberBadge from "@/app/components/ui/NumberBadge";
import { PlayerType } from "@/types/gameTypes";
import Image from "next/image";
import CropsCard from "./ui/cards/CropsCard";
import emptyField from "@/app/assets/fields/emptyField.png";
import manurePNG from "@/app/assets/tokens/manure.png";
import tractorPNG from "@/app/assets/tokens/tractor.png";
import { useGameContext } from "@/contexts/GameContext";

export default function OtherPlayer({ player }: { player: PlayerType }) {
  const { gameState } = useGameContext();
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  const { currentPlayer } = gameState;
  return (
    <div
      className="col-span-1 flex flex-col gap-2 rounded-2xl border-2 border-secondary p-5"
      style={{
        borderColor: player.id === currentPlayer.id ? "#FFB800" : "",
        borderWidth: player.id === currentPlayer.id ? "5px" : "",
      }}
    >
      <h3 className="text-secondary">{player.playerName} </h3>
      <div className="flex">
        <div className="relative">
          <Image
            src={player.fieldImage}
            alt="Green Player"
            width={172}
            height={242}
            className="mt-4"
          />
          {player.tractor && (
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
          <div className="mt-4"></div>
        </div>
        {player.fields.map((field) => (
          <div key={field.id} className="relative">
            <Image
              src={emptyField}
              alt="Empty Field"
              className="-z-10"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
            {field.manure && (
              <Image
                src={manurePNG}
                alt="Manure"
                className="absolute left-1/3 top-0"
              />
            )}
            <div className="absolute left-6 top-16 h-10 w-10">
              {field.crops && (
                <div>
                  <CropsCard cardId={field.crops.id} />
                </div>
              )}
            </div>
            {field.crops && (
              <div className="absolute right-4 top-16">
                <NumberBadge>{field.crops?.quantity}</NumberBadge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
