import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import appPackage from '../../package.json';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettings } from '@/state/settingsStore';
import { useLedger } from '@/state/ledgerStore';
import { useVolumes } from '@/state/volumeStore';
import { useEntitlements } from '@/state/entitlementsStore';
import { useOnboarding } from '@/state/onboardingStore';
import { useIap } from '@/components/IapHost';
import { useTelemetry } from '@/components/TelemetryProvider';
import { AdBanner } from '@/components/AdBanner';
import { useAdCadence } from '@/state/adCadenceStore';
import { useLocale } from '@/state/localeStore';
import { useMessages } from '@/i18n/useMessages';
import { AVAILABLE_LOCALES, localeName } from '@/i18n';

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useSettings();
  const iap = useIap();
  const telemetry = useTelemetry();
  const m = useMessages();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  const resetLedger = useLedger((s) => s.reset);
  const resetVolumes = useVolumes((s) => s.reset);
  const resetEntitlements = useEntitlements((s) => s.reset);
  const resetOnboarding = useOnboarding((s) => s.reset);
  const resetAdCadence = useAdCadence((s) => s.reset);
  const patron = useEntitlements((s) => s.patron);

  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const reset = () => {
    Alert.alert(m.settings.resetConfirmTitle, m.settings.resetConfirmBody, [
      { text: m.common.cancel, style: 'cancel' },
      {
        text: 'RESET',
        style: 'destructive',
        onPress: () => {
          resetLedger();
          resetVolumes();
          resetEntitlements();
          resetOnboarding();
          resetAdCadence();
          telemetry.track('reset_progress');
        },
      },
    ]);
  };

  const restore = useCallback(async () => {
    const skus = await iap.restore();
    telemetry.track('iap_restored', { count: skus.length });
    setRestoreMessage(
      skus.length > 0 ? m.settings.restored(skus.length) : m.settings.restoredNone,
    );
    setTimeout(() => setRestoreMessage(null), 4000);
  }, [iap, telemetry, m]);

  const share = useCallback(async () => {
    try {
      await Share.share({ message: m.settings.shareMessage });
    } catch {
      // User cancelled or share unavailable.
    }
  }, [m]);

  const version = appPackage.version;
  const runtime = appPackage.dependencies.expo.replace(/^[~^]/, '');

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <SafeAreaView style={{ flex: 1, padding: t.space.xl }}>
        <Text
          style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}
          accessibilityRole="header"
        >
          {m.settings.title}
        </Text>

        <SectionLabel>{m.settings.section.accessibility}</SectionLabel>
        <Row
          label={m.settings.highContrast}
          value={settings.highContrast}
          onToggle={() => settings.setHighContrast(!settings.highContrast)}
        />
        <Row
          label={m.settings.largerText}
          value={settings.textBoost}
          onToggle={() => settings.setTextBoost(!settings.textBoost)}
        />
        <Row
          label={m.settings.reduceMotion}
          value={settings.reducedMotion}
          onToggle={() => settings.setReducedMotion(!settings.reducedMotion)}
        />

        <SectionLabel>{m.settings.section.desk}</SectionLabel>
        <Row
          label={m.settings.haptics}
          value={settings.hapticsEnabled}
          onToggle={() => settings.setHaptics(!settings.hapticsEnabled)}
        />
        <Row
          label={m.settings.sfx}
          value={settings.sfxEnabled}
          onToggle={() => settings.setSfx(!settings.sfxEnabled)}
        />
        <Row
          label={m.settings.music}
          value={settings.musicEnabled}
          onToggle={() => settings.setMusic(!settings.musicEnabled)}
        />

        <SectionLabel>{m.settings.section.language}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {AVAILABLE_LOCALES.map((code) => {
            const active = code === locale;
            return (
              <Pressable
                key={code}
                onPress={() => setLocale(code)}
                accessibilityRole="button"
                accessibilityLabel={localeName(code)}
                accessibilityState={{ selected: active }}
                style={[
                  styles.pill,
                  {
                    marginRight: 8,
                    marginBottom: 8,
                    borderColor: active ? t.palette.gold : t.palette.sepia,
                    backgroundColor: active ? 'rgba(201, 162, 39, 0.10)' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? t.palette.gold : t.palette.parchment,
                    fontFamily: t.fonts.displayItalic,
                    letterSpacing: 1.2,
                  }}
                >
                  {localeName(code).toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionLabel>{m.settings.section.patronage}</SectionLabel>
        <Pressable
          onPress={restore}
          accessibilityRole="button"
          accessibilityLabel={m.settings.restorePurchases}
          accessibilityHint={m.settings.restorePurchasesHint}
          style={[styles.pill, { borderColor: t.palette.gold }]}
        >
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1.2,
            }}
          >
            {m.settings.restorePurchases}
          </Text>
        </Pressable>
        {restoreMessage ? (
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {restoreMessage}
          </Text>
        ) : null}
        {patron ? (
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {m.settings.enrolledAsPatron}
          </Text>
        ) : null}

        <SectionLabel>{m.settings.section.wordOfMouth}</SectionLabel>
        <Pressable
          onPress={share}
          accessibilityRole="button"
          accessibilityLabel={m.settings.share}
          accessibilityHint={m.settings.shareHint}
          style={[styles.pill, { borderColor: t.palette.sepia }]}
        >
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1.2,
            }}
          >
            {m.settings.share}
          </Text>
        </Pressable>

        <SectionLabel>{m.settings.section.about}</SectionLabel>
        <Text
          style={{
            color: t.palette.sepia,
            fontFamily: t.fonts.bodyItalic,
            fontSize: 12,
          }}
        >
          {m.settings.aboutVersion(version, runtime)}
        </Text>

        <View style={{ height: 32 }} />
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel={m.settings.resetProgress}
          accessibilityHint={m.settings.resetHint}
          style={[styles.destructive, { borderColor: t.palette.burgundy }]}
        >
          <Text
            style={{
              color: t.palette.burgundy,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1,
            }}
          >
            {m.settings.resetProgress}
          </Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <AdBanner slot="settings-bottom" />
      </SafeAreaView>
    </View>
  );
}

function Row({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={{
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: t.palette.sepia,
      }}
    >
      <Text style={{ color: t.palette.parchment, fontFamily: t.fonts.body, fontSize: 16 }}>
        {label}
      </Text>
      <View
        style={{
          width: 46,
          height: 26,
          borderRadius: 13,
          backgroundColor: value ? t.palette.gold : t.palette.mahogany,
          alignItems: value ? 'flex-end' : 'flex-start',
          justifyContent: 'center',
          padding: 3,
          borderWidth: 1,
          borderColor: t.palette.sepia,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: value ? t.palette.mahoganyDeep : t.palette.parchment,
          }}
        />
      </View>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.palette.sepia,
        fontFamily: t.fonts.bodyItalic,
        fontSize: 11,
        letterSpacing: 2,
        marginTop: 24,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  destructive: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
