import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MoteConfig {
  x: number;
  y: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
}

function Mote({ config }: { config: MoteConfig }) {
  const t = useTheme();
  const progress = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    progress.value = withRepeat(
      withTiming(1, { duration: config.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduced, progress, config.duration]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * config.drift * -1 }],
    opacity: t.opacity.dustMote * (0.6 + progress.value * 0.4),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: t.palette.parchment,
        },
        style,
      ]}
    />
  );
}

export function DustMotes({ count = 14 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const t = useTheme();
  const motes = useMemo<MoteConfig[]>(() => {
    const list: MoteConfig[] = [];
    for (let i = 0; i < count; i++) {
      const seed = (i * 9301 + 49297) % 233280;
      const rnd = (n: number) => ((seed * (n + 1)) % 100) / 100;
      list.push({
        x: rnd(1) * width,
        y: rnd(2) * height,
        size: 2 + rnd(3) * 3,
        drift: 30 + rnd(4) * 40,
        duration: 8000 + rnd(5) * 6000,
        delay: rnd(6) * 2000,
      });
    }
    return list;
  }, [count, width, height]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { zIndex: t.z.motes }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {motes.map((c, i) => (
        <Mote key={i} config={c} />
      ))}
    </Animated.View>
  );
}
