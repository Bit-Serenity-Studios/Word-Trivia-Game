export interface IapProductConfig {
  sku: string;
  priceLabel: string;
  title: string;
  flavor: string;
}

export interface ConsumableInk extends IapProductConfig {
  ink: number;
}

export interface ConsumableHints extends IapProductConfig {
  hints: number;
}

export const economy = {
  ink: {
    base: 8,
    streakCap: 5,
    streakPerLevel: 2,
    unaidedBonus: 5,
  },
  hint: {
    cost: 15,
    freeAfterFailures: 3,
  },
  difficulty: {
    novice: { decoys: 4, maxLen: 5 },
    scholar: { decoys: 5, maxLen: 8 },
    sage: { decoys: 6, maxLen: 12 },
    promotion: { scholarAt: 5, sageAt: 15 },
  },
  familiar: {
    forageMs: 2 * 60 * 60 * 1000,
    reward: {
      common: { ink: 25, weight: 0.7 },
      rich: { ink: 50, weight: 0.25 },
      rare: { ink: 100, weight: 0.05 },
    },
  },
  rewardedAd: {
    postSolveMultiplier: 2,
    dailyGiftInk: 30,
    dailyGiftHints: 0,
  },
  interstitial: {
    minSolvesBetween: 1,
    minMsBetween: 0,
    stubDurationMs: 3000,
  },
  rareVolume: {
    spawnRate: 0.12,
    rewardMultiplier: 3,
  },
  ranks: {
    patronBonus: 0.25,
  },
  volumeCompletion: {
    baseInk: 100,
  },
  onboarding: {
    coachedQuestionId: 'bb-fern',
    notificationAskAfterEntries: 3,
  },
  iap: {
    patron: {
      sku: 'com.athenaeum.patron',
      priceLabel: '$4.99',
      title: 'Patron of the Athenaeum',
      flavor:
        'One-time gift. Removes every advertisement — banners, broadcasts, and interstitials — and gifts a founding hoard of ink.',
      ink: 250,
    } satisfies IapProductConfig & { ink: number },
    hintBundleSmall: {
      sku: 'com.athenaeum.hints.10',
      priceLabel: '$1.99',
      title: 'Marginalia · 10 reveals',
      flavor: 'A slim volume of hints tucked into your desk drawer.',
      hints: 10,
    } satisfies ConsumableHints,
    hintBundleLarge: {
      sku: 'com.athenaeum.hints.30',
      priceLabel: '$4.99',
      title: 'Compendium · 30 reveals',
      flavor: 'A thick compendium of hints, indexed for the long night.',
      hints: 30,
    } satisfies ConsumableHints,
    inkPackSmall: {
      sku: 'com.athenaeum.ink.300',
      priceLabel: '$1.99',
      title: 'Vial of Ink · 300',
      flavor: 'A small vial of iron gall, enough for a fortnight of entries.',
      ink: 300,
    } satisfies ConsumableInk,
    inkPackLarge: {
      sku: 'com.athenaeum.ink.900',
      priceLabel: '$4.99',
      title: 'Flask of Ink · 900',
      flavor: 'A flask that will not empty for many nights.',
      ink: 900,
    } satisfies ConsumableInk,
  },
} as const;

export type EconomyConfig = typeof economy;
