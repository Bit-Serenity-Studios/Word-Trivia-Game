import {
  RANKS,
  currentRank,
  newlyEarnedRanks,
  nextRank,
  progressToNext,
  rankUpReward,
} from '../game/ranks';

describe('ranks table', () => {
  it('defines exactly 7 ranks in strict order 0..6', () => {
    expect(RANKS).toHaveLength(7);
    for (let i = 0; i < RANKS.length; i++) {
      expect(RANKS[i]!.order).toBe(i);
    }
  });

  it('has monotonically non-decreasing requirements', () => {
    for (let i = 1; i < RANKS.length; i++) {
      const prev = RANKS[i - 1]!.require;
      const cur = RANKS[i]!.require;
      expect(cur.entries).toBeGreaterThanOrEqual(prev.entries);
      expect(cur.cabinet).toBeGreaterThanOrEqual(prev.cabinet);
      expect(cur.nightlyBest).toBeGreaterThanOrEqual(prev.nightlyBest);
    }
  });

  it('has strictly increasing ink rewards above the novice tier', () => {
    for (let i = 2; i < RANKS.length; i++) {
      expect(RANKS[i]!.inkReward).toBeGreaterThan(RANKS[i - 1]!.inkReward);
    }
    expect(RANKS[0]!.inkReward).toBe(0);
  });
});

describe('currentRank + nextRank', () => {
  it('starts at Novice Reader with no progress', () => {
    const r = currentRank({ entries: 0, cabinet: 0, nightlyBest: 0 });
    expect(r.id).toBe('novice-reader');
    expect(nextRank({ entries: 0, cabinet: 0, nightlyBest: 0 })?.id).toBe('reading-room-curator');
  });

  it('requires ALL three facts to meet the threshold, not any single one', () => {
    // Bibliographer requires 30 entries + 3 cabinet.
    // Entries alone shouldn't promote you past Reading-Room-Curator.
    const r = currentRank({ entries: 40, cabinet: 0, nightlyBest: 0 });
    expect(r.id).toBe('reading-room-curator');
  });

  it('reaches Master of the Athenaeum only at the top thresholds', () => {
    const shortEntries = currentRank({ entries: 99, cabinet: 10, nightlyBest: 14 });
    expect(shortEntries.id).toBe('master-of-marginalia');
    const full = currentRank({ entries: 100, cabinet: 10, nightlyBest: 14 });
    expect(full.id).toBe('master-of-athenaeum');
    expect(nextRank({ entries: 100, cabinet: 10, nightlyBest: 14 })).toBeNull();
  });

  it('exposes ratio progress toward the next rank clamped to 1.0', () => {
    const p = progressToNext({ entries: 3, cabinet: 0, nightlyBest: 0 });
    expect(p.next?.id).toBe('reading-room-curator');
    expect(p.ratios?.entries).toBeCloseTo(3 / 5);
    expect(p.ratios?.cabinet).toBe(1);
    const capped = progressToNext({ entries: 999, cabinet: 999, nightlyBest: 999 });
    expect(capped.next).toBeNull();
    expect(capped.ratios).toBeNull();
  });
});

describe('newlyEarnedRanks and rewards', () => {
  it('returns the ranks crossed by a progress event', () => {
    const before = { entries: 4, cabinet: 0, nightlyBest: 0 };
    const after = { entries: 15, cabinet: 1, nightlyBest: 0 };
    const gained = newlyEarnedRanks(before, after);
    const ids = gained.map((r) => r.id);
    expect(ids).toEqual(['reading-room-curator', 'junior-fellow']);
  });

  it('returns an empty list when the rank is unchanged', () => {
    const before = { entries: 15, cabinet: 1, nightlyBest: 0 };
    const after = { entries: 20, cabinet: 1, nightlyBest: 0 };
    expect(newlyEarnedRanks(before, after)).toEqual([]);
  });

  it('grants the base ink reward for non-patrons and a bonus for patrons', () => {
    const bibliographer = RANKS.find((r) => r.id === 'bibliographer')!;
    expect(rankUpReward(bibliographer, false)).toBe(100);
    expect(rankUpReward(bibliographer, true)).toBe(125);
  });
});
