import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  DEFAULT_MUSIC_ID,
  configureAudioMode,
  createExpoAvMusicPlayer,
  createExpoAvSfxPlayer,
} from '@/services/audioExpoAv';
import {
  NullMusicPlayer,
  NullSfxPlayer,
  type MusicPlayer,
  type SfxPlayer,
} from '@/services/audio';
import { useSettings } from '@/state/settingsStore';

interface AudioContext {
  music: MusicPlayer;
  sfx: SfxPlayer;
  sfxEnabled: boolean;
}

const Ctx = createContext<AudioContext>({
  music: NullMusicPlayer,
  sfx: NullSfxPlayer,
  sfxEnabled: false,
});

export function useMusic(): MusicPlayer {
  return useContext(Ctx).music;
}

export function useSfx(): SfxPlayer {
  const { sfx, sfxEnabled } = useContext(Ctx);
  return useMemo<SfxPlayer>(() => {
    if (!sfxEnabled) return NullSfxPlayer;
    return sfx;
  }, [sfx, sfxEnabled]);
}

interface Props {
  children: React.ReactNode;
  music?: MusicPlayer;
  sfx?: SfxPlayer;
}

export function MusicHost({ children, music, sfx }: Props) {
  const musicEnabled = useSettings((s) => s.musicEnabled);
  const sfxEnabled = useSettings((s) => s.sfxEnabled);

  const configuredRef = useRef(false);
  useEffect(() => {
    if (configuredRef.current) return;
    configuredRef.current = true;
    void configureAudioMode();
  }, []);

  const musicImpl = useMemo<MusicPlayer>(() => music ?? createExpoAvMusicPlayer(), [music]);
  const sfxImpl = useMemo<SfxPlayer>(() => sfx ?? createExpoAvSfxPlayer(), [sfx]);

  useEffect(() => {
    if (musicEnabled) void musicImpl.play(DEFAULT_MUSIC_ID);
    else void musicImpl.pause();
  }, [musicEnabled, musicImpl]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active' && musicEnabled) void musicImpl.play(DEFAULT_MUSIC_ID);
      else void musicImpl.pause();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [musicEnabled, musicImpl]);

  useEffect(() => {
    return () => {
      void musicImpl.stop();
    };
  }, [musicImpl]);

  const value = useMemo<AudioContext>(
    () => ({ music: musicImpl, sfx: sfxImpl, sfxEnabled }),
    [musicImpl, sfxImpl, sfxEnabled],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
