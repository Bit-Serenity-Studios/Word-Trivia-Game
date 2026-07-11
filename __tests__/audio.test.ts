import {
  DEFAULT_MUSIC_ID,
  MUSIC_TRACKS,
  NullMusicPlayer,
  NullSfxPlayer,
  SFX_IDS,
  createRecordingMusicPlayer,
  createRecordingSfxPlayer,
  type MusicTrackId,
  type SfxId,
} from '../services/audio';

describe('audio vocabulary', () => {
  it('exposes every declared music track with an id, title, and attribution', () => {
    expect(MUSIC_TRACKS.length).toBeGreaterThan(0);
    for (const t of MUSIC_TRACKS) {
      expect(t.id.length).toBeGreaterThan(0);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.attribution.length).toBeGreaterThan(0);
    }
  });

  it('has the DEFAULT_MUSIC_ID inside MUSIC_TRACKS', () => {
    const ids = MUSIC_TRACKS.map((t) => t.id);
    expect(ids).toContain(DEFAULT_MUSIC_ID);
  });

  it('has a Kenney CC0 attribution on every track', () => {
    for (const t of MUSIC_TRACKS) {
      expect(t.attribution.toLowerCase()).toContain('kenney');
      expect(t.attribution.toLowerCase()).toContain('cc0');
    }
  });

  it('exposes a fixed SFX_IDS vocabulary with no duplicates', () => {
    expect(SFX_IDS.length).toBeGreaterThan(0);
    expect(new Set(SFX_IDS).size).toBe(SFX_IDS.length);
  });
});

describe('null players', () => {
  it('NullMusicPlayer accepts every method without throwing', async () => {
    await expect(NullMusicPlayer.play(DEFAULT_MUSIC_ID)).resolves.toBeUndefined();
    await expect(NullMusicPlayer.pause()).resolves.toBeUndefined();
    await expect(NullMusicPlayer.stop()).resolves.toBeUndefined();
    await expect(NullMusicPlayer.setVolume(0.5)).resolves.toBeUndefined();
  });

  it('NullSfxPlayer.play resolves for every declared SfxId', async () => {
    for (const id of SFX_IDS) {
      await expect(NullSfxPlayer.play(id)).resolves.toBeUndefined();
    }
  });
});

describe('recording players', () => {
  it('records music events in order with track ids preserved', async () => {
    const rec = createRecordingMusicPlayer();
    await rec.play('sad-town');
    await rec.setVolume(0.3);
    await rec.pause();
    await rec.stop();
    expect(rec.events).toHaveLength(4);
    expect(rec.events[0]).toEqual({ kind: 'play', trackId: 'sad-town' });
    expect(rec.events[1]).toEqual({ kind: 'setVolume', volume: 0.3 });
    expect(rec.events[2]!.kind).toBe('pause');
    expect(rec.events[3]!.kind).toBe('stop');
  });

  it('records every sfx event and clears on demand', async () => {
    const rec = createRecordingSfxPlayer();
    const trace: SfxId[] = ['tile-place', 'tile-wrong', 'wax-seal'];
    for (const id of trace) {
      await rec.play(id);
    }
    expect(rec.events).toEqual(trace);
    rec.clear();
    expect(rec.events).toHaveLength(0);
  });

  it('MusicTrackId only permits the declared ids at type level (runtime guard)', () => {
    const good: MusicTrackId = 'sad-town';
    expect(MUSIC_TRACKS.map((t) => t.id)).toContain(good);
  });
});
