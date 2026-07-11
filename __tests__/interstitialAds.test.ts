import {
  INTERSTITIAL_DURATION_MS,
  NullInterstitialProvider,
  createRecordingInterstitialProvider,
  placementCopy,
  type InterstitialPlacement,
} from '../services/interstitialAds';

describe('interstitial vocabulary', () => {
  it('exposes a stable per-placement copy', () => {
    const solve = placementCopy('post-solve');
    const nightly = placementCopy('post-nightly');
    expect(solve.title.length).toBeGreaterThan(0);
    expect(solve.body.length).toBeGreaterThan(0);
    expect(nightly.title.length).toBeGreaterThan(0);
    expect(nightly.body.length).toBeGreaterThan(0);
    expect(solve.body).not.toBe(nightly.body);
  });

  it('exposes a positive duration', () => {
    expect(INTERSTITIAL_DURATION_MS).toBeGreaterThan(0);
  });
});

describe('null provider', () => {
  it('reports ready but never actually shows an ad', async () => {
    expect(NullInterstitialProvider.isReady()).toBe(true);
    const result = await NullInterstitialProvider.showAd('post-solve');
    expect(result).toEqual({ shown: false, closed: true });
  });
});

describe('recording provider', () => {
  it('records every placement in call order', async () => {
    const rec = createRecordingInterstitialProvider();
    const trace: InterstitialPlacement[] = ['post-solve', 'post-solve', 'post-nightly'];
    for (const p of trace) {
      await rec.showAd(p);
    }
    expect(rec.events).toEqual(trace);
    rec.clear();
    expect(rec.events).toHaveLength(0);
  });

  it('claims shown=true so callers see a truthy result in tests', async () => {
    const rec = createRecordingInterstitialProvider();
    const result = await rec.showAd('post-solve');
    expect(result.shown).toBe(true);
    expect(result.closed).toBe(true);
  });
});
