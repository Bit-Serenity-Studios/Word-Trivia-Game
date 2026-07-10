import { useMemo } from 'react';
import { messagesFor, type Messages } from '.';
import { useLocale } from '@/state/localeStore';

export function useMessages(): Messages {
  const locale = useLocale((s) => s.locale);
  return useMemo(() => messagesFor(locale), [locale]);
}
