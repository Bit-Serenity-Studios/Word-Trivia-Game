export type Tier = 'novice' | 'scholar' | 'sage';

export type Category =
  | 'Natural Philosophy'
  | 'Antiquity'
  | 'Letters'
  | 'Cartography'
  | 'Botany & Beasts'
  | 'Mythos'
  | 'Fine Arts';

export interface Question {
  id: string;
  prompt: string;
  answer: string;
  category: Category;
  tier: Tier;
}

export type TileSource = 'answer' | 'decoy';

export interface Tile {
  id: string;
  letter: string;
  source: TileSource;
}

export interface Slot {
  index: number;
  tileId: string | null;
  locked: boolean;
}

export interface RoundState {
  question: Question;
  tray: Tile[];
  slots: Slot[];
  tilesById: Record<string, Tile>;
  hintsUsed: number;
  wrongAttempts: number;
}

export type CheckResult = 'incomplete' | 'correct' | 'wrong';

export type RNG = () => number;
