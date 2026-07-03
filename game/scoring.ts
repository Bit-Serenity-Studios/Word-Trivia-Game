import { economy } from './economy';

export const BASE_INK = economy.ink.base;
export const STREAK_CAP = economy.ink.streakCap;
export const STREAK_PER_LEVEL = economy.ink.streakPerLevel;
export const UNAIDED_BONUS = economy.ink.unaidedBonus;
export const HINT_COST = economy.hint.cost;

export interface Reward {
  base: number;
  length: number;
  streakBonus: number;
  unaidedBonus: number;
  total: number;
}

export function computeReward(params: {
  answerLength: number;
  streakBefore: number;
  hintsUsed: number;
}): Reward {
  const base = BASE_INK;
  const length = params.answerLength;
  const streakLevel = Math.min(params.streakBefore + 1, STREAK_CAP);
  const streakBonus = streakLevel * STREAK_PER_LEVEL;
  const unaidedBonus = params.hintsUsed === 0 ? UNAIDED_BONUS : 0;
  const total = base + length + streakBonus + unaidedBonus;
  return { base, length, streakBonus, unaidedBonus, total };
}
