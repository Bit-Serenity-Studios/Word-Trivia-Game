# The Athenaeum — Dev Client + Provider Activation

M12 shipped the plumbing. This is what you (the human) do to actually
turn it on. The code is wired; the accounts are yours to create.

## What already happened in the codebase

- `react-native-google-mobile-ads`, `react-native-purchases`,
  `expo-dev-client`, and `expo-application` are pinned in `package.json`
  and installed.
- `services/registerProviders.native.ts` is the file MIGRATION.md
  previously asked you to write by hand. It's now in the tree, imports
  the real SDKs, and constructs real PostHog / AdMob / RevenueCat
  providers from env vars.
- `services/registerProviders.ts` is a web/test no-op fallback so
  Jest and web builds still work.
- `app/_layout.tsx` calls `bootstrapProviders()` once on mount.
- `services/analyticsPostHogHttp.ts` is a lightweight HTTP-only
  PostHog client (no need for `posthog-react-native` with its 8 peer
  deps). It batches events every 15 s or 20 events, whichever comes
  first, and drops the batch on network failure rather than
  accumulating memory.
- `services/bannerAdsAdmob.ts` implements the M9 `BannerProvider`
  interface against `react-native-google-mobile-ads`' `BannerAd`
  React component.
- `app.json` registers the AdMob plugin with Google's public test app
  IDs (`ca-app-pub-3940256099942544~...`). Swap for real app IDs
  before you flip `EXPO_PUBLIC_ADMOB_USE_TEST_IDS` to `0`.
- `eas.json` defines `development` / `preview` / `production` build
  profiles.
- `.env.example` documents every `EXPO_PUBLIC_*` var. Copy to
  `.env.local` (gitignored) and fill in your keys.
- `package.json` grew `build:dev:*` / `build:preview:*` / `build:prod:*`
  / `submit:*` scripts.

## What still needs you

### 1. EAS account + project

```bash
npx eas login          # or npx eas whoami
npx eas init           # creates the "REPLACE_WITH_EAS_PROJECT_ID"
                       # entry in app.json.extra.eas.projectId
```

### 2. First development build

```bash
npm run build:dev:android    # ~10 minutes on EAS free tier
npm run build:dev:ios        # requires Apple Developer account
```

Install the APK on Android or the IPA on iOS. From then on:

```bash
npm run start                # expo start --dev-client
```

Metro serves the JS bundle; the dev-client binary loads it. This is
now your daily loop. **Expo Go no longer works** because the AdMob
and RevenueCat native modules aren't present in it. That is the
trade-off of leaving Expo Go behind, and it's what M12 chose.

### 3. PostHog project (analytics)

- Create a project at [posthog.com](https://posthog.com) (US or EU
  region — the `_HOST` var controls which one).
- Copy the Project API Key into `.env.local` as `EXPO_PUBLIC_POSTHOG_KEY`.
- Rebuild the dev client (env vars are baked at build time).
- Play the game; watch Live Events light up.

### 4. Google AdMob (banners + interstitials + rewarded)

- Create an app at [admob.google.com](https://apps.admob.com).
- For each of the four ad-unit slots — rewarded / interstitial /
  banner — create a real Ad Unit and copy its ID into the matching
  `.env.local` var.
- Update `app.json`'s `androidAppId` and `iosAppId` under the
  `react-native-google-mobile-ads` plugin block from the Google test IDs
  to your real ones.
- Rebuild the dev client. Keep
  `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=1` until AdMob has approved your
  app — running real unit IDs during development can flag your account
  for invalid traffic.

### 5. RevenueCat (in-app purchases)

- Create a RevenueCat project at [app.revenuecat.com](https://app.revenuecat.com).
- Add the four SKUs from `game/economy.ts`:
  - `com.athenaeum.patron` — non-consumable, entitlement `patron`
  - `com.athenaeum.hints.10` — consumable
  - `com.athenaeum.hints.30` — consumable
  - `com.athenaeum.ink.300` — consumable
  - `com.athenaeum.ink.900` — consumable
- Create the same products in App Store Connect and Google Play
  Console. Link them to the RevenueCat SKUs.
- Copy the Android + iOS API keys into `.env.local`.
- Enroll a sandbox tester on both platforms; test the Patron flow.

### 6. Production

Before running `npm run build:prod:*`:

- Every `EXPO_PUBLIC_*` unit ID is filled in with a real ID
- `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=0` in the production profile's env
  (already set that way in `eas.json`)
- `EXPO_PUBLIC_USE_REAL_ADS=1` and `EXPO_PUBLIC_USE_REAL_IAP=1`
- App Store / Play Console listings are complete (see `STORE_LISTING.md`)
- Privacy policy is hosted at the URL you promised the store

## Reverting an ad-format temporarily

Every provider check is env-flag-driven. Comment out (or blank) the
matching flag in `.env.local`, rebuild, ship. The stub takes over and
you're back to the M9 fake broadcasts / fake purchase sheet. Useful
for QA screenshots — you get a clean UI without an SDK-generated
banner ad.

## Why the M10 message catalog and M8 accessibility work still apply

Nothing in M12 touches those layers. The AdBanner still uses
`useMessages()` and honors `shouldShowBanner({ patron })`; the
interstitial modal is now the real AdMob one when the flag is on
(no more localized copy — Google renders its own), but the stub path
still speaks whatever locale you've selected.

## Known M12 trade-offs

- **Bundle size grew ~1.5 MB** for the three native modules. Unavoidable.
- **Expo Go is dead** — accepted trade-off.
- **The lightweight HTTP PostHog client drops events on network
  failure** instead of persisting them. If you decide event durability
  matters more than simplicity, swap in the full `posthog-react-native`
  SDK — its constructor is already imported (`createPostHogTelemetry`
  is re-exported from `registerProviders.native.ts`).
- **`SKAdNetworkItems: []` is currently empty in app.json.** Before
  production, add the network IDs from Google AdMob's docs
  ([support.google.com/admob/answer/9781499](https://support.google.com/admob/answer/9781499))
  or iOS ad-fill drops significantly on iOS 14.5+.
