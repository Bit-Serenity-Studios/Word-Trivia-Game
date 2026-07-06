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

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useSettings();
  const iap = useIap();
  const telemetry = useTelemetry();

  const resetLedger = useLedger((s) => s.reset);
  const resetVolumes = useVolumes((s) => s.reset);
  const resetEntitlements = useEntitlements((s) => s.reset);
  const resetOnboarding = useOnboarding((s) => s.reset);
  const patron = useEntitlements((s) => s.patron);

  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const reset = () => {
    Alert.alert(
      'Reset the register?',
      'This erases every entry, every unlocked volume, every earned rank, and every purchase on this device. It cannot be undone.',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'RESET',
          style: 'destructive',
          onPress: () => {
            resetLedger();
            resetVolumes();
            resetEntitlements();
            resetOnboarding();
            telemetry.track('reset_progress');
          },
        },
      ],
    );
  };

  const restore = useCallback(async () => {
    const skus = await iap.restore();
    telemetry.track('iap_restored', { count: skus.length });
    setRestoreMessage(
      skus.length > 0
        ? `Restored ${skus.length} purchase${skus.length === 1 ? '' : 's'}.`
        : 'No prior purchases found on this device.',
    );
    setTimeout(() => setRestoreMessage(null), 4000);
  }, [iap, telemetry]);

  const share = useCallback(async () => {
    try {
      await Share.share({
        message:
          'The Athenaeum — a candle-lit trivia game for Dark Academia readers. Come catalogue the world one word at a time.',
      });
    } catch {
      // User cancelled or share unavailable.
    }
  }, []);

  const version = appPackage.version;
  const runtime = appPackage.dependencies.expo.replace(/^[~^]/, '');

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <SafeAreaView style={{ flex: 1, padding: t.space.xl }}>
        <Text
          style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}
          accessibilityRole="header"
        >
          Settings
        </Text>

        <SectionLabel>ACCESSIBILITY</SectionLabel>
        <Row
          label="High contrast"
          value={settings.highContrast}
          onToggle={() => settings.setHighContrast(!settings.highContrast)}
        />
        <Row
          label="Larger text"
          value={settings.textBoost}
          onToggle={() => settings.setTextBoost(!settings.textBoost)}
        />
        <Row
          label="Reduce motion"
          value={settings.reducedMotion}
          onToggle={() => settings.setReducedMotion(!settings.reducedMotion)}
        />

        <SectionLabel>DESK</SectionLabel>
        <Row
          label="Haptics"
          value={settings.hapticsEnabled}
          onToggle={() => settings.setHaptics(!settings.hapticsEnabled)}
        />
        <Row
          label="Ambience"
          value={settings.soundEnabled}
          onToggle={() => settings.setSound(!settings.soundEnabled)}
        />

        <SectionLabel>PATRONAGE</SectionLabel>
        <Pressable
          onPress={restore}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          accessibilityHint="Re-applies any prior purchases from this account"
          style={[styles.pill, { borderColor: t.palette.gold }]}
        >
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1.2,
            }}
          >
            RESTORE PURCHASES
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
            Enrolled as a Patron of the Athenaeum.
          </Text>
        ) : null}

        <SectionLabel>WORD OF MOUTH</SectionLabel>
        <Pressable
          onPress={share}
          accessibilityRole="button"
          accessibilityLabel="Share the Athenaeum"
          accessibilityHint="Opens the system share sheet"
          style={[styles.pill, { borderColor: t.palette.sepia }]}
        >
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1.2,
            }}
          >
            SHARE THE ATHENAEUM
          </Text>
        </Pressable>

        <SectionLabel>ABOUT</SectionLabel>
        <Text
          style={{
            color: t.palette.sepia,
            fontFamily: t.fonts.bodyItalic,
            fontSize: 12,
          }}
        >
          Version {version}  ·  Expo {runtime}
        </Text>

        <View style={{ height: 32 }} />
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Reset progress"
          accessibilityHint="Erases every entry, unlock, and purchase on this device"
          style={[styles.destructive, { borderColor: t.palette.burgundy }]}
        >
          <Text
            style={{
              color: t.palette.burgundy,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 1,
            }}
          >
            RESET PROGRESS
          </Text>
        </Pressable>
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
