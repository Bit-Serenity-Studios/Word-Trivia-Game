import type { Question } from './types';
import { solvedInVolume, volumeIdForQuestion, volumeSize, type VolumeId } from './volumes';

export type VolumeCompletionOutcome = 'just-completed' | 'already-completed' | 'not-yet';

export function volumeCompletionCheck(
  pool: readonly Question[],
  volumeId: VolumeId,
  prevSeenIds: readonly string[],
  nextSeenIds: readonly string[],
): VolumeCompletionOutcome {
  const size = volumeSize(pool, volumeId);
  if (size === 0) return 'not-yet';
  const nextSolved = solvedInVolume(pool, volumeId, nextSeenIds);
  if (nextSolved < size) return 'not-yet';
  const prevSolved = solvedInVolume(pool, volumeId, prevSeenIds);
  if (prevSolved < size) return 'just-completed';
  return 'already-completed';
}

export function volumeCountsByTier(
  pool: readonly Question[],
  volumeId: VolumeId,
  seenIds: readonly string[],
): { novice: { solved: number; size: number }; scholar: { solved: number; size: number }; sage: { solved: number; size: number } } {
  const seen = new Set(seenIds);
  const acc = {
    novice: { solved: 0, size: 0 },
    scholar: { solved: 0, size: 0 },
    sage: { solved: 0, size: 0 },
  };
  for (const q of pool) {
    if (volumeIdForQuestion(q) !== volumeId) continue;
    acc[q.tier].size += 1;
    if (seen.has(q.id)) acc[q.tier].solved += 1;
  }
  return acc;
}
