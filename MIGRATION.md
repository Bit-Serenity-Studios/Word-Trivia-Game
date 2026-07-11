# The Athenaeum — Migration to Real Providers

This walks through swapping the M3/M5 stubs (fake ad broadcast modal, fake IAP
confirm sheet, console-only telemetry) for real vendors: PostHog for
analytics, Google AdMob for rewarded ads, and RevenueCat for in-app
purchases.

Nothing in this document has been executed by the codebase itself. The
adapter code and provider factories are in place; the SDK packages are
not installed. The steps below are what you run when you're ready.

## The shape

Each real provider follows the same pattern:

1. A dependency-injected adapter under `services/` accepts an SDK
   interface and returns a `Telemetry` / `RewardedAdProvider` /
   `IapProvider` matching what the app already uses.
2. `services/providerFactories.ts` exposes `registerRealProviders(...)`
   which the app queries when the hosts mount.
3. `TelemetryProvider`, `RewardedAdHost`, and `IapHost` fall back to
   their stub behavior when no real provider has been registered.

You wire everything up in one file (`services/registerProviders.native.ts`
below) and import it once from `app/_layout.tsx`. When you decide to
strip a provider back to the stub, delete its `register*` line.

## Prerequisites

- Move the project from Expo Go to a development client build.
- Have Google Play Console + App Store Connect accounts ready with your
  AdMob unit IDs and RevenueCat product IDs provisioned.

```bash
npx expo install expo-dev-client
```

Configure `eas.json` for a development profile, then

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

## Environment variables

Add these to `.env.local` (or your EAS build profile). All are
`EXPO_PUBLIC_*` so they're inlined into the client bundle.

```bash
# PostHog
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# AdMob
EXPO_PUBLIC_USE_REAL_ADS=1
EXPO_PUBLIC_ADMOB_USE_TEST_IDS=1        # set to 0 for production
# Rewarded (opt-in with reward — never suppressed by patron since they carry a benefit)
EXPO_PUBLIC_ADMOB_UNIT_POST_SOLVE=ca-app-pub-.../....
EXPO_PUBLIC_ADMOB_UNIT_FAILURE_RESCUE=ca-app-pub-.../....
EXPO_PUBLIC_ADMOB_UNIT_ARCHIVIST=ca-app-pub-.../....
# Interstitial (forced post-solve — suppressed by patron)
EXPO_PUBLIC_ADMOB_UNIT_INTERSTITIAL=ca-app-pub-.../....
# Banner (persistent on Cabinet/Store/Settings — suppressed by patron)
EXPO_PUBLIC_ADMOB_UNIT_BANNER=ca-app-pub-.../....

# RevenueCat
EXPO_PUBLIC_USE_REAL_IAP=1
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=goog_...
EXPO_PUBLIC_REVENUECAT_KEY_IOS=appl_...
```

Keep test-ad IDs on until AdMob approves your app; otherwise you can
get flagged for invalid traffic during development.

## Install the SDKs

```bash
npx expo install posthog-react-native
npx expo install react-native-google-mobile-ads
npm install react-native-purchases
```

PostHog's peer deps (device / localization) can go in as needed. The
app never reads their outputs directly.

## Register the providers

Create `services/registerProviders.native.ts`. Metro will pick up the
`.native.ts` on iOS/Android and leave the web build untouched.

```ts
import { Platform } from 'react-native';
import PostHog from 'posthog-react-native';
import mobileAds, {
  RewardedAd,
  InterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import Purchases from 'react-native-purchases';

import {
  registerRealProviders,
  buildRealTelemetry,
  buildRealAdsProvider,
  buildRealInterstitialProvider,
  buildRealIapProvider,
} from '@/services/providerFactories';
import { useTelemetryId } from '@/state/telemetryIdStore';
import type { RewardedPlacement } from '@/services/ads';
import type { InterstitialPlacement } from '@/services/interstitialAds';
import type { BannerProvider, BannerSlot } from '@/services/bannerAds';

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
const useRealAds = process.env.EXPO_PUBLIC_USE_REAL_ADS === '1';
const useTestAdIds = process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS !== '0';
const useRealIap = process.env.EXPO_PUBLIC_USE_REAL_IAP === '1';

const admobUnits: Record<RewardedPlacement, string | undefined> = {
  'post-solve-double': process.env.EXPO_PUBLIC_ADMOB_UNIT_POST_SOLVE,
  'failure-rescue': process.env.EXPO_PUBLIC_ADMOB_UNIT_FAILURE_RESCUE,
  'archivist-gift': process.env.EXPO_PUBLIC_ADMOB_UNIT_ARCHIVIST,
};

const interstitialUnits: Record<InterstitialPlacement, string | undefined> = {
  'post-solve': process.env.EXPO_PUBLIC_ADMOB_UNIT_INTERSTITIAL,
  'post-nightly': process.env.EXPO_PUBLIC_ADMOB_UNIT_INTERSTITIAL,
};

const bannerUnitId = process.env.EXPO_PUBLIC_ADMOB_UNIT_BANNER;

export async function bootstrapProviders(): Promise<void> {
  if (posthogKey) {
    const distinctId = useTelemetryId.getState().ensureId();
    const client = new PostHog(posthogKey, { host: posthogHost });
    registerRealProviders({
      telemetry: buildRealTelemetry({ client, distinctId }),
    });
  }

  if (useRealAds) {
    await mobileAds().initialize();
    const admobSdk = { RewardedAd, InterstitialAd, RewardedAdEventType, AdEventType, TestIds };
    registerRealProviders({
      ads: buildRealAdsProvider({
        sdk: admobSdk,
        useTestIds: useTestAdIds,
        unitFor: (placement) => {
          const id = admobUnits[placement];
          if (!id) throw new Error(`no AdMob unit configured for ${placement}`);
          return id;
        },
      }),
      interstitial: buildRealInterstitialProvider({
        sdk: admobSdk,
        useTestIds: useTestAdIds,
        unitFor: (placement) => {
          const id = interstitialUnits[placement];
          if (!id) throw new Error(`no AdMob interstitial unit configured for ${placement}`);
          return id;
        },
      }),
      banner: {
        // The banner provider is a render function; wire the react-native-google-mobile-ads
        // BannerAd component with the configured unit id and size (BANNER for 320x50).
        render: ({ slot, size }: { slot: BannerSlot; size: string }) => {
          if (!bannerUnitId) return null;
          return (
            <BannerAd
              unitId={bannerUnitId}
              size={BannerAdSize.BANNER}
            />
          );
        },
      } satisfies BannerProvider,
    });
  }

  if (useRealIap) {
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS
        : process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID;
    if (apiKey) {
      await Purchases.configure({ apiKey, appUserID: useTelemetryId.getState().ensureId() });
      registerRealProviders({
        iap: buildRealIapProvider({ sdk: Purchases }),
      });
    }
  }
}
```

Now call it once from `app/_layout.tsx` before rendering:

```ts
import { bootstrapProviders } from '@/services/registerProviders.native';

// inside RootLayout, before the first render:
useEffect(() => {
  void bootstrapProviders();
}, []);
```

## What the app does when providers aren't registered

Every host — `TelemetryProvider`, `RewardedAdHost`, `IapHost` — falls
back to the stub it had before this milestone. Delete `EXPO_PUBLIC_*`
flags to go back to fully-stubbed behavior. Delete the whole
`registerProviders.native.ts` to strip real providers entirely; the
adapter code in `services/` stays put and the app keeps building.

## Verifying

- **PostHog**: open the Live Events view in the PostHog dashboard; each
  Athenaeum event will appear with distinct-id, event name, and props.
- **AdMob**: start with `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=1`. Real test ads
  from Google should load. Only flip to real unit IDs after AdMob
  approves your app.
- **RevenueCat**: enroll a sandbox account (Apple: Sandbox Testers in
  App Store Connect; Google: license testers in Play Console). Buy the
  Patron product; entitlement `patron` should appear in the RevenueCat
  dashboard and `iap.isPurchased(sku)` should return true.

## Reverting a provider

To go back to a stub temporarily, comment out the corresponding
`registerRealProviders({ ... })` line. No other file changes needed.
