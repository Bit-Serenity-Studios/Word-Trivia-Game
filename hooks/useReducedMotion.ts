import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSettings } from '@/state/settingsStore';

export function useReducedMotion(): boolean {
  const forced = useSettings((s) => s.reducedMotion);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setSystemReduced(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return forced || systemReduced;
}
