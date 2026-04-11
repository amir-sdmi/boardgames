"use client";

import { rankPlayersByScore } from "../utils/scoreGame";
import { GameType } from "@/types/gameTypes";
import { LinkButton } from "@/app/components/ui/LinkButton";

export default function GameFinishedOverlay({
  gameState,
  currentUserId,
}: {
  gameState: GameType;
  currentUserId: string;
}) {
  const ranked = rankPlayersByScore(gameState.players);
  const winner = ranked[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-secondary bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-secondary">
          Game finished
        </h2>
        <p className="mb-6 text-center text-sm text-neutral-600">
          Scores include coins plus the harvest value of beans still on fields
          (same formula as harvesting).
        </p>
        <ol className="mb-8 flex flex-col gap-3">
          {ranked.map(({ player, score, rank }) => {
            const isYou = player.userId === currentUserId;
            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                    {rank}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {player.playerName}
                      {isYou ? " (you)" : ""}
                    </p>
                    {rank === 1 && (
                      <p className="text-xs text-amber-600">Winner</p>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold tabular-nums">{score}</span>
              </li>
            );
          })}
        </ol>
        {winner && (
          <p className="mb-6 text-center text-sm text-neutral-700">
            {winner.player.playerName} wins with {winner.score} points.
          </p>
        )}
        <div className="flex justify-center">
          <LinkButton href="/lobby">Back to lobby</LinkButton>
        </div>
      </div>
    </div>
  );
}
