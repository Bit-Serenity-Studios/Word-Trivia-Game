import {
  clearRealProviders,
  registerRealProviders,
  resolveAdsProvider,
  resolveIapProvider,
  resolveTelemetry,
  buildRealTelemetry,
  buildRealAdsProvider,
  buildRealIapProvider,
} from '../services/providerFactories';
import { NullTelemetry, createRecordingTelemetry } from '../services/analytics';
import type { RewardedAdProvider } from '../services/ads';
import type { IapProvider } from '../services/iap';
import type { AdmobSDK } from '../services/adsAdmob';
import type { RevenueCatSDK } from '../services/iapRevenueCat';

const stubAds: RewardedAdProvider = {
  isReady: () => true,
  showAd: async () => ({ shown: false, rewarded: false }),
};

const stubIap: IapProvider = {
  purchase: async (sku) => ({ sku, outcome: 'cancelled' }),
  restore: async () => [],
  isPurchased: () => false,
};

describe('provider factories: fallback behavior', () => {
  beforeEach(() => clearRealProviders());
  afterEach(() => clearRealProviders());

  it('returns the fallback telemetry when nothing is registered', () => {
    expect(resolveTelemetry(NullTelemetry)).toBe(NullTelemetry);
  });

  it('returns the stub ads provider when nothing is registered', () => {
    expect(resolveAdsProvider(stubAds)).toBe(stubAds);
  });

  it('returns the stub iap provider when nothing is registered', () => {
    expect(resolveIapProvider(stubIap)).toBe(stubIap);
  });
});

describe('provider factories: registration overrides', () => {
  beforeEach(() => clearRealProviders());
  afterEach(() => clearRealProviders());

  it('resolves the registered telemetry over the fallback', () => {
    const real = createRecordingTelemetry(() => 0);
    registerRealProviders({ telemetry: real });
    expect(resolveTelemetry(NullTelemetry)).toBe(real);
  });

  it('resolves the registered ads provider over the stub', () => {
    const real: RewardedAdProvider = {
      isReady: () => false,
      showAd: async () => ({ shown: true, rewarded: true }),
    };
    registerRealProviders({ ads: real });
    expect(resolveAdsProvider(stubAds)).toBe(real);
  });

  it('resolves the registered iap provider over the stub', () => {
    const real: IapProvider = {
      purchase: async (sku) => ({ sku, outcome: 'purchased' }),
      restore: async () => [],
      isPurchased: () => true,
    };
    registerRealProviders({ iap: real });
    expect(resolveIapProvider(stubIap)).toBe(real);
  });

  it('supports registering providers incrementally', () => {
    const rec = createRecordingTelemetry(() => 0);
    registerRealProviders({ telemetry: rec });
    registerRealProviders({ ads: { ...stubAds } });
    expect(resolveTelemetry(NullTelemetry)).toBe(rec);
    expect(resolveAdsProvider(stubAds)).not.toBe(stubAds);
  });

  it('clears all registrations on clearRealProviders', () => {
    registerRealProviders({ telemetry: createRecordingTelemetry(() => 0), ads: stubAds, iap: stubIap });
    clearRealProviders();
    expect(resolveTelemetry(NullTelemetry)).toBe(NullTelemetry);
    expect(resolveAdsProvider(stubAds)).toBe(stubAds);
    expect(resolveIapProvider(stubIap)).toBe(stubIap);
  });
});

describe('buildRealTelemetry', () => {
  it('captures via the passed client', () => {
    const events: string[] = [];
    const telemetry = buildRealTelemetry({
      client: {
        capture: (name) => events.push(name),
        identify: () => undefined,
        flush: async () => undefined,
      },
    });
    telemetry.track('entry_solved');
    expect(events).toEqual(['entry_solved']);
  });
});

describe('buildRealAdsProvider', () => {
  function fakeAdmob(): AdmobSDK {
    return {
      RewardedAd: {
        createForAdRequest: (_unitId: string) => {
          const listeners: Record<string, Array<(p?: unknown) => void>> = {};
          const instance = {
            load: () => {
              setTimeout(() => {
                (listeners['LOADED'] ?? []).forEach((l) => l());
                (listeners['EARNED_REWARD'] ?? []).forEach((l) => l());
                (listeners['CLOSED'] ?? []).forEach((l) => l());
              }, 0);
            },
            show: async () => undefined,
            addAdEventListener: (event: string, listener: (p?: unknown) => void) => {
              listeners[event] = listeners[event] ?? [];
              listeners[event]!.push(listener);
              return () => {
                listeners[event] = (listeners[event] ?? []).filter((l) => l !== listener);
              };
            },
          };
          return instance;
        },
      },
      AdEventType: { LOADED: 'LOADED', CLOSED: 'CLOSED', ERROR: 'ERROR' },
      RewardedAdEventType: { EARNED_REWARD: 'EARNED_REWARD' },
      TestIds: { REWARDED: 'test-rewarded' },
    };
  }

  it('resolves rewarded=true when the reward event fires before close', async () => {
    const provider = buildRealAdsProvider({
      sdk: fakeAdmob(),
      useTestIds: true,
    });
    const result = await provider.showAd('post-solve-double');
    expect(result).toEqual({ shown: true, rewarded: true });
  });

  it('throws from unitFor when no unit id is configured for a non-test-id build', async () => {
    const provider = buildRealAdsProvider({
      sdk: fakeAdmob(),
      useTestIds: false,
    });
    await expect(provider.showAd('post-solve-double')).rejects.toThrow(/no unit id configured/);
  });
});

describe('buildRealIapProvider', () => {
  function fakePurchases(): {
    sdk: RevenueCatSDK;
    grantPatron: () => void;
  } {
    let patron = false;
    const sdk: RevenueCatSDK = {
      configure: () => undefined,
      getCustomerInfo: async () => ({
        entitlements: {
          active: patron
            ? { patron: { productIdentifier: 'com.athenaeum.patron', identifier: 'patron' } }
            : ({} as Record<string, { productIdentifier: string; identifier: string }>),
        },
      }),
      purchaseProduct: async (productIdentifier: string) => {
        if (productIdentifier === 'com.athenaeum.patron') patron = true;
        return {
          customerInfo: {
            entitlements: {
              active: patron
                ? { patron: { productIdentifier, identifier: 'patron' } }
                : ({} as Record<string, { productIdentifier: string; identifier: string }>),
            },
          },
        };
      },
      restorePurchases: async () => ({
        entitlements: {
          active: patron
            ? { patron: { productIdentifier: 'com.athenaeum.patron', identifier: 'patron' } }
            : ({} as Record<string, { productIdentifier: string; identifier: string }>),
        },
      }),
    };
    return { sdk, grantPatron: () => (patron = true) };
  }

  it('reports purchased when the entitlement key becomes active', async () => {
    const { sdk } = fakePurchases();
    const provider = buildRealIapProvider({ sdk });
    const attempt = await provider.purchase('com.athenaeum.patron');
    expect(attempt.outcome).toBe('purchased');
    expect(provider.isPurchased('com.athenaeum.patron')).toBe(true);
  });

  it('reports cancelled when the SDK throws with userCancelled', async () => {
    const sdk: RevenueCatSDK = {
      configure: () => undefined,
      getCustomerInfo: async () => ({
        entitlements: {
          active: {} as Record<string, { productIdentifier: string; identifier: string }>,
        },
      }),
      purchaseProduct: async () => {
        throw Object.assign(new Error('cancelled'), { userCancelled: true });
      },
      restorePurchases: async () => ({
        entitlements: {
          active: {} as Record<string, { productIdentifier: string; identifier: string }>,
        },
      }),
    };
    const provider = buildRealIapProvider({ sdk });
    const attempt = await provider.purchase('com.athenaeum.patron');
    expect(attempt.outcome).toBe('cancelled');
  });

  it('restores past purchases from getCustomerInfo entitlements', async () => {
    const { sdk, grantPatron } = fakePurchases();
    grantPatron();
    const provider = buildRealIapProvider({ sdk });
    const restored = await provider.restore();
    expect(restored).toContain('com.athenaeum.patron');
  });
});
