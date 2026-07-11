export interface AdVisibilityFacts {
  patron: boolean;
}

export function shouldShowAds(facts: AdVisibilityFacts): boolean {
  return !facts.patron;
}

export function shouldShowBanner(facts: AdVisibilityFacts): boolean {
  return shouldShowAds(facts);
}

export function shouldShowInterstitial(facts: AdVisibilityFacts): boolean {
  return shouldShowAds(facts);
}

export interface CadenceFacts {
  nowMs: number;
  solvesSinceLastShow: number;
  lastShownAtMs: number | null;
  lastRewardedAtMs: number | null;
  minSolvesBetween: number;
  minMsBetween: number;
  minMsAfterRewarded: number;
}

export function interstitialCadencePermits(facts: CadenceFacts): boolean {
  if (facts.solvesSinceLastShow < facts.minSolvesBetween) return false;
  if (facts.lastRewardedAtMs !== null) {
    if (facts.nowMs - facts.lastRewardedAtMs < facts.minMsAfterRewarded) return false;
  }
  if (facts.lastShownAtMs === null) return true;
  return facts.nowMs - facts.lastShownAtMs >= facts.minMsBetween;
}
