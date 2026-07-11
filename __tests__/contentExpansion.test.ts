import questionsData from '../content/questions.json';
import type { Question } from '../game/types';
import {
  VOLUMES,
  questionsInVolume,
  volumeIdForQuestion,
} from '../game/volumes';

const POOL: Question[] = (questionsData as Question[]).map((q) => ({
  ...q,
  answer: q.answer.toUpperCase(),
}));

describe('content expansion', () => {
  it('contains 210 total entries', () => {
    expect(POOL.length).toBe(210);
  });

  it('has exactly 30 entries per volume', () => {
    for (const v of VOLUMES) {
      expect(questionsInVolume(POOL, v.id).length).toBe(30);
    }
  });

  it('has at least 4 novice / 5 scholar / 3 sage per volume', () => {
    for (const v of VOLUMES) {
      const entries = questionsInVolume(POOL, v.id);
      const novice = entries.filter((q) => q.tier === 'novice').length;
      const scholar = entries.filter((q) => q.tier === 'scholar').length;
      const sage = entries.filter((q) => q.tier === 'sage').length;
      expect(novice).toBeGreaterThanOrEqual(4);
      expect(scholar).toBeGreaterThanOrEqual(5);
      expect(sage).toBeGreaterThanOrEqual(3);
    }
  });

  it('has no duplicate ids or answers across the whole pool', () => {
    const ids = new Set<string>();
    const answers = new Set<string>();
    for (const q of POOL) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(answers.has(q.answer)).toBe(false);
      answers.add(q.answer);
    }
  });

  it('has answers within the 3-12 character envelope', () => {
    for (const q of POOL) {
      expect(q.answer.length).toBeGreaterThanOrEqual(3);
      expect(q.answer.length).toBeLessThanOrEqual(12);
    }
  });

  it('routes every question to a real volume', () => {
    for (const q of POOL) {
      expect(() => volumeIdForQuestion(q)).not.toThrow();
    }
  });
});
