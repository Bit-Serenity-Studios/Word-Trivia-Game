import type { Tier } from './types';

export const DECOY_COUNT: Record<Tier, number> = {
  novice: 4,
  scholar: 5,
  sage: 6,
};

export function decoyCount(tier: Tier): number {
  return DECOY_COUNT[tier];
}

export function tierForLength(len: number): Tier {
  if (len <= 5) return 'novice';
  if (len <= 8) return 'scholar';
  return 'sage';
}

export function tierForEntries(entriesSolved: number): Tier {
  if (entriesSolved < 5) return 'novice';
  if (entriesSolved < 15) return 'scholar';
  return 'sage';
}

const CONSONANT_POOL = 'BCDFGHJKLMNPQRSTVWXZ';
const VOWEL_POOL = 'AEIOU';

export function generateDecoys(answer: string, count: number, rng: () => number): string[] {
  const answerSet = new Set(answer.toUpperCase().split(''));
  const decoys: string[] = [];
  const vowelRatio = 0.35;
  let safety = 0;
  while (decoys.length < count && safety++ < 200) {
    const useVowel = rng() < vowelRatio;
    const pool = useVowel ? VOWEL_POOL : CONSONANT_POOL;
    const letter = pool[Math.floor(rng() * pool.length)]!;
    if (answerSet.has(letter)) continue;
    decoys.push(letter);
  }
  while (decoys.length < count) {
    const letter = CONSONANT_POOL[Math.floor(rng() * CONSONANT_POOL.length)]!;
    decoys.push(letter);
  }
  return decoys;
}
