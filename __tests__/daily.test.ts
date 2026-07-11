import { dailyPickId, dateKey } from '@/game/daily';

describe('dateKey', () => {
  it('produces zero-padded YYYY-MM-DD in UTC', () => {
    const d = new Date(Date.UTC(2026, 0, 5));
    expect(dateKey(d)).toBe('2026-01-05');
  });
});

describe('dailyPickId', () => {
  const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

  it('picks the same id for the same key across calls', () => {
    const a = dailyPickId('2026-01-05', pool);
    const b = dailyPickId('2026-01-05', pool);
    expect(a).toBe(b);
  });

  it('picks different ids on different days most of the time', () => {
    const seen = new Set<string>();
    for (let i = 1; i <= 30; i++) {
      const key = `2026-01-${String(i).padStart(2, '0')}`;
      seen.add(dailyPickId(key, pool));
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it('always returns a member of the pool', () => {
    for (let i = 1; i <= 60; i++) {
      const key = `2026-01-${String(i).padStart(2, '0')}`;
      expect(pool).toContain(dailyPickId(key, pool));
    }
  });
});
