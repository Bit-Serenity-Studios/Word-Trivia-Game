export type ArtifactKind =
  | 'pressed-fern'
  | 'beeswax-taper'
  | 'brass-astrolabe'
  | 'spectral-owl'
  | 'philosophers-tome'
  | 'amber-amulet'
  | 'moth-specimen'
  | 'star-chart'
  | 'reliquary'
  | 'mnemonic-wheel';

export interface Artifact {
  kind: ArtifactKind;
  name: string;
  flavor: string;
  entriesRequired: number;
}

export const ARTIFACTS: readonly Artifact[] = [
  {
    kind: 'pressed-fern',
    name: 'Pressed Fern',
    flavor: 'The first frond, kept between two leaves of vellum.',
    entriesRequired: 3,
  },
  {
    kind: 'beeswax-taper',
    name: 'Beeswax Taper',
    flavor: 'A candle for the longer nights of study.',
    entriesRequired: 6,
  },
  {
    kind: 'brass-astrolabe',
    name: 'Brass Astrolabe',
    flavor: 'A polished disc that measures the height of stars.',
    entriesRequired: 10,
  },
  {
    kind: 'spectral-owl',
    name: 'Spectral Owl',
    flavor: 'The familiar arrives, half-real, half-remembered.',
    entriesRequired: 15,
  },
  {
    kind: 'philosophers-tome',
    name: "Philosopher's Tome",
    flavor: 'A dense volume whose margins bristle with older annotations.',
    entriesRequired: 22,
  },
  {
    kind: 'amber-amulet',
    name: 'Amber Amulet',
    flavor: 'A fossilised insect suspended in warm honeyed stone.',
    entriesRequired: 30,
  },
  {
    kind: 'moth-specimen',
    name: 'Moth Specimen',
    flavor: 'Pinned open beneath glass, its wings still catch the candle.',
    entriesRequired: 40,
  },
  {
    kind: 'star-chart',
    name: 'Star Chart',
    flavor: 'Constellations inked in silver, drawn from an older sky.',
    entriesRequired: 55,
  },
  {
    kind: 'reliquary',
    name: 'Reliquary',
    flavor: 'A small chased box for keeping what should not be forgotten.',
    entriesRequired: 75,
  },
  {
    kind: 'mnemonic-wheel',
    name: 'Mnemonic Wheel',
    flavor: "Ramon Llull's turning disc for combining all the arts of memory.",
    entriesRequired: 100,
  },
] as const;

export function isUnlocked(entriesSolved: number, artifact: Artifact): boolean {
  return entriesSolved >= artifact.entriesRequired;
}

export function unlockedCount(entriesSolved: number): number {
  return ARTIFACTS.filter((a) => isUnlocked(entriesSolved, a)).length;
}

export function nextArtifact(entriesSolved: number): Artifact | null {
  return ARTIFACTS.find((a) => !isUnlocked(entriesSolved, a)) ?? null;
}

export function newlyUnlocked(prevEntries: number, nextEntries: number): Artifact[] {
  return ARTIFACTS.filter(
    (a) => a.entriesRequired > prevEntries && a.entriesRequired <= nextEntries,
  );
}
