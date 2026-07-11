import type { Question, RNG, Tier } from '@/game/types';
import { shuffled } from '@/game/rng';
import { tierForEntries } from '@/game/difficulty';
import { type VolumeId, volumeIdForQuestion } from '@/game/volumes';
import { isRareCandidate } from '@/game/rareVolume';
import questionsData from './questions.json';

const ALL: Question[] = (questionsData as Question[]).map((q) => ({
  ...q,
  answer: q.answer.toUpperCase(),
}));

export interface QuestionSource {
  nextQuestion(context: { entriesSolved: number; seenIds: readonly string[]; rng: RNG }): Question;
  getById(id: string): Question | null;
  allIds(): readonly string[];
}

export class BundledSource implements QuestionSource {
  private readonly all: readonly Question[];
  private readonly byId: Map<string, Question>;

  constructor(all: readonly Question[] = ALL) {
    this.all = all;
    this.byId = new Map(all.map((q) => [q.id, q]));
  }

  nextQuestion(context: { entriesSolved: number; seenIds: readonly string[]; rng: RNG }): Question {
    const tier = tierForEntries(context.entriesSolved);
    const seen = new Set(context.seenIds);
    const pickFrom = (pool: readonly Question[]): Question | null => {
      const unseen = pool.filter((q) => !seen.has(q.id));
      const roster = unseen.length > 0 ? unseen : pool;
      const [head] = shuffled(roster, context.rng);
      return head ?? null;
    };

    const inTier = this.all.filter((q) => q.tier === tier);
    const pick = pickFrom(inTier) ?? pickFrom(this.all);
    if (!pick) throw new Error('BundledSource: empty question pool');
    return pick;
  }

  getById(id: string): Question | null {
    return this.byId.get(id) ?? null;
  }

  allIds(): readonly string[] {
    return this.all.map((q) => q.id);
  }

  allQuestions(): readonly Question[] {
    return this.all;
  }

  filterByVolume(volumeId: VolumeId): Question[] {
    return this.all.filter((q) => volumeIdForQuestion(q) === volumeId);
  }

  nextInVolume(context: {
    volumeId: VolumeId;
    seenIds: readonly string[];
    rng: RNG;
  }): Question {
    const pool = this.filterByVolume(context.volumeId);
    if (pool.length === 0) throw new Error(`BundledSource: no questions in volume "${context.volumeId}"`);
    const seen = new Set(context.seenIds);
    const unseen = pool.filter((q) => !seen.has(q.id));
    const roster = unseen.length > 0 ? unseen : pool;
    const [head] = shuffled(roster, context.rng);
    if (!head) throw new Error(`BundledSource: empty roster in volume "${context.volumeId}"`);
    return head;
  }

  pickRareInVolume(context: {
    volumeId: VolumeId;
    seenIds: readonly string[];
    rng: RNG;
  }): Question | null {
    const pool = this.filterByVolume(context.volumeId).filter(isRareCandidate);
    if (pool.length === 0) return null;
    const seen = new Set(context.seenIds);
    const unseen = pool.filter((q) => !seen.has(q.id));
    const roster = unseen.length > 0 ? unseen : pool;
    const [head] = shuffled(roster, context.rng);
    return head ?? null;
  }
}

export function idsByTier(source: BundledSource, tier: Tier): string[] {
  return source
    .allIds()
    .map((id) => source.getById(id))
    .filter((q): q is Question => q !== null && q.tier === tier)
    .map((q) => q.id);
}

export const bundledSource = new BundledSource();
