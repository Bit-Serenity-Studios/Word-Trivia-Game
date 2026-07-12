import * as Haptics from 'expo-haptics';
import { useSettings } from '@/state/settingsStore';
import { useCallback, useMemo } from 'react';

export function useHaptics() {
  const enabled = useSettings((s) => s.hapticsEnabled);
  const tick = useCallback(() => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [enabled]);
  const success = useCallback(() => {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [enabled]);
  const error = useCallback(() => {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  }, [enabled]);
  const soft = useCallback(() => {
    if (enabled) Haptics.selectionAsync().catch(() => undefined);
  }, [enabled]);
  return useMemo(() => ({ tick, success, error, soft }), [tick, success, error, soft]);
}
