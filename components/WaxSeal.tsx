import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  visible: boolean;
  label?: string;
}

export function WaxSeal({ visible, label = 'CATALOGUED' }: Props) {
  const t = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      scale.value = 0;
      opacity.value = 0;
      return;
    }
    if (reduced) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    scale.value = withTiming(1, { duration: t.motion.waxSealStamp, easing: Easing.out(Easing.back(1.4)) });
    opacity.value = withDelay(60, withTiming(1, { duration: 220 }));
  }, [visible, reduced, scale, opacity, t.motion.waxSealStamp]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + scale.value * 0.4 }, { rotate: `${t.tilt.sealDeg}deg` }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { zIndex: t.z.seal }, anim]} pointerEvents="none">
      <View
        style={[
          styles.disc,
          {
            backgroundColor: t.palette.burgundy,
            borderColor: t.palette.burgundy,
          },
        ]}
      >
        <View style={[styles.innerRing, { borderColor: 'rgba(233, 210, 210, 0.35)' }]} />
        <Text
          style={{
            color: t.palette.parchment,
            fontFamily: t.fonts.displayItalic,
            fontSize: 15,
            letterSpacing: 2,
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  innerRing: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 54,
    borderWidth: 1,
  },
});
