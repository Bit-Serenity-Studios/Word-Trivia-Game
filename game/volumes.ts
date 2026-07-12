import type { Category, Question } from './types';

export type VolumeId =
  | 'firmament'
  | 'old-empires'
  | 'marginalia'
  | 'cartographers'
  | 'herbarium'
  | 'bestiary'
  | 'painted-wall';

export interface Volume {
  id: VolumeId;
  order: number;
  title: string;
  description: string;
  category: Category;
  cover:
    | 'astrolabe'
    | 'column'
    | 'quill'
    | 'compass'
    | 'fern-spray'
    | 'winged-lion'
    | 'brushstroke';
}

export const VOLUMES: readonly Volume[] = [
  {
    id: 'firmament',
    order: 0,
    title: 'The Firmament',
    description: 'Stars, stones, and the invisible forces that hold the world together.',
    category: 'Natural Philosophy',
    cover: 'astrolabe',
  },
  {
    id: 'old-empires',
    order: 1,
    title: 'Old Empires',
    description: 'The forum, the pyramid, the amphora. Ruins we still translate.',
    category: 'Antiquity',
    cover: 'column',
  },
  {
    id: 'marginalia',
    order: 2,
    title: 'The Marginalia',
    description: 'Sonnet and folio, tragedy and comedy. The shape of the written word.',
    category: 'Letters',
    cover: 'quill',
  },
  {
    id: 'cartographers',
    order: 3,
    title: "The Cartographer's Chest",
    description: 'Meridians, deltas, and strange coastlines pencilled in the dark.',
    category: 'Cartography',
    cover: 'compass',
  },
  {
    id: 'herbarium',
    order: 4,
    title: 'Herbarium & Menagerie',
    description: 'The pressed frond and the pinned wing. A hedgerow catalogued.',
    category: 'Botany & Beasts',
    cover: 'fern-spray',
  },
  {
    id: 'bestiary',
    order: 5,
    title: 'The Chimeric Bestiary',
    description: 'Creatures no naturalist has ever seen, yet every scholar has drawn.',
    category: 'Mythos',
    cover: 'winged-lion',
  },
  {
    id: 'painted-wall',
    order: 6,
    title: 'The Painted Wall',
    description: 'Fresco and portrait, sonata and symphony. The studied arts.',
    category: 'Fine Arts',
    cover: 'brushstroke',
  },
] as const;

const BY_ID: ReadonlyMap<VolumeId, Volume> = new Map(VOLUMES.map((v) => [v.id, v]));
const BY_CATEGORY: ReadonlyMap<Category, Volume> = new Map(VOLUMES.map((v) => [v.category, v]));

export function getVolume(id: VolumeId): Volume | null {
  return BY_ID.get(id) ?? null;
}

export function volumeForCategory(category: Category): Volume {
  const v = BY_CATEGORY.get(category);
  if (!v) throw new Error(`volumeForCategory: no volume for category "${category}"`);
  return v;
}

export function volumeIdForQuestion(question: Question): VolumeId {
  return volumeForCategory(question.category).id;
}

export function volumeSize(pool: readonly Question[], volumeId: VolumeId): number {
  return pool.reduce((n, q) => (volumeIdForQuestion(q) === volumeId ? n + 1 : n), 0);
}

export function questionsInVolume(
  pool: readonly Question[],
  volumeId: VolumeId,
): Question[] {
  return pool.filter((q) => volumeIdForQuestion(q) === volumeId);
}

export const VOLUME_UNLOCK_FRACTION = 0.6;

export function unlockThresholdFor(pool: readonly Question[], volumeId: VolumeId): number {
  const size = volumeSize(pool, volumeId);
  if (size === 0) return 0;
  return Math.ceil(size * VOLUME_UNLOCK_FRACTION);
}

export function solvedInVolume(
  pool: readonly Question[],
  volumeId: VolumeId,
  seenIds: readonly string[],
): number {
  const seen = new Set(seenIds);
  return questionsInVolume(pool, volumeId).reduce(
    (n, q) => (seen.has(q.id) ? n + 1 : n),
    0,
  );
}

export function isVolumeUnlocked(
  pool: readonly Question[],
  volumeId: VolumeId,
  seenIds: readonly string[],
): boolean {
  const target = getVolume(volumeId);
  if (!target) return false;
  if (target.order === 0) return true;
  const prev = VOLUMES.find((v) => v.order === target.order - 1);
  if (!prev) return true;
  return solvedInVolume(pool, prev.id, seenIds) >= unlockThresholdFor(pool, prev.id);
}

export interface VolumeProgress {
  volume: Volume;
  solved: number;
  size: number;
  unlocked: boolean;
  completed: boolean;
  unlockThreshold: number;
}

export function volumeProgress(
  pool: readonly Question[],
  seenIds: readonly string[],
): VolumeProgress[] {
  return VOLUMES.map((volume) => {
    const size = volumeSize(pool, volume.id);
    const solved = solvedInVolume(pool, volume.id, seenIds);
    return {
      volume,
      solved,
      size,
      unlocked: isVolumeUnlocked(pool, volume.id, seenIds),
      completed: size > 0 && solved >= size,
      unlockThreshold: unlockThresholdFor(pool, volume.id),
    };
  });
}
