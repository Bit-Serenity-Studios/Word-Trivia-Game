import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlaySurface } from '@/components/PlaySurface';
import { Ledger } from '@/components/Ledger';
import { BookPlate } from '@/components/BookPlate';
import { useGame } from '@/state/gameStore';
import { useLedger } from '@/state/ledgerStore';
import { useEntitlements } from '@/state/entitlementsStore';
import { useDaily } from '@/state/dailyStore';
import { useVolumes } from '@/state/volumeStore';
import { useRewardedAds } from '@/components/RewardedAdProvider';
import { HINT_COST } from '@/game/scoring';
import { economy } from '@/game/economy';
import { getVolume, volumeProgress, type VolumeId } from '@/game/volumes';
import { bundledSource } from '@/content/source';
import { RANKS, type Rank } from '@/game/ranks';
import { unlockedCount } from '@/game/cabinet';
import { useTheme } from '@/theme/ThemeProvider';
import { useHaptics } from '@/hooks/useHaptics';

export default function VolumePlayScreen() {
  const t = useTheme();
  const haptics = useHaptics();
  const ads = useRewardedAds();
  const router = useRouter();

  const params = useLocalSearchParams<{ id: string }>();
  const rawId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
  const volume = rawId ? getVolume(rawId as VolumeId) : null;

  const round = useGame((s) => s.round);
  const phase = useGame((s) => s.phase);
  const mode = useGame((s) => s.mode);
  const activeVolume = useGame((s) => s.activeVolume);
  const isRare = useGame((s) => s.isRare);
  const lastReward = useGame((s) => s.lastReward);
  const wrongFlash = useGame((s) => s.wrongFlash);
  const startNext = useGame((s) => s.startNext);
  const clearRound = useGame((s) => s.clearRound);
  const place = useGame((s) => s.place);
  const returnFromSlot = useGame((s) => s.returnFromSlot);
  const revealHint = useGame((s) => s.revealHint);
  const revealHintFree = useGame((s) => s.revealHintFree);
  const awardBonusInk = useGame((s) => s.awardBonusInk);

  const ink = useLedger((s) => s.ink);
  const streak = useLedger((s) => s.streak);
  const entries = useLedger((s) => s.entries);
  const seenIds = useLedger((s) => s.seenIds);
  const awardInk = useLedger((s) => s.awardInk);
  const hydrated = useLedger((s) => s.hydrated);
  const breakStreak = useLedger((s) => s.breakStreak);

  const hintCredits = useEntitlements((s) => s.hintCredits);
  const consumeHintCredit = useEntitlements((s) => s.consumeHintCredit);
  const patron = useEntitlements((s) => s.patron);

  const bestNightly = useDaily((s) => s.bestStreak);

  const applyRankProgress = useVolumes((s) => s.applyRankProgress);
  const celebrateRankId = useVolumes((s) => s.celebrateRankId);
  const clearRankCelebration = useVolumes((s) => s.clearRankCelebration);
  const volumesHydrated = useVolumes((s) => s.hydrated);
  const setActiveVolume = useVolumes((s) => s.setActive);

  const roundId = round?.question.id ?? null;
  const [rescueDismissed, setRescueDismissed] = useState<string | null>(null);
  const [doubledRound, setDoubledRound] = useState<string | null>(null);
  const roundKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (roundId !== roundKeyRef.current) {
      roundKeyRef.current = roundId;
      setRescueDismissed(null);
    }
  }, [roundId]);

  useEffect(() => {
    if (!hydrated || !volume) return;
    if (mode !== 'volume' || activeVolume !== volume.id || !round) {
      startNext({ volumeId: volume.id });
    }
  }, [hydrated, volume, mode, activeVolume, round, startNext]);

  useEffect(() => {
    if (volume) setActiveVolume(volume.id);
    return () => setActiveVolume(null);
  }, [volume, setActiveVolume]);

  useEffect(() => {
    if (!hydrated || !volumesHydrated) return;
    if (phase !== 'resolving-correct') return;
    const cabinet = unlockedCount(entries);
    applyRankProgress({ entries, cabinet, nightlyBest: bestNightly }, {
      patron,
      awardInk,
    });
  }, [phase, entries, bestNightly, patron, applyRankProgress, awardInk, hydrated, volumesHydrated]);

  const wrongAttempts = round?.wrongAttempts ?? 0;
  const rescueEligible =
    phase === 'playing' &&
    wrongAttempts >= economy.hint.freeAfterFailures &&
    rescueDismissed !== roundId &&
    !patron;

  const onHintPress = useCallback(() => {
    if (hintCredits > 0) {
      if (consumeHintCredit()) {
        revealHintFree();
        haptics.soft();
      }
      return;
    }
    if (ink >= HINT_COST) {
      revealHint();
      haptics.soft();
    }
  }, [hintCredits, consumeHintCredit, revealHintFree, revealHint, ink, haptics]);

  const onRescueAccept = useCallback(async () => {
    const result = await ads.showAd('failure-rescue');
    if (result.rewarded) {
      revealHintFree();
      haptics.success();
    }
    setRescueDismissed(roundId);
  }, [ads, revealHintFree, haptics, roundId]);

  const onRescueDecline = useCallback(() => {
    setRescueDismissed(roundId);
  }, [roundId]);

  const onDoubleReward = useCallback(async () => {
    if (!roundId || lastReward === null || doubledRound === roundId) return;
    const result = await ads.showAd('post-solve-double');
    if (result.rewarded) {
      awardBonusInk(lastReward);
      setDoubledRound(roundId);
      haptics.success();
    }
  }, [ads, roundId, lastReward, doubledRound, awardBonusInk, haptics]);

  const onAdvance = useCallback(() => {
    if (volume) startNext({ volumeId: volume.id });
  }, [volume, startNext]);

  const onBack = useCallback(() => {
    clearRound();
    router.back();
  }, [clearRound, router]);

  const pool = useMemo(() => bundledSource.allQuestions(), []);
  const progress = useMemo(() => {
    if (!volume) return null;
    return volumeProgress(pool, seenIds).find((p) => p.volume.id === volume.id) ?? null;
  }, [pool, seenIds, volume]);

  const celebratedRank: Rank | null = celebrateRankId
    ? RANKS.find((r) => r.id === celebrateRankId) ?? null
    : null;

  if (!volume) {
    return (
      <View style={{ flex: 1, backgroundColor: t.palette.ink, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: t.palette.parchment, fontFamily: t.fonts.display, fontSize: 18 }}>
          Volume not found.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Text style={{ color: t.palette.gold, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
            BACK TO THE SHELF
          </Text>
        </Pressable>
      </View>
    );
  }

  const canHint =
    phase === 'playing' && (hintCredits > 0 || ink >= HINT_COST);
  const hintLabel =
    hintCredits > 0
      ? `REVEAL LETTER  ·  ${hintCredits} in hand`
      : `REVEAL LETTER  ·  ${HINT_COST} ink`;

  return (
    <View style={{ flex: 1 }}>
      <PlaySurface
        round={round}
        phase={phase}
        wrongFlash={wrongFlash}
        lastReward={lastReward}
        header={
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={onBack} style={{ alignSelf: 'flex-start', marginLeft: 8 }}>
              <Text
                style={{
                  color: t.palette.sepia,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 12,
                  letterSpacing: 1.4,
                }}
              >
                ← THE SHELF
              </Text>
            </Pressable>
            <Ledger ink={ink} streak={streak} entries={entries} />
            <Text
              style={{
                color: isRare ? t.palette.gold : t.palette.sepia,
                fontFamily: t.fonts.displayItalic,
                fontSize: 12,
                letterSpacing: 2,
                marginTop: 6,
              }}
            >
              {isRare ? 'SEALED · ' : ''}{volume.title.toUpperCase()}
            </Text>
            {progress ? (
              <Text
                style={{
                  color: t.palette.parchmentDim,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {progress.solved} / {progress.size}
                {isRare ? '  ·  3× reward' : ''}
              </Text>
            ) : null}
          </View>
        }
        primaryActionLabel={hintLabel}
        primaryActionEnabled={canHint}
        onPrimaryAction={onHintPress}
        secondaryActionLabel="SET ASIDE"
        secondaryActionEnabled={phase === 'playing'}
        onSecondaryAction={() => {
          breakStreak();
          onAdvance();
        }}
        onPlace={place}
        onReturn={returnFromSlot}
        resolveActionLabel="NEXT ENTRY →"
        onResolveAction={onAdvance}
        sealLabel={isRare ? 'SEALED VOLUME' : undefined}
        resolveExtra={
          lastReward !== null && roundId ? (
            doubledRound === roundId ? (
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                Doubled by a patron’s broadcast.
              </Text>
            ) : (
              !patron ? (
                <Pressable
                  onPress={onDoubleReward}
                  style={{
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: t.palette.sepia,
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: t.palette.parchment,
                      fontFamily: t.fonts.displayItalic,
                      fontSize: 12,
                      letterSpacing: 1,
                    }}
                  >
                    DOUBLE (WATCH BROADCAST)
                  </Text>
                </Pressable>
              ) : null
            )
          ) : null
        }
      />

      {rescueEligible ? (
        <View style={styles.rescueBar} pointerEvents="box-none">
          <View
            style={[
              styles.rescue,
              { backgroundColor: t.palette.mahogany, borderColor: t.palette.gold },
            ]}
          >
            <Text
              style={{
                color: t.palette.parchment,
                fontFamily: t.fonts.display,
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              The archives will lend a letter.
            </Text>
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              Watch one broadcast and a raven arrives with a revealed letter.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable onPress={onRescueDecline} style={styles.rescueGhost}>
                <Text
                  style={{
                    color: t.palette.sepia,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 12,
                    letterSpacing: 1.1,
                  }}
                >
                  NO, THANK YOU
                </Text>
              </Pressable>
              <Pressable
                onPress={onRescueAccept}
                style={[
                  styles.rescueSolid,
                  { borderColor: t.palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
                ]}
              >
                <Text
                  style={{
                    color: t.palette.gold,
                    fontFamily: t.fonts.displayItalic,
                    fontSize: 12,
                    letterSpacing: 1.1,
                  }}
                >
                  WATCH BROADCAST
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {celebratedRank ? (
        <RankUpOverlay
          rank={celebratedRank}
          onDismiss={clearRankCelebration}
          patron={patron}
        />
      ) : null}

    </View>
  );
}

function RankUpOverlay({
  rank,
  patron,
  onDismiss,
}: {
  rank: Rank;
  patron: boolean;
  onDismiss: () => void;
}) {
  const t = useTheme();
  const reward = patron ? Math.round(rank.inkReward * (1 + economy.ranks.patronBonus)) : rank.inkReward;
  return (
    <View style={styles.overlayScrim}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View
          style={[
            styles.overlayCard,
            { backgroundColor: t.palette.mahoganyDeep, borderColor: t.palette.gold },
          ]}
        >
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              fontSize: 12,
              letterSpacing: 2.4,
              textAlign: 'center',
            }}
          >
            RANK · ADVANCED
          </Text>
          <View style={{ marginTop: 14 }}>
            <BookPlate rank={rank} />
          </View>
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 12,
              paddingHorizontal: 12,
            }}
          >
            {rank.epithet}.
          </Text>
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.display,
              fontSize: 16,
              textAlign: 'center',
              marginTop: 14,
            }}
          >
            +{reward} ink
          </Text>
          <Pressable onPress={onDismiss} style={[styles.overlayBtn, { borderColor: t.palette.gold }]}>
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.displayItalic,
                letterSpacing: 1.2,
              }}
            >
              CONTINUE READING
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rescueBar: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'stretch',
    zIndex: 55,
  },
  rescue: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  rescueGhost: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rescueSolid: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  backPill: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#C9A227',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  overlayScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    zIndex: 70,
  },
  overlayCard: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  overlayBtn: {
    marginTop: 20,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 999,
  },
});
