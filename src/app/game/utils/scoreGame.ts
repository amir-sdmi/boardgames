import { PlayerType } from "@/types/gameTypes";
import { findThePrice } from "../core/actions/harvest/findThePrice";

export function computePlayerScore(player: PlayerType): number {
  let score = player.money;
  for (const field of player.fields) {
    if (field.crops && field.crops.quantity > 0) {
      score += findThePrice(field.crops, field.manure);
    }
  }
  return score;
}

export function rankPlayersByScore(
  players: PlayerType[],
): { player: PlayerType; score: number; rank: number }[] {
  const withScores = players.map((player) => ({
    player,
    score: computePlayerScore(player),
  }));
  withScores.sort((a, b) => b.score - a.score);
  return withScores.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}
