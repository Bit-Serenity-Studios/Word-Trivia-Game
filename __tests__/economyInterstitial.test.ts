import { economy } from '../game/economy';

describe('economy: interstitial cadence tunables', () => {
  it('exposes the three cadence knobs', () => {
    expect(economy.interstitial.minSolvesBetween).toBeGreaterThanOrEqual(1);
    expect(economy.interstitial.minMsBetween).toBeGreaterThanOrEqual(0);
    expect(economy.interstitial.stubDurationMs).toBeGreaterThan(0);
  });

  it('defaults to firing on every solve', () => {
    expect(economy.interstitial.minSolvesBetween).toBe(1);
    expect(economy.interstitial.minMsBetween).toBe(0);
  });
});

describe('economy: patron IAP framing', () => {
  it('names every ad surface in the flavor copy so store readers understand the value', () => {
    const flavor = economy.iap.patron.flavor.toLowerCase();
    expect(flavor).toContain('banner');
    expect(flavor).toContain('broadcast');
    expect(flavor).toContain('interstitial');
  });

  it('keeps Patron at $4.99', () => {
    expect(economy.iap.patron.priceLabel).toBe('$4.99');
  });
});
