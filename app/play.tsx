import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { CandleGlow } from '@/components/CandleGlow';
import { DustMotes } from '@/components/DustMotes';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerSlots } from '@/components/AnswerSlots';
import { TileTray } from '@/components/TileTray';
import { WaxSeal } from '@/components/WaxSeal';
import { Ledger } from '@/components/Ledger';
import { useGame } from '@/state/gameStore';
import { useLedger } from '@/state/ledgerStore';
import { useHaptics } from '@/hooks/useHaptics';
import { HINT_COST } from '@/game/scoring';

export default function PlayScreen() {
  const t = useTheme();
  const round = useGame((s) => s.round);
  const phase = useGame((s) => s.phase);
  const lastReward = useGame((s) => s.lastReward);
  const wrongFlash = useGame((s) => s.wrongFlash);
  const startNext = useGame((s) => s.startNext);
  const place = useGame((s) => s.place);
  const returnFromSlot = useGame((s) => s.returnFromSlot);
  const revealHint = useGame((s) => s.revealHint);

  const ink = useLedger((s) => s.ink);
  const streak = useLedger((s) => s.streak);
  const entries = useLedger((s) => s.entries);
  const hydrated = useLedger((s) => s.hydrated);
  const breakStreak = useLedger((s) => s.breakStreak);

  const haptics = useHaptics();
  const lastPhase = useRef<typeof phase>(phase);

  useEffect(() => {
    if (hydrated && !round) startNext();
  }, [hydrated, round, startNext]);

  useEffect(() => {
    if (lastPhase.current !== 'resolving-correct' && phase === 'resolving-correct') {
      haptics.success();
    }
    if (lastPhase.current !== 'resolving-wrong' && phase === 'resolving-wrong') {
      haptics.error();
    }
    lastPhase.current = phase;
  }, [phase, haptics]);

  if (!round) {
    return (
      <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
        <CandleGlow />
      </View>
    );
  }

  const canHint = phase === 'playing' && ink >= HINT_COST;

  return (
    <View style={[styles.root, { backgroundColor: t.palette.ink }]}>
      <CandleGlow />
      <DustMotes />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.hud, { paddingHorizontal: t.space.lg, paddingTop: t.space.md }]}>
          <Ledger ink={ink} streak={streak} entries={entries} />
        </View>

        <View style={[styles.middle, { paddingHorizontal: t.space.xl }]}>
          <QuestionCard question={round.question} />
          <View style={{ height: t.space.xl }} />
          <AnswerSlots round={round} shakeKey={wrongFlash} onReturn={returnFromSlot} />
        </View>

        <View style={[styles.actions, { paddingHorizontal: t.space.lg }]}>
          <ActionButton
            label={`REVEAL LETTER  ·  ${HINT_COST} ink`}
            enabled={canHint}
            onPress={() => {
              const res = revealHint();
              if (res.ok) haptics.soft();
            }}
          />
          <View style={{ width: t.space.md }} />
          <ActionButton
            label="SET ASIDE"
            variant="ghost"
            enabled={phase === 'playing'}
            onPress={() => {
              breakStreak();
              startNext();
            }}
          />
        </View>

        <View style={[styles.tray, { padding: t.space.lg }]}>
          <TileTray round={round} onTilePress={place} />
        </View>
      </SafeAreaView>

      <WaxSeal visible={phase === 'resolving-correct'} />

      {phase === 'resolving-correct' ? (
        <View style={[styles.resolveBar, { paddingBottom: 48 }]} pointerEvents="box-none">
          <View style={styles.resolveTextWrap}>
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.display,
                fontSize: 22,
                marginBottom: 6,
              }}
            >
              {round.question.answer}
            </Text>
            {lastReward !== null ? (
              <Text
                style={{
                  color: t.palette.parchmentDim,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 14,
                }}
              >
                +{lastReward} ink catalogued
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => {
              haptics.soft();
              startNext();
            }}
            style={[
              styles.nextButton,
              {
                borderColor: t.palette.gold,
                backgroundColor: 'rgba(201, 162, 39, 0.08)',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: t.radii.pill,
              },
            ]}
          >
            <Text
              style={{
                color: t.palette.gold,
                fontFamily: t.fonts.displayItalic,
                fontSize: 16,
                letterSpacing: 1.2,
              }}
            >
              NEXT ENTRY →
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  enabled = true,
  variant = 'solid',
}: {
  label: string;
  onPress: () => void;
  enabled?: boolean;
  variant?: 'solid' | 'ghost';
}) {
  const t = useTheme();
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: t.radii.pill,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: enabled ? (solid ? t.palette.gold : t.palette.sepia) : t.palette.sepia,
        backgroundColor: solid && enabled ? 'rgba(201, 162, 39, 0.10)' : 'transparent',
        opacity: enabled ? 1 : 0.5,
      }}
    >
      <Text
        style={{
          color: solid ? t.palette.gold : t.palette.sepia,
          fontFamily: t.fonts.displayItalic,
          fontSize: t.type.buttonLabel.size,
          letterSpacing: t.type.buttonLabel.letterSpacing,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    zIndex: 10,
  },
  hud: {
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tray: {},
  resolveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  resolveTextWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButton: {
    borderWidth: 1,
  },
});
