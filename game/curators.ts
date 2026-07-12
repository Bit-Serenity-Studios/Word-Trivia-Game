import { VOLUMES, type VolumeId } from './volumes';

export interface CuratorLetter {
  volumeId: VolumeId;
  curatorName: string;
  curatorTitle: string;
  signature: string;
  greeting: string;
  paragraphs: readonly string[];
  farewell: string;
  completionEpigram: string;
}

export const CURATORS: Readonly<Record<VolumeId, CuratorLetter>> = {
  firmament: {
    volumeId: 'firmament',
    curatorName: 'Beatrix Wren',
    curatorTitle: 'Keeper of the Firmament',
    signature: 'B. Wren',
    greeting: 'Reader,',
    paragraphs: [
      'What the eye admits into the observatory is nothing more than the same light our ancestors watched, only a little older. When I catalogued the entries in this volume, I felt I was setting down the names of very distant relatives.',
      'Take your time. The stones and the stars do not hurry, and neither should you.',
    ],
    farewell: 'Yours by candlelight,',
    completionEpigram: 'The Firmament is catalogued. Look up from these pages.',
  },
  'old-empires': {
    volumeId: 'old-empires',
    curatorName: 'Ambrose Halloway',
    curatorTitle: 'Antiquary',
    signature: 'A. Halloway',
    greeting: 'Reader,',
    paragraphs: [
      'I have spent more years than I care to admit walking the ruins of empire, dusting off broken things. Every entry in this volume is a fragment I would have carried home myself, could I have carried it.',
      'Read carefully. The past is a country whose language we can only partly recover.',
    ],
    farewell: 'From the ruins,',
    completionEpigram: 'Old Empires is catalogued. The dust settles a little.',
  },
  marginalia: {
    volumeId: 'marginalia',
    curatorName: 'Cordelia Pemberton',
    curatorTitle: 'Librarian',
    signature: 'C. Pemberton',
    greeting: 'Reader,',
    paragraphs: [
      'A book is nothing but a long conversation held across the years. This volume gathers the words we use to describe the writing, the vessels the writing was carried in, and the small forms the writing arranges itself into.',
      'Fill in the entries slowly. This is not a place for haste.',
    ],
    farewell: 'From the reading room,',
    completionEpigram: 'The Marginalia is catalogued. The margin, at last, is written full.',
  },
  cartographers: {
    volumeId: 'cartographers',
    curatorName: 'Ezra Fenwick',
    curatorTitle: 'Surveyor',
    signature: 'E. Fenwick',
    greeting: 'Reader,',
    paragraphs: [
      'To draw a coastline is to lie a little. The line one records is only ever the seam of the day one walked it. The tide moves, the cliffs fall, the map is out of date the moment the ink is dry.',
      'Yet we draw them anyway, and here are the words we use.',
    ],
    farewell: 'Ashore, at last,',
    completionEpigram: "The Cartographer's Chest is catalogued. Every seam of the coast is named.",
  },
  herbarium: {
    volumeId: 'herbarium',
    curatorName: 'Prudence Ashfield',
    curatorTitle: 'Naturalist',
    signature: 'P. Ashfield',
    greeting: 'Reader,',
    paragraphs: [
      'A hedgerow at dusk is a small parliament of specimens. The badger runs, the primrose closes, the moth writes its brief sentence in the porch-light.',
      'This volume is my attempt to gather them by name.',
    ],
    farewell: 'From the hedgerow,',
    completionEpigram: 'Herbarium & Menagerie is catalogued. Every specimen is named.',
  },
  bestiary: {
    volumeId: 'bestiary',
    curatorName: 'Silas Wrenwick',
    curatorTitle: 'Folklorist',
    signature: 'S. Wrenwick',
    greeting: 'Reader,',
    paragraphs: [
      'The beasts in this volume were never observed by any careful naturalist. They were painted, sung, whispered, and set down in the margins of manuscripts to warn or delight.',
      'Do not doubt them the more for it. They have outlived most of what was written next to them.',
    ],
    farewell: 'From the older stories,',
    completionEpigram: 'The Chimeric Bestiary is catalogued. The beasts return to the margin.',
  },
  'painted-wall': {
    volumeId: 'painted-wall',
    curatorName: 'Ophelia Marchetti',
    curatorTitle: 'Art Historian',
    signature: 'O. Marchetti',
    greeting: 'Reader,',
    paragraphs: [
      'A wall was the first place that took a picture, and it has never quite stopped. From fresco to canvas to keyboard, the impulse to set colour into some patient surface is the same impulse.',
      'This volume gathers what we have called it, along the way.',
    ],
    farewell: 'In the gallery,',
    completionEpigram: 'The Painted Wall is catalogued. The colour is set into the wall.',
  },
} as const;

export function letterFor(volumeId: VolumeId): CuratorLetter {
  return CURATORS[volumeId];
}

export function allLetters(): readonly CuratorLetter[] {
  return VOLUMES.map((v) => CURATORS[v.id]);
}
