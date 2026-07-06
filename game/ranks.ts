import { economy } from './economy';

export type RankId =
  | 'novice-reader'
  | 'reading-room-curator'
  | 'junior-fellow'
  | 'bibliographer'
  | 'archivist'
  | 'master-of-marginalia'
  | 'master-of-athenaeum';

export interface RankRequirement {
  entries: number;
  cabinet: number;
  nightlyBest: number;
}

export interface Rank {
  id: RankId;
  order: number;
  title: string;
  epithet: string;
  require: RankRequirement;
  inkReward: number;
}

export const RANKS: readonly Rank[] = [
  {
    id: 'novice-reader',
    order: 0,
    title: 'Novice Reader',
    epithet: 'newly admitted to the archives',
    require: { entries: 0, cabinet: 0, nightlyBest: 0 },
    inkReward: 0,
  },
  {
    id: 'reading-room-curator',
    order: 1,
    title: 'Curator of the Reading Room',
    epithet: 'first name inked in the register',
    require: { entries: 5, cabinet: 0, nightlyBest: 0 },
    inkReward: 25,
  },
  {
    id: 'junior-fellow',
    order: 2,
    title: 'Junior Fellow',
    epithet: 'granted a candle-desk of one’s own',
    require: { entries: 15, cabinet: 1, nightlyBest: 0 },
    inkReward: 50,
  },
  {
    id: 'bibliographer',
    order: 3,
    title: 'Bibliographer',
    epithet: 'entrusted with the older shelves',
    require: { entries: 30, cabinet: 3, nightlyBest: 0 },
    inkReward: 100,
  },
  {
    id: 'archivist',
    order: 4,
    title: 'Archivist',
    epithet: 'keeps the key to the sealed cabinet',
    require: { entries: 50, cabinet: 5, nightlyBest: 3 },
    inkReward: 150,
  },
  {
    id: 'master-of-marginalia',
    order: 5,
    title: 'Master of Marginalia',
    epithet: 'writes between the lines of the ancients',
    require: { entries: 75, cabinet: 7, nightlyBest: 7 },
    inkReward: 250,
  },
  {
    id: 'master-of-athenaeum',
    order: 6,
    title: 'Master of the Athenaeum',
    epithet: 'the last name written in the founding hand',
    require: { entries: 100, cabinet: 10, nightlyBest: 14 },
    inkReward: 500,
  },
] as const;

export interface ProgressFacts {
  entries: number;
  cabinet: number;
  nightlyBest: number;
}

function meets(req: RankRequirement, facts: ProgressFacts): boolean {
  return (
    facts.entries >= req.entries &&
    facts.cabinet >= req.cabinet &&
    facts.nightlyBest >= req.nightlyBest
  );
}

export function currentRank(facts: ProgressFacts): Rank {
  let highest = RANKS[0]!;
  for (const rank of RANKS) {
    if (meets(rank.require, facts)) highest = rank;
  }
  return highest;
}

export function nextRank(facts: ProgressFacts): Rank | null {
  const now = currentRank(facts);
  const upcoming = RANKS.find((r) => r.order === now.order + 1);
  return upcoming ?? null;
}

export function newlyEarnedRanks(prev: ProgressFacts, next: ProgressFacts): Rank[] {
  const prevOrder = currentRank(prev).order;
  const nextOrder = currentRank(next).order;
  if (nextOrder <= prevOrder) return [];
  return RANKS.filter((r) => r.order > prevOrder && r.order <= nextOrder);
}

export function rankUpReward(rank: Rank, patron: boolean): number {
  const base = rank.inkReward;
  if (!patron) return base;
  return Math.round(base * (1 + economy.ranks.patronBonus));
}

export function progressToNext(facts: ProgressFacts): {
  next: Rank | null;
  ratios: { entries: number; cabinet: number; nightlyBest: number } | null;
} {
  const next = nextRank(facts);
  if (!next) return { next: null, ratios: null };
  const ratio = (have: number, need: number): number => {
    if (need <= 0) return 1;
    return Math.min(1, have / need);
  };
  return {
    next,
    ratios: {
      entries: ratio(facts.entries, next.require.entries),
      cabinet: ratio(facts.cabinet, next.require.cabinet),
      nightlyBest: ratio(facts.nightlyBest, next.require.nightlyBest),
    },
  };
}
