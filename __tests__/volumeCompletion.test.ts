import questionsData from '../content/questions.json';
import type { Question } from '../game/types';
import { questionsInVolume, VOLUMES } from '../game/volumes';
import {
  volumeCompletionCheck,
  volumeCountsByTier,
} from '../game/volumeCompletion';

const POOL: Question[] = (questionsData as Question[]).map((q) => ({
  ...q,
  answer: q.answer.toUpperCase(),
}));

describe('volumeCompletionCheck', () => {
  it('returns not-yet before every entry is solved', () => {
    const firmamentIds = questionsInVolume(POOL, 'firmament').map((q) => q.id);
    const someButNotAll = firmamentIds.slice(0, firmamentIds.length - 1);
    expect(volumeCompletionCheck(POOL, 'firmament', someButNotAll, someButNotAll)).toBe('not-yet');
  });

  it('returns just-completed exactly on the transition to full', () => {
    const firmamentIds = questionsInVolume(POOL, 'firmament').map((q) => q.id);
    const missingLast = firmamentIds.slice(0, firmamentIds.length - 1);
    const withLast = firmamentIds;
    expect(volumeCompletionCheck(POOL, 'firmament', missingLast, withLast)).toBe('just-completed');
  });

  it('returns already-completed when the volume was already at full before', () => {
    const firmamentIds = questionsInVolume(POOL, 'firmament').map((q) => q.id);
    expect(volumeCompletionCheck(POOL, 'firmament', firmamentIds, firmamentIds)).toBe(
      'already-completed',
    );
  });

  it('does not misfire when the solved id belongs to another volume', () => {
    const firmamentIds = questionsInVolume(POOL, 'firmament').map((q) => q.id).slice(0, 10);
    const oneMoreFromAnother = [...firmamentIds, questionsInVolume(POOL, 'marginalia')[0]!.id];
    expect(volumeCompletionCheck(POOL, 'firmament', firmamentIds, oneMoreFromAnother)).toBe('not-yet');
  });
});

describe('volumeCountsByTier', () => {
  it('sums tier sizes to the total volume size for every volume', () => {
    for (const v of VOLUMES) {
      const size = questionsInVolume(POOL, v.id).length;
      const tiers = volumeCountsByTier(POOL, v.id, []);
      expect(tiers.novice.size + tiers.scholar.size + tiers.sage.size).toBe(size);
      expect(tiers.novice.solved).toBe(0);
      expect(tiers.scholar.solved).toBe(0);
      expect(tiers.sage.solved).toBe(0);
    }
  });

  it('counts solved per tier from a seenIds mix', () => {
    const inVol = questionsInVolume(POOL, 'firmament');
    const noviceEntry = inVol.find((q) => q.tier === 'novice')!;
    const scholarEntry = inVol.find((q) => q.tier === 'scholar')!;
    const sageEntry = inVol.find((q) => q.tier === 'sage')!;
    const seen = [noviceEntry.id, scholarEntry.id, sageEntry.id];
    const tiers = volumeCountsByTier(POOL, 'firmament', seen);
    expect(tiers.novice.solved).toBe(1);
    expect(tiers.scholar.solved).toBe(1);
    expect(tiers.sage.solved).toBe(1);
  });
});
