import type { RewardedAdProvider, RewardedPlacement } from './ads';
import type { IapProvider } from './iap';
import type { Telemetry } from './analytics';
import { NullTelemetry, createConsoleTelemetry } from './analytics';
import { createPostHogTelemetry, type PostHogClient } from './analyticsPostHog';
import { createAdmobRewardedProvider, type AdmobSDK, type AdmobConfig } from './adsAdmob';
import {
  createRevenueCatProvider,
  type RevenueCatSDK,
  type RevenueCatConfig,
} from './iapRevenueCat';
import { economy } from '@/game/economy';

export interface RealProviders {
  telemetry?: Telemetry | null;
  ads?: RewardedAdProvider | null;
  iap?: IapProvider | null;
}

let registered: RealProviders = {};

export function registerRealProviders(providers: RealProviders): void {
  registered = { ...registered, ...providers };
}

export function clearRealProviders(): void {
  registered = {};
}

export function resolveTelemetry(fallback: Telemetry): Telemetry {
  if (registered.telemetry) return registered.telemetry;
  return fallback;
}

export function resolveAdsProvider(fallback: RewardedAdProvider): RewardedAdProvider {
  return registered.ads ?? fallback;
}

export function resolveIapProvider(fallback: IapProvider): IapProvider {
  return registered.iap ?? fallback;
}

export function defaultTelemetryForDev(): Telemetry {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return createConsoleTelemetry();
  return NullTelemetry;
}

export interface BuildRealTelemetryOptions {
  client: PostHogClient;
  distinctId?: string | null;
  identifyProperties?: Record<string, unknown>;
}

export function buildRealTelemetry(options: BuildRealTelemetryOptions): Telemetry {
  return createPostHogTelemetry(options);
}

export interface BuildRealAdsOptions {
  sdk: AdmobSDK;
  useTestIds: boolean;
  unitFor?(placement: RewardedPlacement): string;
  loadTimeoutMs?: number;
}

export function buildRealAdsProvider(options: BuildRealAdsOptions): RewardedAdProvider {
  const config: AdmobConfig = {
    useTestIds: options.useTestIds,
    unitFor:
      options.unitFor ??
      ((placement) => {
        if (options.useTestIds) return options.sdk.TestIds.REWARDED;
        throw new Error(`buildRealAdsProvider: no unit id configured for placement "${placement}"`);
      }),
    loadTimeoutMs: options.loadTimeoutMs,
  };
  return createAdmobRewardedProvider(options.sdk, config);
}

export interface BuildRealIapOptions {
  sdk: RevenueCatSDK;
  entitlementKeyFor?(sku: string): string | null;
}

export function buildRealIapProvider(options: BuildRealIapOptions): IapProvider {
  const config: RevenueCatConfig = {
    entitlementKeyFor:
      options.entitlementKeyFor ??
      ((sku) => (sku === economy.iap.patron.sku ? 'patron' : null)),
  };
  return createRevenueCatProvider(options.sdk, config);
}
