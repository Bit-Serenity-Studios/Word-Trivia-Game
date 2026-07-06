import type {
  RewardedAdProvider,
  RewardedAdResult,
  RewardedPlacement,
} from './ads';

export interface AdmobRewardedAdInstance {
  load(): void;
  show(): Promise<void>;
  addAdEventListener(event: string, listener: (payload?: unknown) => void): () => void;
}

export interface AdmobSDK {
  RewardedAd: {
    createForAdRequest(unitId: string, options?: unknown): AdmobRewardedAdInstance;
  };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType: { EARNED_REWARD: string };
  TestIds: { REWARDED: string };
}

export interface AdmobConfig {
  useTestIds: boolean;
  unitFor(placement: RewardedPlacement): string;
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
