import { economy } from '@/game/economy';
import { computeReward, BASE_INK, HINT_COST, STREAK_CAP, STREAK_PER_LEVEL, UNAIDED_BONUS } from '@/game/scoring';
import { decoyCount, tierForEntries, tierForLength } from '@/game/difficulty';
import { rollReward } from '@/game/familiar';
import { mulberry32 } from '@/game/rng';

describe('economy config', () => {
  it('is the source of truth for ink constants', () => {
    expect(BASE_INK).toBe(economy.ink.base);
    expect(STREAK_CAP).toBe(economy.ink.streakCap);
    expect(STREAK_PER_LEVEL).toBe(economy.ink.streakPerLevel);
    expect(UNAIDED_BONUS).toBe(economy.ink.unaidedBonus);
    expect(HINT_COST).toBe(economy.hint.cost);
  });

  it('is the source of truth for difficulty tiers', () => {
    expect(decoyCount('novice')).toBe(economy.difficulty.novice.decoys);
    expect(decoyCount('scholar')).toBe(economy.difficulty.scholar.decoys);
    expect(decoyCount('sage')).toBe(economy.difficulty.sage.decoys);
    expect(tierForEntries(economy.difficulty.promotion.scholarAt - 1)).toBe('novice');
    expect(tierForEntries(economy.difficulty.promotion.scholarAt)).toBe('scholar');
    expect(tierForEntries(economy.difficulty.promotion.sageAt)).toBe('sage');
    expect(tierForLength(economy.difficulty.novice.maxLen)).toBe('novice');
    expect(tierForLength(economy.difficulty.scholar.maxLen)).toBe('scholar');
    expect(tierForLength(economy.difficulty.sage.maxLen)).toBe('sage');
  });

  it('has strictly positive prices and non-empty SKUs for every IAP product', () => {
    for (const product of Object.values(economy.iap)) {
      expect(product.sku.length).toBeGreaterThan(0);
      expect(product.priceLabel).toMatch(/\$/);
      expect(product.title.length).toBeGreaterThan(0);
    }
  });

  it('familiar reward weights sum to 1', () => {
    const { common, rich, rare } = economy.familiar.reward;
    const total = common.weight + rich.weight + rare.weight;
    expect(total).toBeCloseTo(1, 5);
  });

  it('familiar rare drop stays within its configured weight ± tolerance over many rolls', () => {
    const rng = mulberry32(2026);
    const trials = 4000;
    let rare = 0;
    for (let i = 0; i < trials; i++) if (rollReward(rng).tier === 'rare') rare++;
    const rate = rare / trials;
    const target = economy.familiar.reward.rare.weight;
    expect(Math.abs(rate - target)).toBeLessThan(0.03);
  });

  it('computeReward still returns known totals after config wiring', () => {
    const r = computeReward({ answerLength: 6, streakBefore: 0, hintsUsed: 0 });
    expect(r.total).toBe(economy.ink.base + 6 + economy.ink.streakPerLevel + economy.ink.unaidedBonus);
  });

  it('rewarded-ad placements have configured payouts', () => {
    expect(economy.rewardedAd.postSolveMultiplier).toBeGreaterThanOrEqual(2);
    expect(economy.rewardedAd.dailyGiftInk).toBeGreaterThan(0);
    expect(economy.hint.freeAfterFailures).toBeGreaterThan(0);
  });
});
