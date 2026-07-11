import type {
  RewardedAdProvider,
  RewardedAdResult,
  RewardedPlacement,
} from './ads';
import type {
  InterstitialProvider,
  InterstitialPlacement,
  InterstitialResult,
} from './interstitialAds';

export interface AdmobRewardedAdInstance {
  load(): void;
  show(): Promise<void>;
  addAdEventListener(event: string, listener: (payload?: unknown) => void): () => void;
}

export interface AdmobInterstitialAdInstance {
  load(): void;
  show(): Promise<void>;
  addAdEventListener(event: string, listener: (payload?: unknown) => void): () => void;
}

export interface AdmobSDK {
  RewardedAd: {
    createForAdRequest(unitId: string, options?: unknown): AdmobRewardedAdInstance;
  };
  InterstitialAd?: {
    createForAdRequest(unitId: string, options?: unknown): AdmobInterstitialAdInstance;
  };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType: { EARNED_REWARD: string };
  TestIds: { REWARDED: string; INTERSTITIAL?: string };
}

export interface AdmobConfig {
  useTestIds: boolean;
  unitFor(placement: RewardedPlacement): string;
  loadTimeoutMs?: number;
}

export interface AdmobInterstitialConfig {
  useTestIds: boolean;
  unitFor(placement: InterstitialPlacement): string;
  loadTimeoutMs?: number;
}

const DEFAULT_LOAD_TIMEOUT_MS = 8000;

export function createAdmobRewardedProvider(
  sdk: AdmobSDK,
  config: AdmobConfig,
): RewardedAdProvider {
  return {
    isReady: () => true,
    async showAd(placement: RewardedPlacement): Promise<RewardedAdResult> {
      const unitId = config.useTestIds ? sdk.TestIds.REWARDED : config.unitFor(placement);
      const ad = sdk.RewardedAd.createForAdRequest(unitId);

      return new Promise<RewardedAdResult>((resolve) => {
        let settled = false;
        let rewarded = false;
        const unsubs: Array<() => void> = [];
        const finish = (result: RewardedAdResult) => {
          if (settled) return;
          settled = true;
          for (const u of unsubs) u();
          resolve(result);
        };

        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
            void ad.show().catch(() => finish({ shown: false, rewarded: false }));
          }),
        );
        unsubs.push(
          ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => {
            rewarded = true;
          }),
        );
        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
            finish({ shown: true, rewarded });
          }),
        );
        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
            finish({ shown: false, rewarded: false });
          }),
        );

        const timeoutMs = config.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
        const timeoutHandle = setTimeout(() => {
          finish({ shown: false, rewarded: false });
        }, timeoutMs);
        unsubs.push(() => clearTimeout(timeoutHandle));

        try {
          ad.load();
        } catch {
          finish({ shown: false, rewarded: false });
        }
      });
    },
  };
}

export function createAdmobInterstitialProvider(
  sdk: AdmobSDK,
  config: AdmobInterstitialConfig,
): InterstitialProvider {
  if (!sdk.InterstitialAd) {
    throw new Error('createAdmobInterstitialProvider: SDK does not expose InterstitialAd');
  }
  const InterstitialAd = sdk.InterstitialAd;
  return {
    isReady: () => true,
    async showAd(placement: InterstitialPlacement): Promise<InterstitialResult> {
      const useTestIds = config.useTestIds;
      const testId = sdk.TestIds.INTERSTITIAL;
      let unitId: string;
      if (useTestIds) {
        if (!testId) throw new Error('AdmobSDK.TestIds.INTERSTITIAL is undefined');
        unitId = testId;
      } else {
        unitId = config.unitFor(placement);
      }
      const ad = InterstitialAd.createForAdRequest(unitId);

      return new Promise<InterstitialResult>((resolve) => {
        let settled = false;
        const unsubs: Array<() => void> = [];
        const finish = (result: InterstitialResult) => {
          if (settled) return;
          settled = true;
          for (const u of unsubs) u();
          resolve(result);
        };

        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
            void ad.show().catch(() => finish({ shown: false, closed: true }));
          }),
        );
        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
            finish({ shown: true, closed: true });
          }),
        );
        unsubs.push(
          ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
            finish({ shown: false, closed: true });
          }),
        );

        const timeoutMs = config.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
        const timeoutHandle = setTimeout(() => {
          finish({ shown: false, closed: true });
        }, timeoutMs);
        unsubs.push(() => clearTimeout(timeoutHandle));

        try {
          ad.load();
        } catch {
          finish({ shown: false, closed: true });
        }
      });
    },
  };
}
