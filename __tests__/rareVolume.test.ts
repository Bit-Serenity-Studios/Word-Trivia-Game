import questionsData from '../content/questions.json';
import type { Question } from '../game/types';
import {
  RARE_MIN_ANSWER_LENGTH,
  applyRareMultiplier,
  candidatesIn,
  isRareCandidate,
  pickRareForcedFromPool,
  rareRewardMultiplier,
  shouldSpawnRare,
} from '../game/rareVolume';
import { mulberry32 } from '../game/rng';

const POOL: Question[] = (questionsData as Question[]).map((q) => ({
  ...q,
  answer: q.answer.toUpperCase(),
}));

describe('rare candidate identification', () => {
  it('only accepts sage-tier answers of the minimum length', () => {
    const sageLong: Question = {
      id: 'x',
      prompt: 'x',
      answer: 'ARCHIPELAGO',
      category: 'Cartography',
      tier: 'sage',
    };
    const sageShort: Question = { ...sageLong, answer: 'BRIEF', tier: 'sage' };
    const scholarLong: Question = { ...sageLong, tier: 'scholar' };
    expect(isRareCandidate(sageLong)).toBe(true);
    expect(isRareCandidate(sageShort)).toBe(false);
    expect(isRareCandidate(scholarLong)).toBe(false);
    expect(RARE_MIN_ANSWER_LENGTH).toBeGreaterThanOrEqual(9);
  });

  it('finds real rare candidates in the bundled pool', () => {
    const rares = candidatesIn(POOL);
    expect(rares.length).toBeGreaterThan(0);
    for (const r of rares) {
      expect(r.tier).toBe('sage');
      expect(r.answer.length).toBeGreaterThanOrEqual(RARE_MIN_ANSWER_LENGTH);
    }
  });
});

describe('shouldSpawnRare', () => {
  const sample: Question = {
    id: 'ca-archipelago',
    prompt: 'x',
    answer: 'ARCHIPELAGO',
    category: 'Cartography',
    tier: 'sage',
  };

  it('is deterministic for a given seed key + question id', () => {
    const a = shouldSpawnRare(sample, 'round-42');
    const b = shouldSpawnRare(sample, 'round-42');
    expect(a).toBe(b);
  });

  it('never fires on a non-candidate regardless of seed', () => {
    const notRare: Question = { ...sample, answer: 'NOVEL', tier: 'novice' };
    for (const key of ['a', 'b', 'c', 'd']) {
      expect(shouldSpawnRare(notRare, key)).toBe(false);
    }
  });

  it('produces a spawn density near the configured rate across many seeds', () => {
    let hits = 0;
    const N = 1000;
    for (let i = 0; i < N; i++) {
      if (shouldSpawnRare(sample, `k-${i}`)) hits += 1;
    }
    const observed = hits / N;
    expect(observed).toBeGreaterThan(0.05);
    expect(observed).toBeLessThan(0.2);
  });
});

describe('rare reward multiplier', () => {
  it('scales ink by the configured multiplier when rare', () => {
    const mult = rareRewardMultiplier();
    expect(mult).toBeGreaterThan(1);
    expect(applyRareMultiplier(30, false)).toBe(30);
    expect(applyRareMultiplier(30, true)).toBe(30 * mult);
  });
});

describe('forced rare pick', () => {
  it('returns a candidate from a pool that contains one', () => {
    const rng = mulberry32(1234);
    const picked = pickRareForcedFromPool(POOL, rng);
    expect(picked).not.toBeNull();
    expect(picked && isRareCandidate(picked)).toBe(true);
  });

  it('returns null when the pool has no candidate', () => {
    const rng = mulberry32(1234);
    const noviceOnly = POOL.filter((q) => q.tier === 'novice');
    expect(pickRareForcedFromPool(noviceOnly, rng)).toBeNull();
  });
});
