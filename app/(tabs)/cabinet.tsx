import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CandleGlow } from '@/components/CandleGlow';
import { ArtifactCard } from '@/components/ArtifactCard';
import { FamiliarPanel } from '@/components/FamiliarPanel';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { useTheme } from '@/theme/ThemeProvider';
import { useLedger } from '@/state/ledgerStore';
import { ARTIFACTS, isUnlocked, nextArtifact, unlockedCount, newlyUnlocked } from '@/game/cabinet';
import { useTelemetry } from '@/components/TelemetryProvider';
import { useAnnouncements, ANNOUNCEMENTS } from '@/hooks/useAnnouncements';

export default function CabinetScreen() {
  const t = useTheme();
  const entries = useLedger((s) => s.entries);
  const telemetry = useTelemetry();
  const { announce } = useAnnouncements();
  const total = ARTIFACTS.length;
  const unlocked = unlockedCount(entries);
  const owl = ARTIFACTS.find((a) => a.kind === 'spectral-owl')!;
  const owlUnlocked = isUnlocked(entries, owl);
  const upcoming = nextArtifact(entries);

  const lastEntriesRef = useRef<number>(entries);
  useEffect(() => {
    const prev = lastEntriesRef.current;
    if (entries > prev) {
      const newArtifacts = newlyUnlocked(prev, entries);
      if (newArtifacts.length > 0) {
        telemetry.track('cabinet_unlocked', { total: unlocked });
        for (const artifact of newArtifacts) {
          announce(ANNOUNCEMENTS.cabinetUnlocked(artifact.name));
        }
      }
      lastEntriesRef.current = entries;
    }
  }, [entries, unlocked, telemetry, announce]);

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <SafeAreaView style={{ flex: 1, zIndex: 10 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}
          >
            Cabinet of Curiosities
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {unlocked} of {total} catalogued.{' '}
            {upcoming
              ? `Next: ${upcoming.name} at ${upcoming.entriesRequired} entries (${Math.max(0, upcoming.entriesRequired - entries)} to go).`
              : 'The shelf is complete.'}
          </Text>

          <FamiliarPanel owlUnlocked={owlUnlocked} />

          {unlocked === 0 ? (
            <EmptyState
              heading="The shelf is bare."
              body="Every entry you catalogue leaves something behind: a pressed frond, a beeswax taper, an astrolabe. The first arrives at three entries."
              glyph="candle"
            />
          ) : null}

          <View style={styles.grid}>
            {ARTIFACTS.map((a) => (
              <ArtifactCard key={a.kind} artifact={a} unlocked={isUnlocked(entries, a)} />
            ))}
          </View>
        </ScrollView>
        <AdBanner slot="cabinet-bottom" />
      </SafeAreaView>
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
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
