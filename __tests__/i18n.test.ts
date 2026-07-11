import {
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  localeName,
  messagesFor,
  resolveLocale,
} from '../i18n';
import { en } from '../i18n/en';
import type { Messages } from '../i18n/messages';

const REQUIRED_KEYS: readonly (keyof Messages)[] = [
  'meta',
  'common',
  'tabs',
  'settings',
  'onboarding',
  'play',
  'ranks',
  'rescue',
  'volume',
  'curator',
  'completion',
  'nightly',
  'store',
  'cabinet',
  'familiar',
  'notification',
  'announcement',
  'ads',
];

describe('i18n vocabulary', () => {
  it('has English as the default and only ships bundles for AVAILABLE_LOCALES', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(AVAILABLE_LOCALES).toContain('en');
    for (const code of AVAILABLE_LOCALES) {
      expect(messagesFor(code)).toBeDefined();
    }
  });

  it('exposes a native localeName for every available locale', () => {
    for (const code of AVAILABLE_LOCALES) {
      expect(localeName(code).length).toBeGreaterThan(0);
    }
  });

  it('exposes every top-level namespace in every available bundle', () => {
    for (const code of AVAILABLE_LOCALES) {
      const bundle = messagesFor(code);
      for (const key of REQUIRED_KEYS) {
        expect(bundle[key]).toBeDefined();
      }
    }
  });

  it('has non-empty English strings for every leaf field the app actually renders', () => {
    const bundle = en;
    expect(bundle.settings.title.length).toBeGreaterThan(0);
    expect(bundle.tabs.play.length).toBeGreaterThan(0);
    expect(bundle.play.setAside.length).toBeGreaterThan(0);
    expect(bundle.completion.header.length).toBeGreaterThan(0);
    expect(bundle.curator.beginTheVolume.length).toBeGreaterThan(0);
    expect(bundle.notification.heading.length).toBeGreaterThan(0);
    expect(bundle.ads.advertisement.length).toBeGreaterThan(0);
  });
});

describe('interpolation and pluralization', () => {
  it('interpolates ink counts through the play surface functions', () => {
    expect(en.play.revealLetterInk(15)).toContain('15');
    expect(en.play.revealLetterCredits(4)).toContain('4');
    expect(en.play.inkCatalogued(22)).toContain('22');
  });

  it('interpolates volume and question data', () => {
    expect(en.play.volumeProgress(5, 30)).toBe('5 / 30');
    expect(en.completion.inkReward(100)).toContain('100');
    expect(en.volume.volumeNumber(3)).toContain('03');
  });

  it('handles English plurals in restored count', () => {
    expect(en.settings.restored(1).toLowerCase()).toContain('purchase.');
    expect(en.settings.restored(3).toLowerCase()).toContain('purchases.');
  });

  it('interpolates announcement runtime values', () => {
    expect(en.announcement.entrySolved(22)).toContain('22');
    expect(en.announcement.rankUp('Archivist', 150)).toContain('Archivist');
    expect(en.announcement.rankUp('Archivist', 150)).toContain('150');
    expect(en.announcement.volumeCompleted('The Firmament')).toContain('The Firmament');
    expect(en.announcement.cabinetUnlocked('Pressed Fern')).toContain('Pressed Fern');
  });

  it('has step labels that include both numerator and denominator', () => {
    const label = en.onboarding.stepLabel(2, 3);
    expect(label).toContain('2');
    expect(label).toContain('3');
  });
});

describe('resolveLocale', () => {
  it('returns the default locale when the preference is null or empty', () => {
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
  });

  it('returns the matching locale for a case-insensitive language tag', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('EN')).toBe('en');
  });

  it('extracts the language from a full BCP-47 tag', () => {
    expect(resolveLocale('en-US')).toBe('en');
    expect(resolveLocale('en_GB')).toBe('en');
  });

  it('falls back to the default when the language is unsupported', () => {
    expect(resolveLocale('fr')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('zz-XX')).toBe(DEFAULT_LOCALE);
  });
});
