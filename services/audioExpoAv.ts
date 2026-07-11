import { Audio } from 'expo-av';
import type { AVPlaybackSource } from 'expo-av';
import {
  DEFAULT_MUSIC_ID,
  type MusicPlayer,
  type MusicTrackId,
  type SfxId,
  type SfxPlayer,
} from './audio';

type SoundInstance = Audio.Sound;

const MUSIC_SOURCES: Record<MusicTrackId, AVPlaybackSource> = {
  'sad-town': require('../assets/audio/music/sad-town.ogg') as AVPlaybackSource,
  'sad-descent': require('../assets/audio/music/sad-descent.ogg') as AVPlaybackSource,
};

const SFX_SOURCES: Record<SfxId, AVPlaybackSource> = {
  'tile-place': require('../assets/audio/sfx/tile-place.ogg') as AVPlaybackSource,
  'tile-wrong': require('../assets/audio/sfx/tile-wrong.ogg') as AVPlaybackSource,
  'wax-seal': require('../assets/audio/sfx/wax-seal.ogg') as AVPlaybackSource,
  'page-turn': require('../assets/audio/sfx/page-turn.ogg') as AVPlaybackSource,
  'volume-open': require('../assets/audio/sfx/volume-open.ogg') as AVPlaybackSource,
  'volume-complete': require('../assets/audio/sfx/volume-complete.ogg') as AVPlaybackSource,
};

export async function configureAudioMode(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch {
    // Non-fatal on unsupported platforms (web); silent.
  }
}

export function createExpoAvMusicPlayer(): MusicPlayer {
  let current: SoundInstance | null = null;
  let currentTrackId: MusicTrackId | null = null;
  let volume = 0.4;

  const unload = async (): Promise<void> => {
    if (!current) return;
    try {
      await current.stopAsync();
    } catch {
      // Sound already released; ignore.
    }
    try {
      await current.unloadAsync();
    } catch {
      // Sound already released; ignore.
    }
    current = null;
    currentTrackId = null;
  };

  return {
    async play(trackId: MusicTrackId): Promise<void> {
      if (currentTrackId === trackId && current) {
        try {
          await current.playAsync();
        } catch {
          // Player is in a bad state; rebuild below.
        }
        return;
      }
      await unload();
      const source = MUSIC_SOURCES[trackId];
      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume,
      });
      current = sound;
      currentTrackId = trackId;
      await sound.playAsync();
    },
    async pause(): Promise<void> {
      if (!current) return;
      try {
        await current.pauseAsync();
      } catch {
        // Silent.
      }
    },
    async stop(): Promise<void> {
      await unload();
    },
    async setVolume(next: number): Promise<void> {
      volume = Math.max(0, Math.min(1, next));
      if (!current) return;
      try {
        await current.setVolumeAsync(volume);
      } catch {
        // Silent.
      }
    },
  };
}

export function createExpoAvSfxPlayer(): SfxPlayer {
  return {
    async play(id: SfxId): Promise<void> {
      try {
        const source = SFX_SOURCES[id];
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: true,
          volume: 0.6,
        });
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            void sound.unloadAsync().catch(() => undefined);
          }
        });
      } catch {
        // SFX are advisory — never let a playback failure break gameplay.
      }
    },
  };
}

export { DEFAULT_MUSIC_ID };
