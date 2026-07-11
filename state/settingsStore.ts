import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './storage';

export interface SettingsState {
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  highContrast: boolean;
  textBoost: boolean;
  setReducedMotion: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setMusic: (v: boolean) => void;
  setSfx: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setTextBoost: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      hapticsEnabled: true,
      musicEnabled: false,
      sfxEnabled: true,
      highContrast: false,
      textBoost: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHaptics: (v) => set({ hapticsEnabled: v }),
      setMusic: (v) => set({ musicEnabled: v }),
      setSfx: (v) => set({ sfxEnabled: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      setTextBoost: (v) => set({ textBoost: v }),
    }),
    {
      name: StorageKeys.settings,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
    },
  ),
);
