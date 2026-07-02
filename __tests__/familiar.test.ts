import {
  initialFamiliarState,
  isForaging,
  isReady,
  remainingMs,
  rollReward,
  FORAGE_DURATION_MS,
  formatRemaining,
} from '@/game/familiar';
import { mulberry32 } from '@/game/rng';

describe('familiar timer', () => {
  it('is not foraging by default', () => {
    const s = initialFamiliarState();
    expect(isForaging(s)).toBe(false);
    expect(isReady(s, 1_000_000)).toBe(false);
  });

  it('reports remaining time midway through', () => {
    const start = 1_700_000_000_000;
    const s = { ...initialFamiliarState(), taskStartedAt: start };
    expect(remainingMs(s, start + FORAGE_DURATION_MS / 2)).toBe(FORAGE_DURATION_MS / 2);
    expect(isReady(s, start + FORAGE_DURATION_MS / 2)).toBe(false);
  });

  it('reports ready when the duration has fully elapsed', () => {
    const start = 1_700_000_000_000;
    const s = { ...initialFamiliarState(), taskStartedAt: start };
    expect(isReady(s, start + FORAGE_DURATION_MS)).toBe(true);
    expect(isReady(s, start + FORAGE_DURATION_MS + 60_000)).toBe(true);
  });
});

describe('rollReward', () => {
  it('always returns a positive ink amount and a known tier', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 200; i++) {
      const r = rollReward(rng);
      expect(r.ink).toBeGreaterThan(0);
      expect(['common', 'rich', 'rare']).toContain(r.tier);
    }
  });

  it('produces rare hoards roughly 5% of the time over many rolls', () => {
    const rng = mulberry32(42);
    let rare = 0;
    const trials = 5000;
    for (let i = 0; i < trials; i++) if (rollReward(rng).tier === 'rare') rare++;
    const rate = rare / trials;
    expect(rate).toBeGreaterThan(0.02);
    expect(rate).toBeLessThan(0.10);
  });
});

describe('formatRemaining', () => {
  it('formats hours:minutes:seconds while more than an hour remains', () => {
    expect(formatRemaining(90 * 60 * 1000 + 5000)).toMatch(/^1:30:0[45]$/);
  });

  it('drops the hour digit when under an hour remains', () => {
    expect(formatRemaining(45 * 1000)).toBe('00:45');
  });
});
