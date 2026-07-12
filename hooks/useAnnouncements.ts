import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export { ANNOUNCEMENTS } from '@/services/announcements';
export type { AnnouncementVocabulary } from '@/services/announcements';

export interface Announcer {
  announce: (message: string) => void;
  isScreenReaderOn: boolean;
}

export function useAnnouncements(): Announcer {
  const [isScreenReaderOn, setIsScreenReaderOn] = useState(false);
  const readerRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (!mounted) return;
        readerRef.current = enabled;
        setIsScreenReaderOn(enabled);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      readerRef.current = enabled;
      setIsScreenReaderOn(enabled);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const announce = useCallback((message: string) => {
    if (!readerRef.current) return;
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return useMemo<Announcer>(() => ({ announce, isScreenReaderOn }), [announce, isScreenReaderOn]);
}
