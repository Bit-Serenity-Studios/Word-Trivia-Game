export type InterstitialPlacement = 'post-solve' | 'post-nightly';

export interface InterstitialResult {
  shown: boolean;
  closed: boolean;
}

export interface InterstitialProvider {
  isReady(): boolean;
  showAd(placement: InterstitialPlacement): Promise<InterstitialResult>;
}

export const INTERSTITIAL_DURATION_MS = 3000;

export function placementCopy(placement: InterstitialPlacement): { title: string; body: string } {
  switch (placement) {
    case 'post-solve':
      return {
        title: 'A brief announcement.',
        body: 'The archives keep the candles lit with an occasional word from a patron.',
      };
    case 'post-nightly':
      return {
        title: 'A brief announcement.',
        body: 'Tonight’s entry is catalogued. The archives thank you for a moment of attention.',
      };
  }
}

export const NullInterstitialProvider: InterstitialProvider = {
  isReady: () => true,
  showAd: () => Promise.resolve({ shown: false, closed: true }),
};

export interface RecordingInterstitialProvider extends InterstitialProvider {
  events: readonly InterstitialPlacement[];
  clear(): void;
}

export function createRecordingInterstitialProvider(): RecordingInterstitialProvider {
  const events: InterstitialPlacement[] = [];
  return {
    get events(): readonly InterstitialPlacement[] {
      return events;
    },
    isReady: () => true,
    async showAd(placement) {
      events.push(placement);
      return { shown: true, closed: true };
    },
    clear() {
      events.length = 0;
    },
  };
}
