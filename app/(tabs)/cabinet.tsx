import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CandleGlow } from '@/components/CandleGlow';
import { ArtifactCard } from '@/components/ArtifactCard';
import { FamiliarPanel } from '@/components/FamiliarPanel';
import { useTheme } from '@/theme/ThemeProvider';
import { useLedger } from '@/state/ledgerStore';
import { ARTIFACTS, isUnlocked, nextArtifact, unlockedCount } from '@/game/cabinet';

export default function CabinetScreen() {
  const t = useTheme();
  const entries = useLedger((s) => s.entries);
  const total = ARTIFACTS.length;
  const unlocked = unlockedCount(entries);
  const owl = ARTIFACTS.find((a) => a.kind === 'spectral-owl')!;
  const owlUnlocked = isUnlocked(entries, owl);
  const upcoming = nextArtifact(entries);

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <SafeAreaView style={{ flex: 1, zIndex: 10 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: t.palette.parchment, fontFamily: t.fonts.display }]}>
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

          <View style={styles.grid}>
            {ARTIFACTS.map((a) => (
              <ArtifactCard key={a.kind} artifact={a} unlocked={isUnlocked(entries, a)} />
            ))}
          </View>
        </ScrollView>
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
