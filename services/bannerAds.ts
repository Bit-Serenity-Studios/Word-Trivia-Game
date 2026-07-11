export type BannerSlot = 'cabinet-bottom' | 'store-bottom' | 'settings-bottom';

export type BannerSize = 'standard';

export interface BannerRenderProps {
  slot: BannerSlot;
  size: BannerSize;
}

export interface BannerProvider {
  render(props: BannerRenderProps): unknown;
}

export const NullBannerProvider: BannerProvider = {
  render: () => null,
};
