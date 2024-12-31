"use client";

import Button from "@/app/components/ui/Button";
import { CardsType, CurrentPlayerType, PlayerType } from "@/types/gameTypes";
import { cardName } from "../utils/cardsUtils";
import { plantFromHandAction } from "@/app/game/core/actions/plantFromHand/plantFromHandAction";
import { showMarketcardsAction } from "../core/actions/market/showMarketcardsAction";
import { addCardsToHandAction } from "../core/actions/addCardsToHandAction";
import { plantFromTradeAction } from "../core/actions/plantFromTrade/plantFromTradeAction";
import CardInHand from "./Hand/CardInHand";
import { useState } from "react";

export default function PlayerDetails({
  player,
  roomId,
  currentPlayer,
}: {
  player: PlayerType;
  roomId: string;
  currentPlayer: CurrentPlayerType;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  const canPlant =
    player.id === currentPlayer.id &&
    currentPlayer.turnStatus === "planting" &&
    (currentPlayer.plantCounts < 2 ||
      (currentPlayer.plantCounts < 3 && player.tractor));

  const handlePlantFromHand = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromHandAction(roomId, player.id, fieldIndex, card.id);
      if (player.fields[fieldIndex].crops?.quantity === 0) {
        setOpenId(null);
      }
    } catch (error) {
      console.error("Error planting from hand:", error);
    }
  };

  const handlePlantFromTrade = async (fieldIndex: number, card: CardsType) => {
    try {
      await plantFromTradeAction(roomId, player.id, fieldIndex, card.id);
    } catch (error) {
      console.error("Error planting from trade:", error);
    }
  };

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
      <div className="border border-red-400">
        {player.id === currentPlayer.id && (
          <div className="border border-green-400">
            <Button
              onClick={handleShowMarket}
              disabled={currentPlayer.turnStatus !== "planting"}
            >
              Start Marketting
            </Button>
            <Button
              onClick={() => handleAddCardsToHand(player.id)}
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
        <h1>Player Details</h1>
        <p>id: {player.id}</p>
        <p>name: {player.playerName}</p>
        <p>tractor: {player.tractor ? "yes" : "no"}</p>
        <p>money: {player.money}</p>
        <ul className="border border-blue-500">
          {player.hand.map((card, handIndex) => (
            <li key={handIndex}>
              <CardInHand
                fields={player.fields}
                canPlant={canPlant}
                card={card}
                openId={openId}
                setOpenId={setOpenId}
                hasThirdField={player.thirdField}
                handlePlantFromHand={handlePlantFromHand}
              />
            </li>
          ))}
        </ul>
        <ul className="border border-yellow-500">
          {player.acceptedTrade?.map((card) => (
            <li key={card.id}>
              {cardName(card.id)} x {card.quantity}
              <div>
                <Button onClick={() => handlePlantFromTrade(0, card)}>
                  F1
                </Button>
                <Button onClick={() => handlePlantFromTrade(1, card)}>
                  F2
                </Button>
                {player.fields.length > 2 && (
                  <Button onClick={() => handlePlantFromTrade(2, card)}>
                    F3
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
