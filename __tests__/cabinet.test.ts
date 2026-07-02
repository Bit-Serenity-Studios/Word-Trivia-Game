import {
  ARTIFACTS,
  isUnlocked,
  unlockedCount,
  nextArtifact,
  newlyUnlocked,
} from '@/game/cabinet';

describe('cabinet unlocks', () => {
  it('has monotonically increasing entry thresholds', () => {
    for (let i = 1; i < ARTIFACTS.length; i++) {
      expect(ARTIFACTS[i]!.entriesRequired).toBeGreaterThan(ARTIFACTS[i - 1]!.entriesRequired);
    }
  });

  it('leaves everything locked at zero entries', () => {
    expect(unlockedCount(0)).toBe(0);
  });

  it('unlocks the Pressed Fern at exactly 3 entries', () => {
    expect(isUnlocked(2, ARTIFACTS[0]!)).toBe(false);
    expect(isUnlocked(3, ARTIFACTS[0]!)).toBe(true);
  });

  it('nextArtifact points at the next locked artifact', () => {
    const next = nextArtifact(7);
    expect(next?.kind).toBe('brass-astrolabe');
  });

  it('nextArtifact returns null when everything is unlocked', () => {
    expect(nextArtifact(1000)).toBeNull();
  });

  it('newlyUnlocked reports artifacts crossed by a single solve', () => {
    const unlocked = newlyUnlocked(9, 10);
    expect(unlocked.map((a) => a.kind)).toEqual(['brass-astrolabe']);
  });

  it('newlyUnlocked can report multiple crossings if the jump is larger', () => {
    const unlocked = newlyUnlocked(2, 10);
    expect(unlocked.map((a) => a.kind)).toEqual([
      'pressed-fern',
      'beeswax-taper',
      'brass-astrolabe',
    ]);
  });
});
