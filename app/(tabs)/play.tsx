import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VolumeShelf } from '@/components/VolumeShelf';
import { BookPlate } from '@/components/BookPlate';
import { Ledger } from '@/components/Ledger';
import { CandleGlow } from '@/components/CandleGlow';
import { DustMotes } from '@/components/DustMotes';
import { volumeProgress, type VolumeId } from '@/game/volumes';
import { bundledSource } from '@/content/source';
import { currentRank, progressToNext } from '@/game/ranks';
import { useLedger } from '@/state/ledgerStore';
import { useDaily } from '@/state/dailyStore';
import { useVolumes } from '@/state/volumeStore';
import { unlockedCount } from '@/game/cabinet';
import { useTheme } from '@/theme/ThemeProvider';
import { useTelemetry } from '@/components/TelemetryProvider';

export default function PlayShelf() {
  const t = useTheme();
  const router = useRouter();

  const ink = useLedger((s) => s.ink);
  const streak = useLedger((s) => s.streak);
  const entries = useLedger((s) => s.entries);
  const seenIds = useLedger((s) => s.seenIds);
  const ledgerHydrated = useLedger((s) => s.hydrated);
  const bestStreak = useDaily((s) => s.bestStreak);
  const dailyHydrated = useDaily((s) => s.hydrated);

  const volumesHydrated = useVolumes((s) => s.hydrated);
  const initializeRankFloor = useVolumes((s) => s.initializeRankFloor);

  const cabinetCount = unlockedCount(entries);

  const facts = useMemo(
    () => ({ entries, cabinet: cabinetCount, nightlyBest: bestStreak }),
    [entries, cabinetCount, bestStreak],
  );

  useEffect(() => {
    if (ledgerHydrated && dailyHydrated && volumesHydrated) {
      initializeRankFloor(facts);
    }
  }, [ledgerHydrated, dailyHydrated, volumesHydrated, initializeRankFloor, facts]);

  const rank = useMemo(() => currentRank(facts), [facts]);
  const nextStep = useMemo(() => progressToNext(facts), [facts]);

  const pool = useMemo(() => bundledSource.allQuestions(), []);
  const progress = useMemo(() => volumeProgress(pool, seenIds), [pool, seenIds]);

  const telemetry = useTelemetry();
  const unlockedRef = useRef<Set<VolumeId>>(new Set());
  useEffect(() => {
    for (const p of progress) {
      if (p.unlocked && !unlockedRef.current.has(p.volume.id)) {
        unlockedRef.current.add(p.volume.id);
        if (entries > 0) telemetry.track('volume_unlocked', { volume: p.volume.id });
      }
    }
  }, [progress, entries, telemetry]);

  const openVolume = (id: VolumeId) => {
    router.push({ pathname: '/volume/[id]', params: { id } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <DustMotes />
      <SafeAreaView style={{ flex: 1, zIndex: 10 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Ledger ink={ink} streak={streak} entries={entries} />
          </View>
          <View style={{ marginTop: 18, marginBottom: 8 }}>
            <BookPlate rank={rank} />
          </View>
          {nextStep.next ? (
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 20,
                paddingHorizontal: 32,
              }}
            >
              Next rank — {nextStep.next.title}:{' '}
              {formatNextRequirement(facts, nextStep.next.require)}
            </Text>
          ) : (
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.displayItalic,
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              The founding hand has written your name at the top of the register.
            </Text>
          )}
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              fontSize: 12,
              letterSpacing: 2.4,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            THE READING LIST
          </Text>
          <VolumeShelf progress={progress} onOpen={openVolume} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatNextRequirement(
  facts: { entries: number; cabinet: number; nightlyBest: number },
  need: { entries: number; cabinet: number; nightlyBest: number },
): string {
  const parts: string[] = [];
  if (facts.entries < need.entries) parts.push(`${need.entries - facts.entries} more entries`);
  if (facts.cabinet < need.cabinet) parts.push(`${need.cabinet - facts.cabinet} cabinet pieces`);
  if (facts.nightlyBest < need.nightlyBest) {
    parts.push(`a ${need.nightlyBest}-night streak`);
  }
  if (parts.length === 0) return 'requirements met — solve one more entry to promote.';
  return parts.join(', ') + '.';
}
