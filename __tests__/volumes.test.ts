import questionsData from '../content/questions.json';
import type { Question } from '../game/types';
import {
  VOLUMES,
  VOLUME_UNLOCK_FRACTION,
  getVolume,
  isVolumeUnlocked,
  questionsInVolume,
  solvedInVolume,
  unlockThresholdFor,
  volumeForCategory,
  volumeIdForQuestion,
  volumeProgress,
  volumeSize,
} from '../game/volumes';

const POOL: Question[] = (questionsData as Question[]).map((q) => ({
  ...q,
  answer: q.answer.toUpperCase(),
}));

describe('volumes taxonomy', () => {
  it('defines exactly 7 volumes in strict order 0..6', () => {
    expect(VOLUMES).toHaveLength(7);
    for (let i = 0; i < VOLUMES.length; i++) {
      expect(VOLUMES[i]!.order).toBe(i);
    }
  });

  it('assigns every question to exactly one volume and covers all 126', () => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const q of POOL) {
      const v = volumeIdForQuestion(q);
      counts.set(v, (counts.get(v) ?? 0) + 1);
      total += 1;
    }
    expect(total).toBe(POOL.length);
    let seen = 0;
    for (const v of VOLUMES) seen += counts.get(v.id) ?? 0;
    expect(seen).toBe(POOL.length);
  });

  it('has strictly non-empty question sets per volume', () => {
    for (const v of VOLUMES) {
      expect(questionsInVolume(POOL, v.id).length).toBeGreaterThan(0);
      expect(volumeSize(POOL, v.id)).toBeGreaterThan(0);
    }
  });

  it('maps categories 1:1 with volumes', () => {
    expect(volumeForCategory('Natural Philosophy').id).toBe('firmament');
    expect(volumeForCategory('Fine Arts').id).toBe('painted-wall');
  });

  it('rejects unknown volume ids gracefully', () => {
    expect(getVolume('not-a-volume' as never)).toBeNull();
  });
});

describe('volume unlock progression', () => {
  it('unlocks the first volume by default', () => {
    expect(isVolumeUnlocked(POOL, 'firmament', [])).toBe(true);
  });

  it('locks subsequent volumes when no progress has been made', () => {
    for (const v of VOLUMES.slice(1)) {
      expect(isVolumeUnlocked(POOL, v.id, [])).toBe(false);
    }
  });

  it('unlocks a volume once its predecessor crosses the threshold', () => {
    const firstSize = volumeSize(POOL, 'firmament');
    const threshold = unlockThresholdFor(POOL, 'firmament');
    expect(threshold).toBe(Math.ceil(firstSize * VOLUME_UNLOCK_FRACTION));

    const firstVolumeIds = questionsInVolume(POOL, 'firmament')
      .slice(0, threshold - 1)
      .map((q) => q.id);
    expect(isVolumeUnlocked(POOL, 'old-empires', firstVolumeIds)).toBe(false);

    const enoughIds = questionsInVolume(POOL, 'firmament')
      .slice(0, threshold)
      .map((q) => q.id);
    expect(isVolumeUnlocked(POOL, 'old-empires', enoughIds)).toBe(true);
  });

  it('reports full progress once every volume is completed', () => {
    const allIds = POOL.map((q) => q.id);
    const progress = volumeProgress(POOL, allIds);
    expect(progress).toHaveLength(7);
    for (const p of progress) {
      expect(p.unlocked).toBe(true);
      expect(p.completed).toBe(true);
      expect(p.solved).toBe(p.size);
    }
  });

  it('counts solved entries per volume from a mixed seen set', () => {
    const someFirmament = questionsInVolume(POOL, 'firmament').slice(0, 3).map((q) => q.id);
    const someLetters = questionsInVolume(POOL, 'marginalia').slice(0, 2).map((q) => q.id);
    const mixed = [...someFirmament, ...someLetters, 'unknown-id'];
    expect(solvedInVolume(POOL, 'firmament', mixed)).toBe(3);
    expect(solvedInVolume(POOL, 'marginalia', mixed)).toBe(2);
    expect(solvedInVolume(POOL, 'painted-wall', mixed)).toBe(0);
  });
});
