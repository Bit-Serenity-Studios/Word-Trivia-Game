import { computeReward, BASE_INK, UNAIDED_BONUS, STREAK_CAP, STREAK_PER_LEVEL } from '@/game/scoring';

describe('computeReward', () => {
  it('gives base + length for a first solve with no streak and no hints', () => {
    const r = computeReward({ answerLength: 6, streakBefore: 0, hintsUsed: 0 });
    expect(r.base).toBe(BASE_INK);
    expect(r.length).toBe(6);
    expect(r.streakBonus).toBe(1 * STREAK_PER_LEVEL);
    expect(r.unaidedBonus).toBe(UNAIDED_BONUS);
    expect(r.total).toBe(BASE_INK + 6 + STREAK_PER_LEVEL + UNAIDED_BONUS);
  });

  it('drops the unaided bonus when at least one hint was used', () => {
    const r = computeReward({ answerLength: 6, streakBefore: 0, hintsUsed: 1 });
    expect(r.unaidedBonus).toBe(0);
  });

  it('caps the streak bonus at STREAK_CAP levels', () => {
    const r = computeReward({ answerLength: 5, streakBefore: 100, hintsUsed: 0 });
    expect(r.streakBonus).toBe(STREAK_CAP * STREAK_PER_LEVEL);
  });
});
