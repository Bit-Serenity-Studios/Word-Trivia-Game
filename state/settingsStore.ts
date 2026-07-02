import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from './storage';

export interface SettingsState {
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  setReducedMotion: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      hapticsEnabled: true,
      soundEnabled: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHaptics: (v) => set({ hapticsEnabled: v }),
      setSound: (v) => set({ soundEnabled: v }),
    }),
    {
      name: StorageKeys.settings,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
