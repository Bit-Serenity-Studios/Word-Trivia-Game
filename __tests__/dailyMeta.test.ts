import {
  initialDailyMeta,
  isConsecutive,
  keyOffsetBy,
  recordDailyCompletion,
  hasCompletedToday,
  streakStandingOn,
} from '@/game/dailyMeta';

describe('date key math', () => {
  it('rolls January to December on a negative offset', () => {
    expect(keyOffsetBy('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('handles a leap day', () => {
    expect(keyOffsetBy('2024-02-28', 1)).toBe('2024-02-29');
    expect(keyOffsetBy('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('isConsecutive is true only for adjacent days', () => {
    expect(isConsecutive('2026-07-02', '2026-07-03')).toBe(true);
    expect(isConsecutive('2026-07-02', '2026-07-04')).toBe(false);
    expect(isConsecutive('2026-07-02', '2026-07-02')).toBe(false);
  });
});

describe('daily streak', () => {
  it('starts a streak of one on the first completion', () => {
    const s = recordDailyCompletion(initialDailyMeta(), '2026-07-02', 'np-saturn', 21);
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(1);
    expect(hasCompletedToday(s, '2026-07-02')).toBe(true);
  });

  it('advances the streak on a consecutive day', () => {
    let s = recordDailyCompletion(initialDailyMeta(), '2026-07-02', 'q1', 20);
    s = recordDailyCompletion(s, '2026-07-03', 'q2', 20);
    s = recordDailyCompletion(s, '2026-07-04', 'q3', 20);
    expect(s.streak).toBe(3);
    expect(s.bestStreak).toBe(3);
  });

  it('resets the streak on a skipped day but keeps the best', () => {
    let s = recordDailyCompletion(initialDailyMeta(), '2026-07-02', 'q1', 20);
    s = recordDailyCompletion(s, '2026-07-03', 'q2', 20);
    s = recordDailyCompletion(s, '2026-07-05', 'q3', 20);
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(2);
  });

  it('ignores a duplicate completion on the same day', () => {
    const s = recordDailyCompletion(initialDailyMeta(), '2026-07-02', 'q1', 20);
    const again = recordDailyCompletion(s, '2026-07-02', 'q1', 20);
    expect(again).toBe(s);
  });

  it('streakStandingOn shows the standing streak on missed and completed days', () => {
    let s = recordDailyCompletion(initialDailyMeta(), '2026-07-02', 'q1', 20);
    s = recordDailyCompletion(s, '2026-07-03', 'q2', 20);
    expect(streakStandingOn(s, '2026-07-03')).toBe(2);
    expect(streakStandingOn(s, '2026-07-04')).toBe(2);
    expect(streakStandingOn(s, '2026-07-05')).toBe(0);
  });
});
