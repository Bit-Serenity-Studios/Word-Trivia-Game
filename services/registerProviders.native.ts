import { Platform } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  InterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import Purchases from 'react-native-purchases';

import { registerRealProviders, buildRealAdsProvider, buildRealInterstitialProvider, buildRealIapProvider } from './providerFactories';
import { createAdmobBannerProvider } from './bannerAdsAdmob';
import { createHttpPostHogTelemetry } from './analyticsPostHogHttp';
import { createPostHogTelemetry } from './analyticsPostHog';
import { useTelemetryId } from '@/state/telemetryIdStore';
import type { RewardedPlacement } from './ads';
import type { InterstitialPlacement } from './interstitialAds';
import type { BannerSlot } from './bannerAds';

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const useRealAds = process.env.EXPO_PUBLIC_USE_REAL_ADS === '1';
const useTestAdIds = process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS !== '0';
const useRealIap = process.env.EXPO_PUBLIC_USE_REAL_IAP === '1';

const rewardedUnits: Record<RewardedPlacement, string | undefined> = {
  'post-solve-double': process.env.EXPO_PUBLIC_ADMOB_UNIT_POST_SOLVE,
  'failure-rescue': process.env.EXPO_PUBLIC_ADMOB_UNIT_FAILURE_RESCUE,
  'archivist-gift': process.env.EXPO_PUBLIC_ADMOB_UNIT_ARCHIVIST,
};

const interstitialUnits: Record<InterstitialPlacement, string | undefined> = {
  'post-solve': process.env.EXPO_PUBLIC_ADMOB_UNIT_INTERSTITIAL,
  'post-nightly': process.env.EXPO_PUBLIC_ADMOB_UNIT_INTERSTITIAL,
};

const bannerUnitId = process.env.EXPO_PUBLIC_ADMOB_UNIT_BANNER;

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapProviders(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = bootstrapReal().catch((err) => {
    console.warn('[Athenaeum] provider bootstrap failed:', err);
  });
  return bootstrapPromise;
}

async function bootstrapReal(): Promise<void> {
  const distinctId = useTelemetryId.getState().ensureId();

  if (posthogKey) {
    const telemetry = createHttpPostHogTelemetry({
      apiKey: posthogKey,
      host: posthogHost,
      distinctId,
    });
    registerRealProviders({ telemetry });
  }

  if (useRealAds) {
    await mobileAds().initialize();
    const admobSdk = {
      RewardedAd,
      InterstitialAd,
      RewardedAdEventType,
      AdEventType,
      TestIds,
    };
    registerRealProviders({
      ads: buildRealAdsProvider({
        sdk: admobSdk,
        useTestIds: useTestAdIds,
        unitFor: (placement) => {
          const id = rewardedUnits[placement];
          if (id) return id;
          if (useTestAdIds) return TestIds.REWARDED;
          throw new Error(`no AdMob rewarded unit configured for ${placement}`);
        },
      }),
      interstitial: buildRealInterstitialProvider({
        sdk: admobSdk,
        useTestIds: useTestAdIds,
        unitFor: (placement) => {
          const id = interstitialUnits[placement];
          if (id) return id;
          if (useTestAdIds) return TestIds.INTERSTITIAL;
          throw new Error(`no AdMob interstitial unit configured for ${placement}`);
        },
      }),
      banner: createAdmobBannerProvider({
        BannerAd,
        BannerAdSize,
        useTestIds: useTestAdIds,
        testUnitId: TestIds.BANNER,
        unitFor: (slot: BannerSlot) => {
          if (bannerUnitId) return bannerUnitId;
          throw new Error(`no AdMob banner unit configured for ${slot}`);
        },
      }),
    });
  }

  if (useRealIap) {
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS
        : process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID;
    if (apiKey) {
      await Purchases.configure({ apiKey, appUserID: distinctId });
      registerRealProviders({
        iap: buildRealIapProvider({
          sdk: {
            configure: async () => undefined,
            getCustomerInfo: () => Purchases.getCustomerInfo() as never,
            purchaseProduct: async (productIdentifier) => {
              const { customerInfo } = await Purchases.purchaseProduct(productIdentifier);
              return { customerInfo: customerInfo as never };
            },
            restorePurchases: () => Purchases.restorePurchases() as never,
          },
        }),
      });
    }
  }
}

// Keep the un-used PostHog SDK adapter around: if the user later prefers
// the full posthog-react-native SDK over the lightweight HTTP client, they
// can swap createHttpPostHogTelemetry for createPostHogTelemetry with a
// constructed PostHog() client. Kept as a re-export so the compiler tracks
// its usage.
export { createPostHogTelemetry };
