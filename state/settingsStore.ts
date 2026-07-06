import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './storage';

export interface SettingsState {
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
  textBoost: boolean;
  setReducedMotion: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setTextBoost: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      hapticsEnabled: true,
      soundEnabled: false,
      highContrast: false,
      textBoost: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHaptics: (v) => set({ hapticsEnabled: v }),
      setSound: (v) => set({ soundEnabled: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      setTextBoost: (v) => set({ textBoost: v }),
    }),
    {
      name: StorageKeys.settings,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
