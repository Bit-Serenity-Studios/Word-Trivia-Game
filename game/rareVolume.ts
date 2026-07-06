import type { Question, RNG } from './types';
import { mulberry32, seedFromString } from './rng';
import { economy } from './economy';

export const RARE_MIN_ANSWER_LENGTH = 9;
export const RARE_TIER = 'sage' as const;

export function isRareCandidate(question: Question): boolean {
  return (
    question.tier === RARE_TIER &&
    question.answer.length >= RARE_MIN_ANSWER_LENGTH
  );
}

export function candidatesIn(pool: readonly Question[]): Question[] {
  return pool.filter(isRareCandidate);
}

export function shouldSpawnRare(
  question: Question,
  seedKey: string,
): boolean {
  if (!isRareCandidate(question)) return false;
  const rng = mulberry32(seedFromString(`rare:${seedKey}:${question.id}`));
  return rng() < economy.rareVolume.spawnRate;
}

export function rareRewardMultiplier(): number {
  return economy.rareVolume.rewardMultiplier;
}

export function applyRareMultiplier(baseInk: number, rare: boolean): number {
  if (!rare) return baseInk;
  return Math.round(baseInk * economy.rareVolume.rewardMultiplier);
}

export function pickRareForcedFromPool(
  pool: readonly Question[],
  rng: RNG,
): Question | null {
  const candidates = candidatesIn(pool);
  if (candidates.length === 0) return null;
  const idx = Math.floor(rng() * candidates.length);
  return candidates[idx] ?? null;
}
