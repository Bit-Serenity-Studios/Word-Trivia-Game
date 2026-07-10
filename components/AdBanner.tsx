import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BannerSlot } from '@/services/bannerAds';
import { resolveBannerProvider, NullBannerProvider } from '@/services/providerFactories';
import { shouldShowBanner } from '@/services/adPolicy';
import { useEntitlements } from '@/state/entitlementsStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useMessages } from '@/i18n/useMessages';

interface Props {
  slot: BannerSlot;
}

export function AdBanner({ slot }: Props) {
  const patron = useEntitlements((s) => s.patron);
  const t = useTheme();
  const m = useMessages();

  const provider = useMemo(() => resolveBannerProvider(NullBannerProvider), []);
  const usingStub = provider === NullBannerProvider;

  if (!shouldShowBanner({ patron })) return null;

  if (!usingStub) {
    return (
      <View style={styles.wrap}>
        {provider.render({ slot, size: 'standard' }) as React.ReactNode}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        styles.stub,
        { backgroundColor: t.palette.mahoganyDeep, borderTopColor: t.palette.sepia },
      ]}
      accessible
      accessibilityLabel="Advertisement placeholder. Patron subscription removes advertisements."
      accessibilityRole="text"
    >
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 11,
          letterSpacing: 1.8,
        }}
      >
        {m.ads.advertisement} · {m.ads.simulated} · {slot.toUpperCase()}
      </Text>
      <Text
        style={{
          color: t.palette.parchmentDim,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 10,
          marginTop: 2,
        }}
      >
        {m.ads.patronRemoves}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  stub: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
});
