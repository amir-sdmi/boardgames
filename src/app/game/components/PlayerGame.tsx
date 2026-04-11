import { useGameContext } from "@/contexts/GameContext";
import Player from "./Player";
import { BuyType, PlayerType } from "@/types/gameTypes";
import { buyAction } from "../core/actions/buy/buyAction";
import { useParams } from "next/navigation";
import Deck from "./Deck/Deck";
import Hand from "./Hand/Hand";
import { useEffect, useState } from "react";
import Deals from "./tradingCards/Deals";

import Acceptor from "./tradingCards/Acceptor";
import TradingOffer from "./tradingCards/TradingOffer";
import { emptyTradeOffer } from "../utils/tradeUtils";
import {
  dealerTradeOfferAction,
  tradeOfferAction,
} from "../core/actions/market/tradeOfferAction";
import OtherPlayers from "./OtherPlayers";
import GameFinishedOverlay from "./GameFinishedOverlay";
import AcceptedTradePlant from "./Hand/AcceptedTradePlant";

export default function PlayerGame({ userId }: { userId: string }) {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [tradeOffer, setTradeOffer] = useState(emptyTradeOffer);
  const [trader, setTrader] = useState<PlayerType | null>(null);

  const { roomId } = useParams<{ roomId: string }>();
  const { gameState } = useGameContext();

  const thisPlayer = gameState?.players.find(
    (player) => player.userId === userId,
  );
  useEffect(() => {
    if (thisPlayer) {
      setTrader(thisPlayer);
    }
  }, [thisPlayer]);
  if (!gameState) {
    return <div>Loading game state ...</div>;
  }
  if (!thisPlayer) {
    return <div> Player not found in game</div>;
  }

  if (gameState.gameStatus === "finished") {
    return <GameFinishedOverlay gameState={gameState} currentUserId={userId} />;
  }

  const { currentPlayer } = gameState;

  const thisPlayerIsCurrentPlayer: boolean = thisPlayer.id === currentPlayer.id;
  const istradeProposal = currentPlayer.tradeProposal?.proposerTradeOffer;
  const pendingTrade =
    thisPlayer.acceptedTrade !== null && thisPlayer.acceptedTrade.length > 0;

  const handOrAccepted = pendingTrade ? (
    <AcceptedTradePlant
      player={thisPlayer}
      roomId={roomId}
      acceptedTrade={thisPlayer.acceptedTrade!}
    />
  ) : (
    <Hand
      player={thisPlayer}
      roomId={roomId}
      currentPlayer={currentPlayer}
    />
  );

  const handleBuy = async (
    player: PlayerType,
    type: BuyType,
    price: number,
    fieldId?: number,
  ) => {
    try {
      await buyAction(roomId, player.id, type, price, fieldId);
    } catch (error) {
      console.error("Error buying:", error);
    }
  };
  const handleDealerTradeOffer = async () => {
    try {
      await dealerTradeOfferAction(roomId, tradeOffer, thisPlayer.id);
      setTradeOffer(emptyTradeOffer);
      setTrader(thisPlayer);
      setIsChangeOpen(false);
    } catch (error) {
      console.error("Error creating trade offer", error);
    }
  };
  const handleProposeTrade = async () => {
    try {
      await tradeOfferAction(roomId, tradeOffer);
      setTradeOffer(emptyTradeOffer);
      setTrader(thisPlayer);
    } catch (error) {
      console.error("Error creating trade offer", error);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2">
      {thisPlayerIsCurrentPlayer && isTradeOpen && (
        <>
          <Deals thisPlayer={thisPlayer} />
          <TradingOffer
            marketCards={currentPlayer.marketingCards}
            playerHand={thisPlayer.hand}
            trader={trader!}
            setTrader={setTrader}
            setTradeOffer={setTradeOffer}
            tradeOffer={tradeOffer}
            handleProposeTrade={handleProposeTrade}
          />
        </>
      )}

      {thisPlayerIsCurrentPlayer && !isTradeOpen && (
        <>
          <Deck
            thisPlayer={thisPlayer}
            handleBuy={handleBuy}
            setIsTradeOpen={setIsTradeOpen}
          />
          {handOrAccepted}
        </>
      )}
      {!thisPlayerIsCurrentPlayer && !istradeProposal && (
        <>
          <Deck
            thisPlayer={thisPlayer}
            handleBuy={handleBuy}
            setIsTradeOpen={setIsTradeOpen}
          />
          {handOrAccepted}
        </>
      )}
      {!thisPlayerIsCurrentPlayer && istradeProposal && isChangeOpen && (
        <>
          <Acceptor
            currentPlayer={currentPlayer}
            thisPlayer={thisPlayer}
            setIsChangeOpen={setIsChangeOpen}
          />
          <TradingOffer
            marketCards={currentPlayer.marketingCards}
            playerHand={thisPlayer.hand}
            trader={trader!}
            setTrader={setTrader}
            setTradeOffer={setTradeOffer}
            tradeOffer={tradeOffer}
            handleProposeTrade={handleDealerTradeOffer}
          />
        </>
      )}
      {!thisPlayerIsCurrentPlayer && istradeProposal && !isChangeOpen && (
        <>
          <Acceptor
            currentPlayer={currentPlayer}
            thisPlayer={thisPlayer}
            setIsChangeOpen={setIsChangeOpen}
          />
          {handOrAccepted}
        </>
      )}

      <Player thisPlayer={thisPlayer} handleBuy={handleBuy} />
      <OtherPlayers thisPlayerId={thisPlayer.id} />
    </div>
  );
}
