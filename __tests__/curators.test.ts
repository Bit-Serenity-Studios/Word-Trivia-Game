import { CURATORS, allLetters, letterFor } from '../game/curators';
import { VOLUMES } from '../game/volumes';

describe('curator letters', () => {
  it('provides a letter for every VolumeId', () => {
    for (const v of VOLUMES) {
      const letter = letterFor(v.id);
      expect(letter).toBeDefined();
      expect(letter.volumeId).toBe(v.id);
    }
  });

  it('has non-empty greeting, farewell, signature, curator name/title', () => {
    for (const v of VOLUMES) {
      const letter = CURATORS[v.id];
      expect(letter.greeting.length).toBeGreaterThan(0);
      expect(letter.farewell.length).toBeGreaterThan(0);
      expect(letter.signature.length).toBeGreaterThan(0);
      expect(letter.curatorName.length).toBeGreaterThan(0);
      expect(letter.curatorTitle.length).toBeGreaterThan(0);
    }
  });

  it('has at least one non-empty paragraph and a completion epigram', () => {
    for (const v of VOLUMES) {
      const letter = CURATORS[v.id];
      expect(letter.paragraphs.length).toBeGreaterThan(0);
      for (const p of letter.paragraphs) {
        expect(p.trim().length).toBeGreaterThan(30);
      }
      expect(letter.completionEpigram.trim().length).toBeGreaterThan(20);
    }
  });

  it('has a unique curator name per volume', () => {
    const names = allLetters().map((l) => l.curatorName);
    expect(new Set(names).size).toBe(names.length);
  });
});
