import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CandleGlow } from '@/components/CandleGlow';
import { DustMotes } from '@/components/DustMotes';
import { PlaySurface } from '@/components/PlaySurface';
import {
  ONBOARDING_SLIDES,
  advanceSlide,
  initialOnboardingProgress,
  isSlidesComplete,
  markCoachedCompleted,
} from '@/game/onboarding';
import {
  buildRound,
  checkAnswer,
  clearWrongTiles,
  incrementWrong,
  placeTile,
  returnTile,
} from '@/game/round';
import { mulberry32, seedFromString } from '@/game/rng';
import { bundledSource } from '@/content/source';
import { computeReward } from '@/game/scoring';
import { economy } from '@/game/economy';
import { useOnboarding } from '@/state/onboardingStore';
import { useLedger } from '@/state/ledgerStore';
import { useTelemetry } from '@/components/TelemetryProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { dateKey } from '@/game/daily';
import type { RoundState } from '@/game/types';

type Phase = 'idle' | 'playing' | 'resolving-correct' | 'resolving-wrong';

export default function OnboardingScreen() {
  const t = useTheme();
  const router = useRouter();
  const telemetry = useTelemetry();
  const markCompleted = useOnboarding((s) => s.markCompleted);
  const hydrated = useOnboarding((s) => s.hydrated);
  const alreadyDone = useOnboarding((s) => s.completedAt);
  const awardInk = useLedger((s) => s.awardInk);
  const recordEntry = useLedger((s) => s.recordEntry);
  const ledgerHydrated = useLedger((s) => s.hydrated);

  const [progress, setProgress] = useState(initialOnboardingProgress());
  const [round, setRound] = useState<RoundState | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [wrongFlash, setWrongFlash] = useState(0);
  const [lastReward, setLastReward] = useState<number | null>(null);

  const startedRef = React.useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    if (!hydrated || !ledgerHydrated) return;
    startedRef.current = true;
    telemetry.track('onboarding_started');
  }, [hydrated, ledgerHydrated, telemetry]);

  useEffect(() => {
    if (!hydrated) return;
    if (alreadyDone) router.replace('/play');
  }, [hydrated, alreadyDone, router]);

  const slidesDone = isSlidesComplete(progress);

  useEffect(() => {
    if (!slidesDone || round) return;
    const question =
      bundledSource.getById(economy.onboarding.coachedQuestionId) ??
      bundledSource.getById('bb-fern');
    if (!question) return;
    const rng = mulberry32(seedFromString('onboarding:coached'));
    setRound(buildRound(question, rng));
    setPhase('playing');
  }, [slidesDone, round]);

  const finish = useCallback(() => {
    if (progress.coachedCompleted) return;
    setProgress((p) => markCoachedCompleted(p));
    const stamp = dateKey(new Date());
    markCompleted(stamp);
    telemetry.track('onboarding_completed', { at: stamp });
    router.replace('/play');
  }, [progress.coachedCompleted, markCompleted, telemetry, router]);

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
          hintsUsed: 0,
        });
        awardInk(reward.total);
        recordEntry(next.question.id);
        setRound(next);
        setLastReward(reward.total);
        setPhase('resolving-correct');
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
    [round, phase, awardInk, recordEntry],
  );

  const onReturn = useCallback(
    (slotIndex: number) => {
      if (!round || phase !== 'playing') return;
      setRound(returnTile(round, slotIndex));
    },
    [round, phase],
  );

  if (!hydrated || !ledgerHydrated) {
    return <View style={{ flex: 1, backgroundColor: t.palette.ink }} />;
  }

  if (!slidesDone) {
    const slide = ONBOARDING_SLIDES[progress.slideIndex]!;
    const stepLabel = `${progress.slideIndex + 1} / ${ONBOARDING_SLIDES.length}`;
    const isLast = progress.slideIndex === ONBOARDING_SLIDES.length - 1;
    return (
      <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
        <CandleGlow />
        <DustMotes />
        <SafeAreaView style={styles.slideRoot}>
          <View style={styles.slideInner}>
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.displayItalic,
                fontSize: 12,
                letterSpacing: 2.4,
                marginBottom: 20,
              }}
            >
              {stepLabel}
            </Text>
            <Text
              style={{
                color: t.palette.parchment,
                fontFamily: t.fonts.display,
                fontSize: 34,
                textAlign: 'center',
                lineHeight: 40,
              }}
            >
              {slide.heading}
            </Text>
            <Text
              style={{
                color: t.palette.sepia,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 15,
                textAlign: 'center',
                lineHeight: 24,
                marginTop: 22,
                paddingHorizontal: 10,
              }}
            >
              {slide.body}
            </Text>
            <Pressable
              onPress={() => setProgress(advanceSlide)}
              style={[styles.primary, { borderColor: t.palette.gold }]}
            >
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  letterSpacing: 1.4,
                }}
              >
                {isLast ? 'BEGIN A FIRST ENTRY' : 'CONTINUE'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
                fontSize: 12,
                letterSpacing: 2.4,
              }}
            >
              A FIRST ENTRY
            </Text>
            <Text
              style={{
                color: t.palette.parchmentDim,
                fontFamily: t.fonts.bodyItalic,
                fontSize: 12,
                marginTop: 2,
                textAlign: 'center',
                paddingHorizontal: 20,
              }}
            >
              Tap a brass tile below to place it in the next open slot.
            </Text>
          </View>
        }
        onPlace={onPlace}
        onReturn={onReturn}
        primaryActionEnabled={false}
        onPrimaryAction={() => undefined}
        resolveActionLabel="ENTER THE ATHENAEUM"
        onResolveAction={finish}
        sealLabel="INAUGURATION"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slideRoot: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideInner: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  primary: {
    marginTop: 36,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 162, 39, 0.08)',
  },
});
