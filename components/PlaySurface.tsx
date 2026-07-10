import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CandleGlow } from './CandleGlow';
import { DustMotes } from './DustMotes';
import { QuestionCard } from './QuestionCard';
import { AnswerSlots } from './AnswerSlots';
import { TileTray } from './TileTray';
import { WaxSeal } from './WaxSeal';
import { useTheme } from '@/theme/ThemeProvider';
import { useHaptics } from '@/hooks/useHaptics';
import type { RoundState } from '@/game/types';

export interface PlaySurfaceProps {
  round: RoundState | null;
  phase: 'playing' | 'resolving-correct' | 'resolving-wrong' | 'idle';
  wrongFlash: number;
  lastReward: number | null;
  header?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionEnabled?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionEnabled?: boolean;
  resolveActionLabel?: string;
  resolveActionTrailingIcon?: React.ReactNode;
  onResolveAction?: () => void;
  resolveExtra?: React.ReactNode;
  onPlace: (tileId: string) => void;
  onReturn: (slotIndex: number) => void;
  sealLabel?: string;
}

export function PlaySurface(props: PlaySurfaceProps) {
  const t = useTheme();
  const haptics = useHaptics();
  const lastPhase = useRef<PlaySurfaceProps['phase']>(props.phase);

  useEffect(() => {
    if (lastPhase.current !== 'resolving-correct' && props.phase === 'resolving-correct') {
      haptics.success();
    }
    if (lastPhase.current !== 'resolving-wrong' && props.phase === 'resolving-wrong') {
      haptics.error();
    }
    lastPhase.current = props.phase;
  }, [props.phase, haptics]);

  const round = props.round;

  if (!round) {
    return (
      <View style={{ flex: 1, backgroundColor: t.palette.ink }}>
        <CandleGlow />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: t.palette.ink }]}>
      <CandleGlow />
      <DustMotes />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {props.header ? (
          <View style={[styles.header, { paddingHorizontal: t.space.lg, paddingTop: t.space.md }]}>
            {props.header}
          </View>
        ) : null}

        <View style={[styles.middle, { paddingHorizontal: t.space.xl }]}>
          <QuestionCard question={round.question} />
          <View style={{ height: t.space.xl }} />
          <AnswerSlots round={round} shakeKey={props.wrongFlash} onReturn={props.onReturn} />
        </View>

        <View style={[styles.actions, { paddingHorizontal: t.space.lg }]}>
          {props.primaryActionLabel ? (
            <ActionButton
              label={props.primaryActionLabel}
              enabled={props.primaryActionEnabled ?? true}
              onPress={() => {
                haptics.soft();
                props.onPrimaryAction?.();
              }}
            />
          ) : null}
          {props.primaryActionLabel && props.secondaryActionLabel ? (
            <View style={{ width: t.space.md }} />
          ) : null}
          {props.secondaryActionLabel ? (
            <ActionButton
              label={props.secondaryActionLabel}
              variant="ghost"
              enabled={props.secondaryActionEnabled ?? true}
              onPress={() => {
                haptics.soft();
                props.onSecondaryAction?.();
              }}
            />
          ) : null}
        </View>

        <View style={{ padding: t.space.lg }}>
          <TileTray round={round} onTilePress={props.onPlace} />
        </View>
      </SafeAreaView>

      <WaxSeal visible={props.phase === 'resolving-correct'} label={props.sealLabel} />

      {props.phase === 'resolving-correct' ? (
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
            {props.lastReward !== null ? (
              <Text
                style={{
                  color: t.palette.parchmentDim,
                  fontFamily: t.fonts.bodyItalic,
                  fontSize: 14,
                }}
              >
                +{props.lastReward} ink catalogued
              </Text>
            ) : null}
            {props.resolveExtra}
          </View>
          {props.resolveActionLabel ? (
            <Pressable
              onPress={() => {
                haptics.soft();
                props.onResolveAction?.();
              }}
              accessibilityRole="button"
              accessibilityLabel={props.resolveActionLabel}
              style={{
                borderColor: t.palette.gold,
                borderWidth: 1,
                backgroundColor: 'rgba(201, 162, 39, 0.08)',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: t.radii.pill,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: t.palette.gold,
                  fontFamily: t.fonts.displayItalic,
                  fontSize: 16,
                  letterSpacing: 1.2,
                }}
              >
                {props.resolveActionLabel}
              </Text>
              {props.resolveActionTrailingIcon ? (
                <View style={{ marginLeft: 8 }}>{props.resolveActionTrailingIcon}</View>
              ) : null}
            </Pressable>
          ) : null}
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
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
  root: { flex: 1 },
  safe: { flex: 1, zIndex: 10 },
  header: { alignItems: 'center' },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'stretch' },
  actions: { flexDirection: 'row', paddingVertical: 8 },
  resolveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  resolveTextWrap: { alignItems: 'center', marginBottom: 16 },
});
