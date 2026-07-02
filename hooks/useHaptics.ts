import * as Haptics from 'expo-haptics';
import { useSettings } from '@/state/settingsStore';
import { useCallback } from 'react';

export function useHaptics() {
  const enabled = useSettings((s) => s.hapticsEnabled);
  return {
    tick: useCallback(() => {
      if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }, [enabled]),
    success: useCallback(() => {
      if (enabled)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }, [enabled]),
    error: useCallback(() => {
      if (enabled)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    }, [enabled]),
    soft: useCallback(() => {
      if (enabled) Haptics.selectionAsync().catch(() => undefined);
    }, [enabled]),
  };
}
