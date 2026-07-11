import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import type { RoundState } from '@/game/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  round: RoundState;
  shakeKey: number;
  onReturn: (slotIndex: number) => void;
}

export function AnswerSlots({ round, shakeKey, onReturn }: Props) {
  const t = useTheme();
  const shake = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (shakeKey === 0) return;
    if (reduced) return;
    shake.value = withSequence(
      withRepeat(withTiming(1, { duration: 60 }), 5, true),
      withTiming(0, { duration: 80 }),
    );
  }, [shakeKey, reduced, shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (shake.value - 0.5) * 12 }],
  }));

  return (
    <Animated.View style={[styles.row, shakeStyle]}>
      {round.slots.map((slot) => {
        const tile = slot.tileId ? round.tilesById[slot.tileId] : null;
        const filled = tile !== null && tile !== undefined;
        const answerChar = round.question.answer.toUpperCase()[slot.index] ?? '';
        const isCorrectSoFar = filled && tile.letter === answerChar;
        const color =
          slot.locked
            ? t.palette.gold
            : filled
              ? isCorrectSoFar
                ? t.palette.parchment
                : t.palette.burgundy
              : t.palette.sepia;

        return (
          <Pressable
            key={slot.index}
            onPress={() => {
              if (!slot.locked && filled) onReturn(slot.index);
            }}
            style={[
              styles.slot,
              {
                width: t.size.slot,
                height: t.size.slot,
                borderRadius: t.radii.slot,
                borderColor: slot.locked ? t.palette.gold : t.palette.sepia,
                backgroundColor: filled
                  ? 'rgba(231, 219, 192, 0.06)'
                  : 'rgba(231, 219, 192, 0.02)',
                marginHorizontal: t.size.slotGap / 2,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              filled
                ? `Slot ${slot.index + 1} of ${round.slots.length}, letter ${tile.letter}`
                : `Slot ${slot.index + 1} of ${round.slots.length}, empty`
            }
            accessibilityHint={filled && !slot.locked ? 'Returns this letter to the tray' : undefined}
            accessibilityState={{ disabled: slot.locked || !filled, selected: slot.locked }}
          >
            <View style={[styles.slotUnderline, { backgroundColor: color, opacity: filled ? 0 : 0.7 }]} />
            {filled ? (
              <Text
                style={{
                  color,
                  fontFamily: t.fonts.display,
                  fontSize: t.type.slotLetter.size,
                  lineHeight: t.type.slotLetter.lineHeight,
                }}
              >
                {tile.letter}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slot: {
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  slotUnderline: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    right: 6,
    height: 2,
  },
});
