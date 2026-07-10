import {
  interstitialCadencePermits,
  shouldShowAds,
  shouldShowBanner,
  shouldShowInterstitial,
} from '../services/adPolicy';

describe('shouldShowAds', () => {
  it('is false when the player is a patron', () => {
    expect(shouldShowAds({ patron: true })).toBe(false);
  });

  it('is true otherwise', () => {
    expect(shouldShowAds({ patron: false })).toBe(true);
  });

  it('drives banner and interstitial visibility identically', () => {
    expect(shouldShowBanner({ patron: true })).toBe(false);
    expect(shouldShowBanner({ patron: false })).toBe(true);
    expect(shouldShowInterstitial({ patron: true })).toBe(false);
    expect(shouldShowInterstitial({ patron: false })).toBe(true);
  });
});

describe('interstitialCadencePermits', () => {
  const base = {
    minSolvesBetween: 4,
    minMsBetween: 90_000,
  };

  it('permits the first ever call when no interstitial has been shown yet', () => {
    expect(
      interstitialCadencePermits({
        ...base,
        nowMs: 1_000,
        solvesSinceLastShow: 10,
        lastShownAtMs: null,
      }),
    ).toBe(true);
  });

  it('blocks when there have been too few solves since the last show', () => {
    expect(
      interstitialCadencePermits({
        ...base,
        nowMs: 200_000,
        solvesSinceLastShow: 3,
        lastShownAtMs: 100_000,
      }),
    ).toBe(false);
  });

  it('blocks when the time window has not yet elapsed', () => {
    expect(
      interstitialCadencePermits({
        ...base,
        nowMs: 150_000,
        solvesSinceLastShow: 10,
        lastShownAtMs: 100_000,
      }),
    ).toBe(false);
  });

  it('permits when both the solve count and the time window are satisfied', () => {
    expect(
      interstitialCadencePermits({
        ...base,
        nowMs: 200_000,
        solvesSinceLastShow: 4,
        lastShownAtMs: 100_000,
      }),
    ).toBe(true);
  });

  it('behaves as fire-every-solve when both thresholds are zero', () => {
    const permissive = { minSolvesBetween: 1, minMsBetween: 0 };
    expect(
      interstitialCadencePermits({
        ...permissive,
        nowMs: 500,
        solvesSinceLastShow: 1,
        lastShownAtMs: 400,
      }),
    ).toBe(true);
  });
});
