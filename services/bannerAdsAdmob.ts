import React from 'react';
import type { BannerProvider, BannerSlot } from './bannerAds';

export type BannerAdSize = 'BANNER' | 'FULL_BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE';

export interface AdmobBannerComponentProps {
  unitId: string;
  size: BannerAdSize;
  requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
}

export type AdmobBannerComponent = React.ComponentType<AdmobBannerComponentProps>;

export interface AdmobBannerConfig {
  BannerAd: AdmobBannerComponent;
  BannerAdSize: Record<BannerAdSize, BannerAdSize>;
  useTestIds: boolean;
  testUnitId?: string;
  unitFor(slot: BannerSlot): string;
  sizeFor?(slot: BannerSlot): BannerAdSize;
}

export function createAdmobBannerProvider(config: AdmobBannerConfig): BannerProvider {
  const {
    BannerAd,
    BannerAdSize: sizes,
    useTestIds,
    testUnitId,
    unitFor,
    sizeFor,
  } = config;
  const resolveSize = sizeFor ?? ((): BannerAdSize => 'BANNER');
  const resolveUnit = (slot: BannerSlot): string => {
    if (useTestIds) {
      if (!testUnitId) throw new Error('AdmobBannerConfig.testUnitId is required when useTestIds=true');
      return testUnitId;
    }
    return unitFor(slot);
  };
  return {
    render(props): React.ReactNode {
      const unitId = resolveUnit(props.slot);
      const size = sizes[resolveSize(props.slot)];
      return React.createElement(BannerAd, { unitId, size });
    },
  };
}
