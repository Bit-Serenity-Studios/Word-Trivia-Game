import { DEFAULT_MUSIC_ID, NullMusicPlayer, NullSfxPlayer, type MusicPlayer, type SfxPlayer } from './audio';

export async function configureAudioMode(): Promise<void> {
  return;
}

export function createExpoAvMusicPlayer(): MusicPlayer {
  return NullMusicPlayer;
}

export function createExpoAvSfxPlayer(): SfxPlayer {
  return NullSfxPlayer;
}

export { DEFAULT_MUSIC_ID };
