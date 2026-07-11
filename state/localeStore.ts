import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  type LocaleCode,
  resolveLocale,
} from '@/i18n';

interface LocaleState {
  locale: LocaleCode;
  hydrated: boolean;
  setLocale: (locale: LocaleCode) => void;
  setFromDevicePreference: (preferred: string | null | undefined) => void;
  markHydrated: () => void;
}

const KEY = 'athenaeum:locale:v1';

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      hydrated: false,
      setLocale: (locale) => {
        if (!AVAILABLE_LOCALES.includes(locale)) return;
        set({ locale });
      },
      setFromDevicePreference: (preferred) => {
        set({ locale: resolveLocale(preferred) });
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
