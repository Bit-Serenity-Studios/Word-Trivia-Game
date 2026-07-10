import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CandleGlow } from '@/components/CandleGlow';
import { useTheme } from '@/theme/ThemeProvider';
import { economy } from '@/game/economy';
import { useEntitlements } from '@/state/entitlementsStore';
import { useLedger } from '@/state/ledgerStore';
import { useIap } from '@/components/IapHost';
import { useRewardedAds } from '@/components/RewardedAdProvider';
import { useTelemetry } from '@/components/TelemetryProvider';
import { useHaptics } from '@/hooks/useHaptics';
import { dateKey } from '@/game/daily';
import { AdBanner } from '@/components/AdBanner';

export default function StoreScreen() {
  const t = useTheme();
  const iap = useIap();
  const ads = useRewardedAds();
  const haptics = useHaptics();
  const telemetry = useTelemetry();
  const patron = useEntitlements((s) => s.patron);
  useEffect(() => {
    telemetry.track('store_viewed', { patron });
  }, [telemetry, patron]);
  const hintCredits = useEntitlements((s) => s.hintCredits);
  const markGiftClaimed = useEntitlements((s) => s.markGiftClaimed);
  const hasGiftFor = useEntitlements((s) => s.hasGiftFor);
  const addHintCredits = useEntitlements((s) => s.addHintCredits);
  const awardInk = useLedger((s) => s.awardInk);
  const ink = useLedger((s) => s.ink);

  const today = useMemo(() => dateKey(new Date()), []);
  const giftClaimed = hasGiftFor(today);

  const claimArchivistsGift = async () => {
    if (giftClaimed) return;
    const result = await ads.showAd('archivist-gift');
    if (!result.rewarded) return;
    awardInk(economy.rewardedAd.dailyGiftInk);
    if (economy.rewardedAd.dailyGiftHints > 0) {
      addHintCredits(economy.rewardedAd.dailyGiftHints);
    }
    markGiftClaimed(today);
    haptics.success();
  };

  const buy = async (sku: string) => {
    const result = await iap.purchase(sku);
    if (result.outcome === 'purchased') haptics.success();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <SafeAreaView style={{ flex: 1, zIndex: 10 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}>
            Correspondence
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Notes from patrons, gifts from the archivist. Balance: {ink} ink · {hintCredits} reveals in hand.
          </Text>

          <SectionTitle>The Archivist</SectionTitle>
          <TileButton
            title="Archivist’s Gift"
            body={
              giftClaimed
                ? `Already collected today. Returns tomorrow (${today}).`
                : `Attend a single broadcast; receive +${economy.rewardedAd.dailyGiftInk} ink at your desk.`
            }
            actionLabel={giftClaimed ? 'CLAIMED' : 'ATTEND BROADCAST'}
            disabled={giftClaimed}
            onPress={claimArchivistsGift}
            accent={t.palette.gold}
          />

          <SectionTitle>Patronage</SectionTitle>
          <TileButton
            title={economy.iap.patron.title}
            body={
              patron
                ? 'You are already a patron. Broadcasts will not reach you again.'
                : `${economy.iap.patron.flavor} Includes ${economy.iap.patron.ink} founding ink.`
            }
            actionLabel={patron ? 'ENROLLED' : economy.iap.patron.priceLabel}
            disabled={patron}
            onPress={() => buy(economy.iap.patron.sku)}
            accent={t.palette.gold}
          />

          <SectionTitle>Marginalia · Hint Bundles</SectionTitle>
          <TileButton
            title={economy.iap.hintBundleSmall.title}
            body={economy.iap.hintBundleSmall.flavor}
            actionLabel={economy.iap.hintBundleSmall.priceLabel}
            onPress={() => buy(economy.iap.hintBundleSmall.sku)}
            accent={t.palette.parchment}
          />
          <TileButton
            title={economy.iap.hintBundleLarge.title}
            body={economy.iap.hintBundleLarge.flavor}
            actionLabel={economy.iap.hintBundleLarge.priceLabel}
            onPress={() => buy(economy.iap.hintBundleLarge.sku)}
            accent={t.palette.parchment}
          />

          <SectionTitle>Vials of Ink</SectionTitle>
          <TileButton
            title={economy.iap.inkPackSmall.title}
            body={economy.iap.inkPackSmall.flavor}
            actionLabel={economy.iap.inkPackSmall.priceLabel}
            onPress={() => buy(economy.iap.inkPackSmall.sku)}
            accent={t.palette.parchment}
          />
          <TileButton
            title={economy.iap.inkPackLarge.title}
            body={economy.iap.inkPackLarge.flavor}
            actionLabel={economy.iap.inkPackLarge.priceLabel}
            onPress={() => buy(economy.iap.inkPackLarge.sku)}
            accent={t.palette.parchment}
          />

          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 11,
              marginTop: 18,
              textAlign: 'center',
              letterSpacing: 0.8,
            }}
          >
            Answers are never for sale. Only ink, time, and the occasional letter of introduction.
          </Text>
        </ScrollView>
        <AdBanner slot="store-bottom" />
      </SafeAreaView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.palette.sepia,
        fontFamily: t.fonts.bodyItalic,
        fontSize: 11,
        letterSpacing: 2,
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {String(children).toUpperCase()}
    </Text>
  );
}

function TileButton({
  title,
  body,
  actionLabel,
  onPress,
  disabled,
  accent,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
  disabled?: boolean;
  accent: string;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.tile,
        {
          borderColor: disabled ? t.palette.sepia : accent,
          backgroundColor: 'rgba(231, 219, 192, 0.02)',
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: t.palette.parchment,
            fontFamily: t.fonts.display,
            fontSize: 17,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: t.palette.sepia,
            fontFamily: t.fonts.bodyItalic,
            fontSize: 12,
            marginTop: 3,
            lineHeight: 18,
          }}
        >
          {body}
        </Text>
      </View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${actionLabel}.`}
        accessibilityHint={body}
        accessibilityState={{ disabled: disabled ?? false }}
        style={{
          marginLeft: 12,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: disabled ? t.palette.sepia : accent,
          backgroundColor: disabled ? 'transparent' : 'rgba(201, 162, 39, 0.08)',
        }}
      >
        <Text
          style={{
            color: disabled ? t.palette.sepia : accent,
            fontFamily: t.fonts.displayItalic,
            fontSize: 12,
            letterSpacing: 1.2,
          }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    marginBottom: 4,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
  },
});
