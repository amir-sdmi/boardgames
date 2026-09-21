"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Check,
  ChevronDown,
  Coins,
  Leaf,
  Sprout,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { GameType, PlayerType } from "@/types/gameTypes";
import { PRICES } from "@/config/constants";
import { findThePrice } from "../core/actions/harvest/findThePrice";
import { cardData } from "../utils/cardData";
import tractorArt from "@/app/assets/tokens/tractor.png";
import manureArt from "@/app/assets/tokens/manure.png";
import cardsArt from "@/app/assets/tokens/cards.png";
import type { BoardActions, BoardSnapshot, PlantSelection } from "./types";
import {
  canPlantHand,
  compatibleField,
  selectedCard,
  turnKey,
} from "./selectors";
import { useBoardAction } from "./useBoardAction";
import {
  BoardButton,
  CoinAmount,
  CropArt,
  SectionTitle,
  cropName,
} from "./BoardParts";
import { TradePanel } from "./TradePanel";
import s from "./board.module.css";

export type GameBoardProps = BoardSnapshot & {
  roomId: string;
  userId: string;
  actions: BoardActions;
  retry: () => void;
};
const statusCopy = {
  loading: [
    "Setting the table",
    "Loading the latest game. This should only take a moment.",
  ],
  syncing: [
    "Synchronizing the table",
    "This view is not yet confirmed by the server and may contain cached data. Moves are paused until synchronization is restored.",
  ],
  offline: [
    "You’re offline",
    "The last view may be out of date. Reconnect before making a move.",
  ],
  missing: [
    "This room is no longer available",
    "Check your invitation or return to the lobby to start a new game.",
  ],
  denied: [
    "We couldn’t open this game",
    "Your session or room permissions may have changed. Return to the lobby or try connecting again.",
  ],
  error: [
    "We couldn’t load the table",
    "The game may not be ready, or its connection failed. Try connecting again.",
  ],
  ready: ["Connected", "The board is up to date."],
};

/** Presentation depends only on snapshots and commands; no Firebase or auth imports. */
export function GameBoard({
  game,
  status,
  roomId,
  userId,
  actions,
  retry,
}: GameBoardProps) {
  const mutation = useBoardAction(status === "ready");
  const player = game?.players.find((p) => p.userId === userId);
  if (!game || !player) {
    const [title, description] =
      game && !player
        ? [
            "You’re not seated at this table",
            "Return to the lobby to join a game.",
          ]
        : statusCopy[status];
    return (
      <div className={s.board}>
        <Brand />
        <section className={s.emptyState} aria-live="polite">
          <Sprout size={44} aria-hidden="true" />
          <span className={s.eyebrow}>A place at the table</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className={s.row}>
            <BoardButton onClick={retry}>Try connecting again</BoardButton>
            <Link href="/lobby" className={s.textLink}>
              Back to lobby
            </Link>
          </div>
        </section>
      </div>
    );
  }
  return (
    <BoardSession
      key={`${roomId}:${turnKey(game)}`}
      game={game}
      player={player}
      status={status}
      roomId={roomId}
      actions={actions}
      retry={retry}
      mutation={mutation}
    />
  );
}
function Brand() {
  return (
    <div className={s.brandRow}>
      <Link
        href="/lobby"
        className={s.brand}
        aria-label="Jaliz — back to lobby"
      >
        <span className={s.brandMark}>
          <Sprout size={25} aria-hidden="true" />
        </span>
        <span>
          JALIZ<small>THE FARMING TABLE</small>
        </span>
      </Link>
      <Link href="/lobby" className={s.backLink}>
        <ArrowLeft size={14} aria-hidden="true" /> Lobby
      </Link>
    </div>
  );
}
function BoardSession({
  game,
  player,
  status,
  roomId,
  actions,
  retry,
  mutation,
}: {
  game: GameType;
  player: PlayerType;
  status: BoardSnapshot["status"];
  roomId: string;
  actions: BoardActions;
  retry: () => void;
  mutation: ReturnType<typeof useBoardAction>;
}) {
  const [selection, setSelection] = useState<PlantSelection | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [manureOpen, setManureOpen] = useState(false);
  const current = game.players.find((p) => p.id === game.currentPlayer.id);
  const yours = player.id === game.currentPlayer.id;
  const selected = selectedCard(game, player, selection);
  const busy = mutation.busy;
  const phase = game.currentPlayer.turnStatus;
  const canHand = canPlantHand(game, player);
  const phaseText =
    phase === "planting"
      ? "Plant"
      : phase === "marketing"
        ? "Market & trade"
        : "Draw cards";
  const canTrade = yours
    ? game.currentPlayer.marketingCards.length > 0
    : Boolean(game.currentPlayer.tradeProposal);
  const choose = (next: PlantSelection) =>
    setSelection(
      selection?.source === next.source &&
        selection.cardId === next.cardId &&
        selection.index === next.index
        ? null
        : next,
    );

  return (
    <div className={s.board} data-room={roomId}>
      <Brand />
      <header className={s.turnHeader}>
        <div>
          <div className={s.eyebrow}>
            <span className={s.liveDot} />
            {yours
              ? "YOUR TURN"
              : `${current?.playerName ?? "Another player"}’S TURN`}
          </div>
          <h1>
            {yours
              ? `Your turn to grow${player.playerName ? `, ${player.playerName}` : ""}.`
              : `${current?.playerName ?? "A player"} is tending their farm.`}
          </h1>
          <p>
            {yours
              ? phase === "planting"
                ? "Choose a crop and give it a place to grow."
                : "Plant your market cards, or find a good trade."
              : "Keep an eye on the market. There may be a trade for you."}
          </p>
        </div>
        <div className={s.headerStats}>
          <div className={s.stat}>
            <span>ROUND</span>
            <strong>{String(game.round).padStart(2, "0")}</strong>
          </div>
          <div className={s.stat}>
            <span>YOUR COINS</span>
            <strong>
              <Coins size={22} aria-hidden="true" />
              {player.money}
            </strong>
          </div>
        </div>
      </header>
      <div className={s.turnBar}>
        <div className={s.turnOverview}>
          <span className={s.turnIdentity}>
            {yours ? "Your turn" : `${current?.playerName}’s turn`} · Round{" "}
            {game.round} · {player.money} coins
          </span>
          <ol aria-label="Turn phases" className={s.phases}>
            {["Plant", "Market & trade", "Draw cards"].map((label, i) => (
              <li
                key={label}
                aria-current={label === phaseText ? "step" : undefined}
              >
                <span>{i + 1}</span>
                {label}
                {i < 2 && <ArrowRight size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
        {yours && (phase === "planting" || phase === "marketing") ? (
          <BoardButton
            disabled={busy}
            onClick={() =>
              mutation.run(
                phase === "planting"
                  ? "Open market"
                  : "Draw cards and pass turn",
                actions.advance,
              )
            }
          >
            {phase === "planting"
              ? "Open market"
              : `Draw ${game.endTurnReceivingCardsCount} cards & pass turn`}
            <ArrowRight size={16} aria-hidden="true" />
          </BoardButton>
        ) : (
          <span className={s.waitLabel}>
            Waiting for {current?.playerName ?? "the active player"}
          </span>
        )}
      </div>
      <div className={s.statusRow} aria-live="polite">
        <span className={s.connection}>
          {status === "ready" ? (
            <Wifi size={14} aria-hidden="true" />
          ) : (
            <WifiOff size={14} aria-hidden="true" />
          )}
          {status === "ready"
            ? "Table synchronized"
            : status === "offline"
              ? "Offline · moves paused"
              : "Syncing · moves paused"}
        </span>
        <span>
          {mutation.pending
            ? `${mutation.pending}…`
            : "Take your time. Every crop has its season."}
        </span>
      </div>
      {status !== "ready" && (
        <div role="status" className={s.notice}>
          {statusCopy[status][1]} <button onClick={retry}>Reconnect</button>
        </div>
      )}
      {mutation.feedback && (
        <div
          role={mutation.feedback.kind === "error" ? "alert" : "status"}
          className={mutation.feedback.kind === "error" ? s.error : s.notice}
        >
          {mutation.feedback.text}
        </div>
      )}
      {game.gameStatus === "finished" && (
        <div className={s.notice}>
          The game is marked finished. Final scoring is not available yet.
        </div>
      )}
      <div className={s.boardGrid}>
        <div className={s.mainColumn}>
          <section className={s.panel} aria-label="Your farm">
            <SectionTitle
              eyebrow="01 / A little room to grow"
              title="Your fields"
            >
              <span className={s.pill}>
                <Leaf size={14} aria-hidden="true" />
                {player.fields.length} fields
                {player.tractor ? " · Tractor owned" : ""}
              </span>
            </SectionTitle>
            <div className={s.selectionBar} aria-live="polite">
              {selection ? (
                <>
                  <span>
                    {selected ? (
                      <>
                        Planting{" "}
                        <strong className={s.cropName}>
                          {cropName(selection.cardId)}
                        </strong>{" "}
                        · {selected.quantity} available ·{" "}
                        {selection.source === "trade"
                          ? "received in trade"
                          : selection.source}
                      </>
                    ) : (
                      "Your selection changed or is no longer available. Select a card again."
                    )}
                  </span>
                  <BoardButton tone="quiet" onClick={() => setSelection(null)}>
                    Cancel selection
                  </BoardButton>
                </>
              ) : (
                <span>
                  <Sprout size={16} aria-hidden="true" /> Select a card below,
                  then choose a field.
                </span>
              )}
            </div>
            <div className={s.fields}>
              {player.fields.map((field, index) => {
                const match =
                  selected &&
                  selection &&
                  compatibleField(field, selection.cardId);
                return (
                  <article
                    key={field.id}
                    className={`${s.field} ${match ? s.compatible : ""}`}
                    aria-label={`Field ${index + 1}`}
                  >
                    <div className={s.fieldTop}>
                      <span>FIELD {index + 1}</span>
                      {field.manure && (
                        <span className={s.manureBadge}>+ Manure</span>
                      )}
                    </div>
                    <div className={s.fieldArt}>
                      {field.crops ? (
                        <>
                          <CropArt id={field.crops.id} />
                          <span className={s.cropCount}>
                            ×{field.crops.quantity}
                          </span>
                        </>
                      ) : (
                        <Sprout size={40} strokeWidth={1} aria-hidden="true" />
                      )}
                    </div>
                    <h3 className={s.cropName}>
                      {field.crops ? cropName(field.crops.id) : "Fresh soil"}
                    </h3>
                    <p className={s.fieldHint}>
                      {field.crops
                        ? `${field.crops.quantity} crops growing`
                        : "A new crop starts here"}
                    </p>
                    <div className={s.fieldActions}>
                      {selection && (
                        <>
                          <BoardButton
                            disabled={busy || !match}
                            onClick={() =>
                              mutation.run(
                                `Plant ${cropName(selection.cardId)}`,
                                () => actions.plant(selection, index),
                                () => setSelection(null),
                              )
                            }
                          >
                            {!selected
                              ? "Select again"
                              : match
                                ? `Plant here · field ${index + 1}`
                                : "Different crop"}
                          </BoardButton>
                        </>
                      )}
                      <BoardButton
                        tone="quiet"
                        disabled={busy || !field.crops}
                        onClick={() =>
                          mutation.run(`Harvest field ${index + 1}`, () =>
                            actions.harvest(index),
                          )
                        }
                      >
                        Harvest{" "}
                        <CoinAmount
                          amount={
                            field.crops
                              ? findThePrice(field.crops, field.manure)
                              : 0
                          }
                        />
                      </BoardButton>
                    </div>
                  </article>
                );
              })}
              {player.fields.length < 3 && (
                <div className={s.newField}>
                  <span className={s.newFieldIcon}>+</span>
                  <h3>Room to grow</h3>
                  <p>Expand your farm with a third field.</p>
                  <BoardButton
                    tone="quiet"
                    disabled={busy}
                    onClick={() =>
                      mutation.run("Buy field", () => actions.buy("field"))
                    }
                  >
                    Add field <CoinAmount amount={PRICES.field} />
                  </BoardButton>
                </div>
              )}
            </div>
          </section>
          <section className={s.panel} aria-label="Your hand">
            <SectionTitle eyebrow="02 / What will you grow?" title="Your hand">
              <span className={s.pill}>
                {player.hand.reduce((total, c) => total + c.quantity, 0)} cards
              </span>
            </SectionTitle>
            <p className={s.helper}>
              {canHand
                ? `Choose a crop to plant. ${game.currentPlayer.plantCounts} planted this turn.`
                : yours
                  ? phase === "planting"
                    ? "Your planting allowance is used. Open the market when you’re ready."
                    : "Your hand is available for trading. Hand planting is not available in this phase."
                  : "Hand planting is available on your planting turn."}
            </p>
            <div className={s.hand}>
              {player.hand.map((card) => {
                const info = cardData.find((c) => c.id === card.id);
                return (
                  <button
                    type="button"
                    key={card.id}
                    className={s.handCard}
                    disabled={busy || !canHand}
                    aria-pressed={
                      selection?.source === "hand" &&
                      selection.cardId === card.id
                    }
                    aria-label={`Select ${cropName(card.id)} from hand, ${card.quantity} available`}
                    onClick={() => choose({ source: "hand", cardId: card.id })}
                  >
                    <span className={s.handQuantity}>×{card.quantity}</span>
                    <CropArt id={card.id} />
                    <strong className={s.cropName}>{cropName(card.id)}</strong>
                    <span
                      className={s.harvestScale}
                      aria-label="Harvest thresholds"
                    >
                      {info?.value.map(
                        (threshold, i) =>
                          threshold !== null && (
                            <span key={i}>
                              {threshold}
                              <small>{i + 1}c</small>
                            </span>
                          ),
                      )}
                    </span>
                  </button>
                );
              })}
              {!player.hand.length && (
                <p className={s.muted}>Your hand is empty.</p>
              )}
            </div>
            <p className={s.legend}>
              Card guide: crop quantity above, harvest coins below.
            </p>
          </section>
          {Boolean(player.acceptedTrade?.length) && (
            <section
              className={`${s.panel} ${s.received}`}
              aria-label="Received in trade"
            >
              <SectionTitle
                eyebrow="Delivered to your farm"
                title="Received in trade"
              />
              <p className={s.helper}>
                Select a received crop and plant it in a compatible field.
              </p>
              <div className={s.receivedCards}>
                {player.acceptedTrade!.map((card) => (
                  <button
                    type="button"
                    key={card.id}
                    className={s.marketChoice}
                    aria-pressed={
                      selection?.source === "trade" &&
                      selection.cardId === card.id
                    }
                    disabled={busy}
                    onClick={() => choose({ source: "trade", cardId: card.id })}
                    aria-label={`Plant received ${cropName(card.id)}`}
                  >
                    <CropArt id={card.id} small />
                    <span className={s.cropName}>{cropName(card.id)}</span>
                    <strong>×{card.quantity}</strong>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className={s.sideColumn} aria-label="Market and purchases">
          <section
            className={`${s.panel} ${s.marketPanel}`}
            aria-label="Market"
          >
            <SectionTitle eyebrow="03 / Better together" title="The market">
              <span className={s.marketCount}>
                {game.currentPlayer.marketingCards.length} cards
              </span>
            </SectionTitle>
            {game.currentPlayer.marketingCards.length ? (
              <div className={s.marketCards}>
                {game.currentPlayer.marketingCards.map((card, index) => (
                  <button
                    type="button"
                    key={index}
                    className={s.marketCard}
                    disabled={busy || !yours}
                    aria-pressed={
                      selection?.source === "market" &&
                      selection.index === index
                    }
                    onClick={() =>
                      choose({ source: "market", cardId: card.id, index })
                    }
                    aria-label={`Select market ${cropName(card.id)} ${index + 1}`}
                  >
                    <CropArt id={card.id} />
                    <strong className={s.cropName}>{cropName(card.id)}</strong>
                    <span>
                      {yours ? "Select to plant" : "Available to trade"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={s.marketEmpty}>
                <Leaf size={30} strokeWidth={1} aria-hidden="true" />
                <p>The market is still quiet.</p>
                <small>
                  {yours
                    ? "Open the market when you’re ready."
                    : "Market cards appear during the active player’s turn."}
                </small>
              </div>
            )}
            <BoardButton
              disabled={!canTrade}
              tone={canTrade ? "primary" : "quiet"}
              onClick={() => setTradeOpen(true)}
            >
              <ArrowLeftRight size={16} aria-hidden="true" />
              {!yours && game.currentPlayer.tradeProposal
                ? "View incoming offer"
                : "Trade with the table"}
            </BoardButton>
            <p className={s.hint}>
              {yours
                ? "Plant directly, or offer market cards in a trade."
                : "Offers appear here when the active player proposes a trade."}
            </p>
            <div className={s.deckMeta}>
              <span>
                Draw pile <strong>{game.deck.length}</strong>
              </span>
              <span>
                Discard{" "}
                <strong>
                  {game.discardPile.reduce((sum, c) => sum + c.quantity, 0)}
                </strong>
              </span>
            </div>
          </section>
          <section className={s.panel} aria-label="Farm shop">
            <SectionTitle eyebrow="Small investments" title="Farm shop" />
            <div className={s.shopItem}>
              <Image src={tractorArt} alt="" width={42} height={42} />
              <div>
                <h3>Tractor</h3>
                <p>
                  {player.tractor
                    ? `${PRICES.tractor} coins · Already on your farm`
                    : `${PRICES.tractor} coins · ${game.availableTractors} at the table`}
                </p>
              </div>
              <BoardButton
                tone="quiet"
                disabled={busy || player.tractor}
                aria-label="Buy tractor"
                onClick={() =>
                  mutation.run("Buy tractor", () => actions.buy("tractor"))
                }
              >
                {player.tractor ? (
                  <Check size={16} aria-label="Owned" />
                ) : (
                  <CoinAmount amount={PRICES.tractor} />
                )}
              </BoardButton>
            </div>
            <div className={s.shopItem}>
              <Image src={cardsArt} alt="" width={42} height={42} />
              <div>
                <h3>Three cards</h3>
                <p>
                  {player.hasBoughtCards
                    ? `${PRICES.cards} coin · Already purchased`
                    : `${PRICES.cards} coin · ${game.deck.length} cards in draw pile`}
                </p>
              </div>
              <BoardButton
                tone="quiet"
                disabled={busy || player.hasBoughtCards}
                aria-label="Buy three cards"
                onClick={() =>
                  mutation.run("Buy cards", () => actions.buy("cards"))
                }
              >
                {player.hasBoughtCards ? (
                  <Check size={16} aria-label="Purchased" />
                ) : (
                  <CoinAmount amount={PRICES.cards} />
                )}
              </BoardButton>
            </div>
            <div className={s.shopItem}>
              <Image src={manureArt} alt="" width={42} height={42} />
              <div>
                <h3>Manure</h3>
                <p>
                  {PRICES.manure} coins · {game.availableManures} at the table
                </p>
              </div>
              <BoardButton
                tone="quiet"
                aria-expanded={manureOpen}
                aria-label="Choose field for manure"
                onClick={() => setManureOpen(!manureOpen)}
              >
                <ChevronDown size={16} />
              </BoardButton>
            </div>
            {manureOpen && (
              <div className={s.manureOptions}>
                {player.fields
                  .filter((_, i) => i < 2 || player.thirdField)
                  .map((field, index) => (
                    <div key={field.id}>
                      <BoardButton
                        tone="quiet"
                        disabled={
                          busy || field.manure || player.money < PRICES.manure
                        }
                        onClick={() =>
                          mutation.run(
                            `Buy manure for field ${index + 1}`,
                            () => actions.buy("manure", index),
                          )
                        }
                      >
                        Field {index + 1} <CoinAmount amount={PRICES.manure} />
                      </BoardButton>
                      <small>
                        {field.manure
                          ? "Already fertilized"
                          : player.money < PRICES.manure
                            ? "Not enough coins"
                            : "Ready to fertilize"}
                      </small>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </aside>
      </div>
      <section className={s.opponents} aria-label="Other farms">
        <SectionTitle eyebrow="Around the table" title="Your fellow farmers">
          <span className={s.pill}>
            <Users size={14} aria-hidden="true" />
            {game.players.length} players
          </span>
        </SectionTitle>
        <div className={s.opponentGrid}>
          {game.players
            .filter((p) => p.id !== player.id)
            .map((other) => (
              <details key={other.id} className={s.opponent}>
                <summary>
                  <span
                    className={s.avatar}
                    style={{ backgroundColor: other.color }}
                  >
                    {other.playerName.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <strong>{other.playerName}</strong>
                    <small>
                      {other.id === game.currentPlayer.id
                        ? "Taking their turn"
                        : `${other.fields.length} fields${other.tractor ? " · Tractor" : ""}`}
                    </small>
                  </span>
                  <CoinAmount amount={other.money} />
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <div className={s.publicFields}>
                  {other.fields.map((field) => (
                    <div key={field.id}>
                      {field.crops ? (
                        <CropArt id={field.crops.id} small />
                      ) : (
                        <Sprout size={20} aria-hidden="true" />
                      )}
                      <span>
                        Field {field.id + 1}:{" "}
                        {field.crops
                          ? `${field.crops.quantity} ${cropName(field.crops.id)}`
                          : "empty"}
                        {field.manure ? " · manure" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
        </div>
      </section>
      <footer className={s.boardFooter}>
        <Sprout size={14} aria-hidden="true" /> Grow a little. Trade a little.
        Enjoy the company.<span>JALIZ / ROUND {game.round}</span>
      </footer>
      <TradePanel
        game={game}
        player={player}
        actions={actions}
        mutation={mutation}
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
      />
    </div>
  );
}
