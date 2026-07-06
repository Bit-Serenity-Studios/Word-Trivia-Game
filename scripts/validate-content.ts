import questions from '../content/questions.json';
import type { Question } from '../game/types';
import { VOLUMES, volumeIdForQuestion, volumeSize } from '../game/volumes';
import { RANKS } from '../game/ranks';
import { candidatesIn } from '../game/rareVolume';

const ALLOWED_CATEGORIES = new Set([
  'Natural Philosophy',
  'Antiquity',
  'Letters',
  'Cartography',
  'Botany & Beasts',
  'Mythos',
  'Fine Arts',
]);

const ALLOWED_TIERS = new Set(['novice', 'scholar', 'sage']);

const OFFENSIVE = new Set(['NAZI', 'SLUR', 'KKKK']);

interface Issue {
  id: string;
  message: string;
}

function validate(): Issue[] {
  const issues: Issue[] = [];
  const seenIds = new Set<string>();
  const seenAnswers = new Set<string>();

  for (const raw of questions as Question[]) {
    const id = raw.id;
    const answer = raw.answer.toUpperCase();

    if (!id || typeof id !== 'string') {
      issues.push({ id: String(id), message: 'missing or non-string id' });
      continue;
    }
    if (seenIds.has(id)) issues.push({ id, message: `duplicate id: ${id}` });
    seenIds.add(id);

    if (!raw.prompt || raw.prompt.length < 8) {
      issues.push({ id, message: 'prompt is too short' });
    }

    if (!/^[A-Z]+$/.test(answer)) {
      issues.push({ id, message: `answer contains non-A-Z: "${raw.answer}"` });
    }
    if (answer.length < 3 || answer.length > 12) {
      issues.push({ id, message: `answer length ${answer.length} outside 3-12: "${answer}"` });
    }
    if (OFFENSIVE.has(answer)) {
      issues.push({ id, message: `answer flagged as offensive: "${answer}"` });
    }
    if (seenAnswers.has(answer)) {
      issues.push({ id, message: `duplicate answer: "${answer}"` });
    }
    seenAnswers.add(answer);

    if (!ALLOWED_CATEGORIES.has(raw.category)) {
      issues.push({ id, message: `unknown category: "${raw.category}"` });
    }
    if (!ALLOWED_TIERS.has(raw.tier)) {
      issues.push({ id, message: `unknown tier: "${raw.tier}"` });
    }

    const len = answer.length;
    if (raw.tier === 'novice' && (len < 3 || len > 5)) {
      issues.push({ id, message: `novice answer length ${len} outside 3-5` });
    }
    if (raw.tier === 'scholar' && (len < 6 || len > 8)) {
      issues.push({ id, message: `scholar answer length ${len} outside 6-8` });
    }
    if (raw.tier === 'sage' && len < 9) {
      issues.push({ id, message: `sage answer length ${len} below 9` });
    }
  }

  return issues;
}

function validateVolumes(pool: readonly Question[]): Issue[] {
  const issues: Issue[] = [];
  const perVolume = new Map<string, number>();
  for (const q of pool) {
    try {
      const vid = volumeIdForQuestion(q);
      perVolume.set(vid, (perVolume.get(vid) ?? 0) + 1);
    } catch (err) {
      issues.push({ id: q.id, message: `no volume for category "${q.category}": ${(err as Error).message}` });
    }
  }
  let sum = 0;
  for (const v of VOLUMES) {
    const count = perVolume.get(v.id) ?? 0;
    if (count === 0) {
      issues.push({ id: v.id, message: `volume "${v.id}" has zero questions` });
    }
    sum += count;
  }
  if (sum !== pool.length) {
    issues.push({
      id: 'volumes',
      message: `volume totals ${sum} do not match content total ${pool.length}`,
    });
  }
  for (const v of VOLUMES) {
    if (volumeSize(pool, v.id) === 0) {
      issues.push({ id: v.id, message: `volumeSize returned 0 for "${v.id}"` });
    }
  }
  return issues;
}

function validateRanks(): Issue[] {
  const issues: Issue[] = [];
  for (let i = 1; i < RANKS.length; i++) {
    const prev = RANKS[i - 1]!;
    const cur = RANKS[i]!;
    if (cur.order !== prev.order + 1) {
      issues.push({ id: cur.id, message: `rank order not sequential (${prev.order} → ${cur.order})` });
    }
    for (const key of ['entries', 'cabinet', 'nightlyBest'] as const) {
      if (cur.require[key] < prev.require[key]) {
        issues.push({
          id: cur.id,
          message: `rank requirement "${key}" decreased (${prev.require[key]} → ${cur.require[key]})`,
        });
      }
    }
    if (cur.inkReward <= prev.inkReward && prev.inkReward > 0) {
      issues.push({
        id: cur.id,
        message: `rank ink reward not strictly increasing (${prev.inkReward} → ${cur.inkReward})`,
      });
    }
  }
  return issues;
}

function validateRareCoverage(pool: readonly Question[]): Issue[] {
  const issues: Issue[] = [];
  if (candidatesIn(pool).length === 0) {
    issues.push({ id: 'rare', message: 'no rare candidates in the pool (need sage tier, len ≥ 9)' });
  }
  return issues;
}

const pool = (questions as Question[]).map((q) => ({ ...q, answer: q.answer.toUpperCase() }));
const issues = [
  ...validate(),
  ...validateVolumes(pool),
  ...validateRanks(),
  ...validateRareCoverage(pool),
];

if (issues.length === 0) {
  const summary = [
    `${pool.length} entries`,
    `${VOLUMES.length} volumes`,
    `${RANKS.length} ranks`,
    `${candidatesIn(pool).length} rare candidates`,
  ].join(' · ');
  console.log(`✓ Content OK: ${summary}.`);
  process.exit(0);
} else {
  console.error(`✗ Content has ${issues.length} issue(s):`);
  for (const i of issues) console.error(`  - [${i.id}] ${i.message}`);
  process.exit(1);
}
