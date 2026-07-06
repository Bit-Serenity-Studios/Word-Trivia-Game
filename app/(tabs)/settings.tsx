import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettings } from '@/state/settingsStore';
import { useLedger } from '@/state/ledgerStore';
import { useVolumes } from '@/state/volumeStore';

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useSettings();
  const resetLedger = useLedger((s) => s.reset);
  const resetVolumes = useVolumes((s) => s.reset);
  const reset = () => {
    resetLedger();
    resetVolumes();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <SafeAreaView style={{ flex: 1, padding: t.space.xl }}>
        <Text style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}>
          Settings
        </Text>
        <Row
          label="Reduce motion"
          value={settings.reducedMotion}
          onToggle={() => settings.setReducedMotion(!settings.reducedMotion)}
        />
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
        <View style={{ height: 32 }} />
        <Pressable
          onPress={reset}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: t.palette.burgundy,
            alignSelf: 'flex-start',
          }}
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

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
});
