import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { KenneyIcon } from './icons/KenneyIcons';
import { useTheme } from '@/theme/ThemeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  visible: boolean;
}

export function CoachedArrow({ visible }: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      bounce.value = 0;
      return;
    }
    if (reduced) {
      bounce.value = 0.5;
      return;
    }
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [visible, reduced, bounce]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * -8 }],
    opacity: 0.7 + bounce.value * 0.3,
  }));

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={styles.wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.rotated, animated]}>
        <KenneyIcon kind="arrowRight" color={t.palette.gold} size={28} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  rotated: {
    transform: [{ rotate: '90deg' }],
  },
});
