import type { Messages } from './messages';
import { en } from './en';

export type LocaleCode = 'en';

export const AVAILABLE_LOCALES: readonly LocaleCode[] = ['en'] as const;
export const DEFAULT_LOCALE: LocaleCode = 'en';

const CATALOGS: Record<LocaleCode, Messages> = {
  en,
};

export function messagesFor(locale: LocaleCode): Messages {
  return CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
}

export function localeName(locale: LocaleCode): string {
  return messagesFor(locale).meta.localeName;
}

export function resolveLocale(preferred: string | null | undefined): LocaleCode {
  if (!preferred) return DEFAULT_LOCALE;
  const normalized = preferred.toLowerCase().split(/[-_]/)[0];
  for (const code of AVAILABLE_LOCALES) {
    if (code === normalized) return code;
  }
  return DEFAULT_LOCALE;
}

export type { Messages };
