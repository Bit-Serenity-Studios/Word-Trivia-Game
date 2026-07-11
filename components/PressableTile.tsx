import React, { useCallback } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
interface Props {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressDepth?: number;
  hitSlop?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; selected?: boolean };
}

export function PressableTile({
  onPress,
  disabled,
  children,
  style,
  pressDepth = 3,
  hitSlop = 6,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: Props) {
  const pressed = useSharedValue<number>(0);
  const reduced = useReducedMotion();
  const effectiveDepth = reduced ? 0 : pressDepth;

  const onPressIn = useCallback(() => {
    pressed.value = reduced ? 1 : withTiming(1, { duration: 70 });
  }, [pressed, reduced]);
  const onPressOut = useCallback(() => {
    pressed.value = reduced ? 0 : withTiming(0, { duration: 120 });
  }, [pressed, reduced]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * effectiveDepth }],
    shadowOpacity: 0.55 - pressed.value * 0.22,
    shadowRadius: 4 - pressed.value * 2,
    shadowOffset: { width: 0, height: 3 - pressed.value * 2 },
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled ?? false, ...accessibilityState }}
    >
      <Animated.View
        style={[
          {
            shadowColor: '#000',
            elevation: 4,
          },
          animated,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
