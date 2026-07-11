import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CandleGlow() {
  const t = useTheme();
  const reduced = useReducedMotion();
  const flicker = useSharedValue<number>(t.opacity.candleGlowHigh);

  useEffect(() => {
    if (reduced) {
      flicker.value = t.opacity.candleGlowLow;
      return;
    }
    flicker.value = withRepeat(
      withSequence(
        withTiming(t.opacity.candleGlowLow, { duration: t.motion.candleFlickerMin }),
        withTiming(t.opacity.candleGlowHigh, { duration: t.motion.candleFlickerMax }),
      ),
      -1,
      true,
    );
  }, [reduced, flicker, t]);

  const animated = useAnimatedStyle(() => ({ opacity: flicker.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animated, { zIndex: t.z.candle }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="38%" r="55%">
            <Stop offset="0%" stopColor={t.palette.candle} stopOpacity={0.95} />
            <Stop offset="40%" stopColor={t.palette.candle} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={t.palette.ink} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#glow)" />
      </Svg>
      <View style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}
