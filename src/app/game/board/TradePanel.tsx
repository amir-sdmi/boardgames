"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Minus, Plus, X } from "lucide-react";
import type { GameType, PlayerType, TradeOfferType } from "@/types/gameTypes";
import type { BoardActions } from "./types";
import type { useBoardAction } from "./useBoardAction";
import { cardData } from "../utils/cardData";
import { playerHasAllTheRequestedCards } from "../utils/tradeUtils";
import { draftIssue, freshOffer, setQuantity } from "./selectors";
import { BoardButton, CardList, CropArt, cropName } from "./BoardParts";
import s from "./board.module.css";

type Mutation = ReturnType<typeof useBoardAction>;
export function TradePanel({
  game,
  player,
  actions,
  mutation,
  open,
  onClose,
}: {
  game: GameType;
  player: PlayerType;
  actions: BoardActions;
  mutation: Mutation;
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offer, setOffer] = useState<TradeOfferType>(freshOffer);
  const [marketAtSelection, setMarketAtSelection] = useState("");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const isCurrent = player.id === game.currentPlayer.id;
  const proposal = game.currentPlayer.tradeProposal;
  const issue = draftIssue(
    offer,
    player.hand,
    game.currentPlayer.marketingCards,
    marketAtSelection,
  );
  const counterUnavailable = !isCurrent && !proposal;
  const busy = mutation.busy;
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (!open) {
      node.close();
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  function reset() {
    setOffer(freshOffer());
    setMarketAtSelection("");
    setMessage("Draft cleared.");
  }
  function toggleMarket(index: number) {
    const selected = offer.marketCards.some((c) => c.index === index);
    if (!selected && !offer.marketCards.length)
      setMarketAtSelection(JSON.stringify(game.currentPlayer.marketingCards));
    setOffer({
      ...offer,
      marketCards: selected
        ? offer.marketCards.filter((c) => c.index !== index)
        : [
            ...offer.marketCards,
            { ...game.currentPlayer.marketingCards[index], quantity: 1, index },
          ],
    });
    setMessage("");
  }
  const incoming = proposal?.proposerTradeOffer;
  return (
    <dialog
      ref={dialog}
      className={s.tradeDialog}
      aria-labelledby="trade-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), select:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={s.tradeHeader}>
        <div>
          <span className={s.eyebrow}>A fair exchange</span>
          <h2 id="trade-title">
            <ArrowLeftRight size={22} aria-hidden="true" />
            Trade with the table
          </h2>
        </div>
        <BoardButton tone="quiet" aria-label="Close trading" onClick={onClose}>
          <X size={20} />
        </BoardButton>
      </div>
      <div className={s.tradeBody}>
        {busy && !mutation.pending && (
          <p role="status" className={s.notice}>
            The connection is not confirmed. Moves are paused until the board
            synchronizes.
          </p>
        )}
        {mutation.pending && (
          <p role="status" className={s.notice}>
            {mutation.pending}…
          </p>
        )}
        {mutation.feedback && (
          <p
            role={mutation.feedback.kind === "error" ? "alert" : "status"}
            className={mutation.feedback.kind === "error" ? s.error : s.notice}
          >
            {mutation.feedback.text}
          </p>
        )}
        {!isCurrent && incoming && (
          <section aria-label="Incoming offer">
            <span className={s.eyebrow}>
              {
                game.players.find((p) => p.id === game.currentPlayer.id)
                  ?.playerName
              }
              &apos;s offer
            </span>
            <div className={s.tradeSummary}>
              <div>
                <h3>You give</h3>
                <CardList cards={incoming.receive.expectedCards} />
              </div>
              <div>
                <h3>You receive</h3>
                <CardList
                  cards={[...incoming.give.handCards, ...incoming.marketCards]}
                  empty="No cards"
                />
              </div>
            </div>
            <div className={s.row}>
              <BoardButton
                disabled={
                  busy ||
                  !playerHasAllTheRequestedCards(
                    player.hand,
                    incoming.receive.expectedCards,
                  )
                }
                onClick={() =>
                  mutation.run(
                    "Accept offer",
                    () => actions.respond(true),
                    reset,
                  )
                }
              >
                Accept offer
              </BoardButton>
              <BoardButton
                tone="quiet"
                disabled={busy}
                onClick={() =>
                  mutation.run(
                    "Decline offer",
                    () => actions.respond(false),
                    reset,
                  )
                }
              >
                Decline
              </BoardButton>
            </div>
            {!playerHasAllTheRequestedCards(
              player.hand,
              incoming.receive.expectedCards,
            ) && (
              <p className={s.hint}>You don’t have all the requested cards.</p>
            )}
            <BoardButton tone="quiet" onClick={() => setEditing(!editing)}>
              {editing ? "Hide counteroffer" : "Make a counteroffer"}
            </BoardButton>
            {proposal.playersDeals.find((d) => d.playerId === player.id)
              ?.accepted === true && (
              <p className={s.hint}>
                You accepted. Waiting for the active player to confirm the
                exchange.
              </p>
            )}
            {proposal.playersDeals.find((d) => d.playerId === player.id)
              ?.accepted === false && (
              <p className={s.hint}>You declined this offer.</p>
            )}
            {proposal.playersDeals.find((d) => d.playerId === player.id)
              ?.newTradeOffer && (
              <p className={s.hint}>Your counteroffer has been sent.</p>
            )}
          </section>
        )}
        {counterUnavailable && (
          <p className={s.notice}>
            The offer is no longer available. Your draft is kept until you clear
            it or the turn changes.
          </p>
        )}
        {(isCurrent || editing) && (
          <section aria-label="Trade composer">
            <h3>{isCurrent ? "Build your offer" : "Your counteroffer"}</h3>
            <p className={s.muted}>
              Choose market cards, then balance what you give and receive.
            </p>
            <h4>
              From the market{" "}
              <span className={s.muted}>
                · {isCurrent ? "you give" : "you receive"}
              </span>
            </h4>
            <div className={s.marketPicker}>
              {game.currentPlayer.marketingCards.map((card, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={offer.marketCards.some(
                    (c) => c.index === index,
                  )}
                  className={s.marketChoice}
                  onClick={() => toggleMarket(index)}
                  disabled={busy || Boolean(issue && offer.marketCards.length)}
                  aria-label={`Include market ${cropName(card.id)} ${index + 1}`}
                >
                  <CropArt id={card.id} small />
                  <span className={s.cropName}>{cropName(card.id)}</span>
                  <span>
                    {offer.marketCards.some((c) => c.index === index)
                      ? "Selected"
                      : "+ Add"}
                  </span>
                </button>
              ))}
            </div>
            <h4>You give · from your hand</h4>
            <div>
              {player.hand.map((card) => {
                const quantity =
                  offer.give.handCards.find((c) => c.id === card.id)
                    ?.quantity ?? 0;
                return (
                  <div key={card.id} className={s.quantityRow}>
                    <CropArt id={card.id} small />
                    <span>
                      <strong className={s.cropName}>
                        {cropName(card.id)}
                      </strong>
                      <small>{card.quantity} in hand</small>
                    </span>
                    <BoardButton
                      tone="quiet"
                      aria-label={`Give fewer ${cropName(card.id)}`}
                      disabled={busy || !quantity}
                      onClick={() =>
                        setOffer({
                          ...offer,
                          give: {
                            ...offer.give,
                            handCards: setQuantity(
                              offer.give.handCards,
                              card.id,
                              quantity - 1,
                            ),
                          },
                        })
                      }
                    >
                      <Minus size={14} />
                    </BoardButton>
                    <output aria-label={`${cropName(card.id)} to give`}>
                      {quantity}
                    </output>
                    <BoardButton
                      tone="quiet"
                      aria-label={`Give more ${cropName(card.id)}`}
                      disabled={busy || quantity >= card.quantity}
                      onClick={() =>
                        setOffer({
                          ...offer,
                          give: {
                            ...offer.give,
                            handCards: setQuantity(
                              offer.give.handCards,
                              card.id,
                              quantity + 1,
                            ),
                          },
                        })
                      }
                    >
                      <Plus size={14} />
                    </BoardButton>
                  </div>
                );
              })}
            </div>
            <h4>You receive · request cards</h4>
            <div className={s.requestPicker}>
              <label htmlFor="request-crop" className={s.srOnly}>
                Crop to request
              </label>
              <select
                id="request-crop"
                disabled={busy}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value === "") return;
                  const id = Number(e.target.value);
                  const quantity =
                    offer.receive.expectedCards.find((c) => c.id === id)
                      ?.quantity ?? 0;
                  setOffer({
                    ...offer,
                    receive: {
                      ...offer.receive,
                      expectedCards: setQuantity(
                        offer.receive.expectedCards,
                        id,
                        quantity + 1,
                      ),
                    },
                  });
                  e.target.value = "";
                }}
              >
                <option value="">Add a crop to request…</option>
                {cardData.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {offer.receive.expectedCards.map((card) => (
              <div className={s.quantityRow} key={card.id}>
                <CropArt id={card.id} small />
                <strong className={s.cropName}>{cropName(card.id)}</strong>
                <BoardButton
                  tone="quiet"
                  aria-label={`Request fewer ${cropName(card.id)}`}
                  disabled={busy}
                  onClick={() =>
                    setOffer({
                      ...offer,
                      receive: {
                        ...offer.receive,
                        expectedCards: setQuantity(
                          offer.receive.expectedCards,
                          card.id,
                          card.quantity - 1,
                        ),
                      },
                    })
                  }
                >
                  <Minus size={14} />
                </BoardButton>
                <output>{card.quantity}</output>
                <BoardButton
                  tone="quiet"
                  aria-label={`Request more ${cropName(card.id)}`}
                  disabled={busy}
                  onClick={() =>
                    setOffer({
                      ...offer,
                      receive: {
                        ...offer.receive,
                        expectedCards: setQuantity(
                          offer.receive.expectedCards,
                          card.id,
                          card.quantity + 1,
                        ),
                      },
                    })
                  }
                >
                  <Plus size={14} />
                </BoardButton>
              </div>
            ))}
            <div className={s.tradeSummary} aria-label="Your offer summary">
              <div>
                <h4>You give</h4>
                <CardList
                  cards={[
                    ...offer.give.handCards,
                    ...(isCurrent ? offer.marketCards : []),
                  ]}
                  empty="No cards"
                />
              </div>
              <div>
                <h4>You receive</h4>
                <CardList
                  cards={[
                    ...offer.receive.expectedCards,
                    ...(!isCurrent ? offer.marketCards : []),
                  ]}
                />
              </div>
            </div>
            {issue && (
              <p role="alert" className={s.error}>
                {issue}
              </p>
            )}
            {message && (
              <p role="status" className={s.hint}>
                {message}
              </p>
            )}
            {!offer.marketCards.length && (
              <p className={s.hint}>
                Select at least one market card to propose a trade.
              </p>
            )}
            <div className={s.row}>
              <BoardButton
                disabled={
                  busy ||
                  !offer.marketCards.length ||
                  Boolean(issue) ||
                  counterUnavailable
                }
                onClick={() =>
                  mutation.run(
                    isCurrent ? "Send offer" : "Send counteroffer",
                    () => actions.propose(offer, !isCurrent),
                    () => {
                      reset();
                      setMessage("Your offer was sent to the table.");
                    },
                  )
                }
              >
                {isCurrent ? "Send offer" : "Send counteroffer"}
              </BoardButton>
              <BoardButton tone="quiet" disabled={busy} onClick={reset}>
                Clear draft
              </BoardButton>
            </div>
          </section>
        )}
        {isCurrent && proposal && (
          <section aria-label="Player responses">
            <h3>At the table</h3>
            <CardList
              cards={[
                ...proposal.proposerTradeOffer.give.handCards,
                ...proposal.proposerTradeOffer.marketCards,
              ]}
              empty="No offered cards"
            />
            {proposal.playersDeals.map((deal) => {
              const dealer = game.players.find((p) => p.id === deal.playerId);
              const counter = deal.newTradeOffer;
              return (
                <div key={deal.playerId} className={s.response}>
                  <strong>{dealer?.playerName ?? "Player"}</strong>
                  <span className={s.hint}>
                    {counter
                      ? "Counteroffer"
                      : deal.accepted === true
                        ? "Accepted your offer"
                        : deal.accepted === false
                          ? "Declined"
                          : "Considering your offer…"}
                  </span>
                  {counter && (
                    <div className={s.tradeSummary}>
                      <div>
                        <h4>You give</h4>
                        <CardList
                          cards={[
                            ...counter.receive.expectedCards,
                            ...counter.marketCards,
                          ]}
                        />
                      </div>
                      <div>
                        <h4>You receive</h4>
                        <CardList cards={counter.give.handCards} />
                      </div>
                    </div>
                  )}
                  {(counter || deal.accepted === true) && (
                    <BoardButton
                      disabled={
                        busy ||
                        Boolean(
                          counter &&
                          !playerHasAllTheRequestedCards(
                            player.hand,
                            counter.receive.expectedCards,
                          ),
                        )
                      }
                      onClick={() =>
                        mutation.run(
                          "Confirm exchange",
                          () => actions.accept(deal.playerId, Boolean(counter)),
                          () => {
                            reset();
                            setMessage(
                              "Exchange confirmed. Received cards are on your board.",
                            );
                          },
                        )
                      }
                    >
                      Confirm exchange with {dealer?.playerName ?? "player"}
                    </BoardButton>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
      <div className={s.tradeFooter}>
        Your hand stays on the board. Closing this panel keeps your draft.
      </div>
    </dialog>
  );
}
