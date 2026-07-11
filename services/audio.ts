export type MusicTrackId = 'sad-town' | 'sad-descent';

export interface MusicTrack {
  id: MusicTrackId;
  title: string;
  attribution: string;
}

export const MUSIC_TRACKS: readonly MusicTrack[] = [
  { id: 'sad-town', title: 'Sad Town', attribution: 'Kenney (CC0)' },
  { id: 'sad-descent', title: 'Sad Descent', attribution: 'Kenney (CC0)' },
] as const;

export const DEFAULT_MUSIC_ID: MusicTrackId = 'sad-town';

export type SfxId =
  | 'tile-place'
  | 'tile-wrong'
  | 'wax-seal'
  | 'page-turn'
  | 'volume-open'
  | 'volume-complete';

export const SFX_IDS: readonly SfxId[] = [
  'tile-place',
  'tile-wrong',
  'wax-seal',
  'page-turn',
  'volume-open',
  'volume-complete',
] as const;

export interface MusicPlayer {
  play(trackId: MusicTrackId): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  setVolume(volume: number): Promise<void>;
}

export interface SfxPlayer {
  play(id: SfxId): Promise<void>;
}

export const NullMusicPlayer: MusicPlayer = {
  play: () => Promise.resolve(),
  pause: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  setVolume: () => Promise.resolve(),
};

export const NullSfxPlayer: SfxPlayer = {
  play: () => Promise.resolve(),
};

export interface RecordingSfxPlayer extends SfxPlayer {
  events: readonly SfxId[];
  clear(): void;
}

export function createRecordingSfxPlayer(): RecordingSfxPlayer {
  const events: SfxId[] = [];
  return {
    get events(): readonly SfxId[] {
      return events;
    },
    play(id) {
      events.push(id);
      return Promise.resolve();
    },
    clear() {
      events.length = 0;
    },
  };
}

export interface RecordingMusicEvent {
  kind: 'play' | 'pause' | 'stop' | 'setVolume';
  trackId?: MusicTrackId;
  volume?: number;
}

export interface RecordingMusicPlayer extends MusicPlayer {
  events: readonly RecordingMusicEvent[];
  clear(): void;
}

export function createRecordingMusicPlayer(): RecordingMusicPlayer {
  const events: RecordingMusicEvent[] = [];
  return {
    get events(): readonly RecordingMusicEvent[] {
      return events;
    },
    play(trackId) {
      events.push({ kind: 'play', trackId });
      return Promise.resolve();
    },
    pause() {
      events.push({ kind: 'pause' });
      return Promise.resolve();
    },
    stop() {
      events.push({ kind: 'stop' });
      return Promise.resolve();
    },
    setVolume(volume) {
      events.push({ kind: 'setVolume', volume });
      return Promise.resolve();
    },
    clear() {
      events.length = 0;
    },
  };
}
