import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CandleGlow } from '@/components/CandleGlow';
import { DustMotes } from '@/components/DustMotes';
import { PlaySurface } from '@/components/PlaySurface';
import { useTheme } from '@/theme/ThemeProvider';
import { useDaily } from '@/state/dailyStore';
import { useLedger } from '@/state/ledgerStore';
import { useEntitlements } from '@/state/entitlementsStore';
import { useTelemetry } from '@/components/TelemetryProvider';
import { bundledSource } from '@/content/source';
import { dailyPickId, dateKey, dailyShareText } from '@/game/daily';
import { mulberry32, seedFromString } from '@/game/rng';
import {
  buildRound,
  checkAnswer,
  clearWrongTiles,
  incrementWrong,
  placeTile,
  returnTile,
} from '@/game/round';
import { revealLetter } from '@/game/hints';
import { computeReward, HINT_COST } from '@/game/scoring';
import type { RoundState } from '@/game/types';

type Phase = 'idle' | 'playing' | 'resolving-correct' | 'resolving-wrong';

export default function DailyScreen() {
  const t = useTheme();
  const todayKey = useMemo(() => dateKey(new Date()), []);
  const dailyIds = useMemo(() => bundledSource.allIds().slice(), []);
  const dailyQuestion = useMemo(() => {
    const id = dailyPickId(todayKey, dailyIds);
    return bundledSource.getById(id)!;
  }, [todayKey, dailyIds]);

  const daily = useDaily();
  const alreadyDoneToday = daily.hydrated && daily.completedToday(todayKey);
  const standingStreak = daily.hydrated ? daily.standingStreak(todayKey) : 0;

  const [entered, setEntered] = useState(false);
  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [wrongFlash, setWrongFlash] = useState(0);
  const [lastReward, setLastReward] = useState<number | null>(null);

  const awardInk = useLedger((s) => s.awardInk);
  const spendInk = useLedger((s) => s.spendInk);
  const ink = useLedger((s) => s.ink);
  const hintCredits = useEntitlements((s) => s.hintCredits);
  const consumeHintCredit = useEntitlements((s) => s.consumeHintCredit);
  const telemetry = useTelemetry();

  useEffect(() => {
    if (!entered) return;
    if (round) return;
    const rng = mulberry32(seedFromString(`daily:${todayKey}`));
    setRound(buildRound(dailyQuestion, rng));
    setPhase('playing');
  }, [entered, round, todayKey, dailyQuestion]);

  const onPlace = useCallback(
    (tileId: string) => {
      if (!round || phase !== 'playing') return;
      const next = placeTile(round, tileId);
      const result = checkAnswer(next);
      if (result === 'incomplete') {
        setRound(next);
        return;
      }
      if (result === 'correct') {
        const reward = computeReward({
          answerLength: next.question.answer.length,
          streakBefore: 0,
          hintsUsed: next.hintsUsed,
        });
        awardInk(reward.total);
        daily.recordCompletion(todayKey, next.question.id, reward.total);
        setRound(next);
        setLastReward(reward.total);
        setPhase('resolving-correct');
        telemetry.track('nightly_completed', {
          key: todayKey,
          category: next.question.category,
          hintsUsed: next.hintsUsed,
          ink: reward.total,
        });
      } else {
        setRound(incrementWrong(next));
        setWrongFlash((n) => n + 1);
        setPhase('resolving-wrong');
        setTimeout(() => {
          setRound((cur) => (cur ? clearWrongTiles(cur) : cur));
          setPhase('playing');
        }, 500);
      }
    },
    [round, phase, awardInk, daily, todayKey, telemetry],
  );

  const onReturn = useCallback(
    (slotIndex: number) => {
      if (!round || phase !== 'playing') return;
      setRound(returnTile(round, slotIndex));
    },
    [round, phase],
  );

  const onHint = useCallback(() => {
    if (!round || phase !== 'playing') return;
    if (hintCredits <= 0 && ink < HINT_COST) return;
    const result = revealLetter(round);
    if (result.revealedIndex === null) return;
    if (hintCredits > 0) {
      if (!consumeHintCredit()) return;
    } else {
      if (!spendInk(HINT_COST)) return;
    }
    const nextRound = result.state;
    const check = checkAnswer(nextRound);
    if (check === 'correct') {
      const reward = computeReward({
        answerLength: nextRound.question.answer.length,
        streakBefore: 0,
        hintsUsed: nextRound.hintsUsed,
      });
      awardInk(reward.total);
      daily.recordCompletion(todayKey, nextRound.question.id, reward.total);
      setLastReward(reward.total);
      setPhase('resolving-correct');
      telemetry.track('nightly_completed', {
        key: todayKey,
        category: nextRound.question.category,
        hintsUsed: nextRound.hintsUsed,
        ink: reward.total,
      });
    }
    setRound(nextRound);
  }, [round, phase, ink, hintCredits, consumeHintCredit, spendInk, awardInk, daily, todayKey, telemetry]);

  const shareResult = useCallback(async () => {
    const message = dailyShareText({
      key: todayKey,
      category: dailyQuestion.category,
      ink: daily.lastReward ?? lastReward ?? 0,
      streak: standingStreak > 0 ? standingStreak : daily.streak,
      hintsUsed: round?.hintsUsed ?? 0,
    });
    try {
      await Share.share({ message });
    } catch {
      // User cancelled or share unavailable; ignore.
    }
  }, [todayKey, dailyQuestion.category, daily.lastReward, daily.streak, lastReward, standingStreak, round]);

  if (!entered) {
    return (
      <IntroScreen
        todayKey={todayKey}
        category={dailyQuestion.category}
        completed={alreadyDoneToday}
        streak={standingStreak}
        bestStreak={daily.bestStreak}
        onStart={() => setEntered(true)}
        onShare={shareResult}
      />
    );
  }

  if (alreadyDoneToday && phase === 'idle') {
    return (
      <CompletedScreen
        todayKey={todayKey}
        category={dailyQuestion.category}
        streak={standingStreak}
        bestStreak={daily.bestStreak}
        answer={dailyQuestion.answer}
        onShare={shareResult}
        onBack={() => setEntered(false)}
      />
    );
  }

  return (
    <PlaySurface
      round={round}
      phase={phase}
      wrongFlash={wrongFlash}
      lastReward={lastReward}
      header={
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            NIGHTLY ENTRY · {todayKey}
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Streak {standingStreak}  ·  Best {daily.bestStreak}
          </Text>
        </View>
      }
      primaryActionLabel={
        hintCredits > 0
          ? `REVEAL LETTER  ·  ${hintCredits} in hand`
          : `REVEAL LETTER  ·  ${HINT_COST} ink`
      }
      primaryActionEnabled={phase === 'playing' && (hintCredits > 0 || ink >= HINT_COST)}
      onPrimaryAction={onHint}
      onPlace={onPlace}
      onReturn={onReturn}
      resolveActionLabel="SHARE RESULT"
      onResolveAction={shareResult}
      sealLabel="NIGHTLY ENTRY"
    />
  );
}

function IntroScreen({
  todayKey,
  category,
  completed,
  streak,
  bestStreak,
  onStart,
  onShare,
}: {
  todayKey: string;
  category: string;
  completed: boolean;
  streak: number;
  bestStreak: number;
  onStart: () => void;
  onShare: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <DustMotes />
      <SafeAreaView style={styles.introRoot}>
        <View style={styles.introInner}>
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 3,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {todayKey}
          </Text>
          <Text
            style={{
              color: t.palette.parchment,
              fontFamily: t.fonts.display,
              fontSize: 38,
              textAlign: 'center',
              lineHeight: 44,
            }}
          >
            The Nightly Entry
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 15,
              textAlign: 'center',
              marginTop: 20,
              lineHeight: 22,
              paddingHorizontal: 16,
            }}
          >
            One curated card. Every scholar sees the same prompt today. Category tonight:{' '}
            <Text style={{ color: t.palette.parchment }}>{category}</Text>.
          </Text>
          <View style={styles.streakRow}>
            <StreakCell label="STREAK" value={String(streak)} />
            <View style={styles.streakDivider} />
            <StreakCell label="BEST" value={String(bestStreak)} />
          </View>
          {completed ? (
            <>
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 15,
                  marginTop: 24,
                }}
              >
                Catalogued for tonight.
              </Text>
              <Pressable onPress={onShare} style={[styles.primary, { borderColor: t.palette.gold, marginTop: 16 }]}>
                <Text style={{ color: t.palette.gold, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
                  SHARE RESULT
                </Text>
              </Pressable>
              <Pressable onPress={onStart} style={[styles.secondary, { borderColor: t.palette.sepia }]}>
                <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
                  RE-READ ENTRY
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={onStart} style={[styles.primary, { borderColor: t.palette.gold, marginTop: 24 }]}>
              <Text style={{ color: t.palette.gold, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
                BEGIN
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function CompletedScreen({
  todayKey,
  category,
  streak,
  bestStreak,
  answer,
  onShare,
  onBack,
}: {
  todayKey: string;
  category: string;
  streak: number;
  bestStreak: number;
  answer: string;
  onShare: () => void;
  onBack: () => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
      <CandleGlow />
      <DustMotes />
      <SafeAreaView style={styles.introRoot}>
        <View style={styles.introInner}>
          <Text
            style={{
              color: t.palette.gold,
              fontFamily: t.fonts.displayItalic,
              letterSpacing: 3,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            NIGHTLY ENTRY · {todayKey}
          </Text>
          <Text style={{ color: t.palette.parchment, fontFamily: t.fonts.display, fontSize: 30, textAlign: 'center' }}>
            {answer}
          </Text>
          <Text
            style={{
              color: t.palette.sepia,
              fontFamily: t.fonts.bodyItalic,
              fontSize: 13,
              marginTop: 6,
              letterSpacing: 1.4,
            }}
          >
            {category.toUpperCase()}
          </Text>
          <View style={styles.streakRow}>
            <StreakCell label="STREAK" value={String(streak)} />
            <View style={styles.streakDivider} />
            <StreakCell label="BEST" value={String(bestStreak)} />
          </View>
          <Pressable onPress={onShare} style={[styles.primary, { borderColor: t.palette.gold, marginTop: 24 }]}>
            <Text style={{ color: t.palette.gold, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
              SHARE RESULT
            </Text>
          </Pressable>
          <Pressable onPress={onBack} style={[styles.secondary, { borderColor: t.palette.sepia }]}>
            <Text style={{ color: t.palette.sepia, fontFamily: t.fonts.displayItalic, letterSpacing: 1.2 }}>
              CLOSE
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StreakCell({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', minWidth: 80 }}>
      <Text style={{ color: t.palette.parchment, fontFamily: t.fonts.display, fontSize: 22 }}>{value}</Text>
      <Text
        style={{
          color: t.palette.sepia,
          fontFamily: t.fonts.bodyItalic,
          fontSize: 11,
          letterSpacing: 1.4,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  introRoot: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  introInner: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  streakRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#8A7355',
    opacity: 0.5,
    marginHorizontal: 20,
  },
  primary: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 162, 39, 0.08)',
  },
  secondary: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginTop: 12,
  },
});
