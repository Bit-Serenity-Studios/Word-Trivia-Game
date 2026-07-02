import React, { useCallback } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
interface Props {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressDepth?: number;
  hitSlop?: number;
  accessibilityLabel?: string;
}

export function PressableTile({
  onPress,
  disabled,
  children,
  style,
  pressDepth = 3,
  hitSlop = 6,
  accessibilityLabel,
}: Props) {
  const pressed = useSharedValue<number>(0);

  const onPressIn = useCallback(() => {
    pressed.value = withTiming(1, { duration: 70 });
  }, [pressed]);
  const onPressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: 120 });
  }, [pressed]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * pressDepth }],
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
