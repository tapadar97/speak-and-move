import type { Card } from './cards';
import { REPLIES, SITUATIONS, WHY, type Why } from './learning';
import { normalize } from './match';
import type { StatKey } from './stats';

/**
 * Each phrase climbs 4 steps: 0 New → 1 Seen → 2 Known → 3 Mastered.
 * The higher the step, the less help the card gives.
 */
export const MAX_STEP = 3;
export type Mastery = Record<string, number>;

/**
 * say       – full English shown, say it
 * gap       – 1–2 key words blanked, say the whole sentence
 * fix       – a sentence with a mistake, say it correctly
 * listen    – hear it (text hidden), say it back
 * answer    – hear it, then reply to what you heard
 * bangla    – Bangla only, say it in English
 * situation – only the real-life situation, say what you'd say
 */
export type Mode = 'say' | 'gap' | 'fix' | 'listen' | 'answer' | 'bangla' | 'situation';

export const MODE_NAME: Record<Mode, string> = {
  say: 'Say it',
  gap: 'Fill the gap',
  fix: 'Fix it',
  listen: 'Listen',
  answer: 'Listen & answer',
  bangla: 'From Bangla',
  situation: 'Real talk',
};

/** Which stat each kind of card trains. */
export const MODE_STAT: Record<Mode, StatKey> = {
  say: 'voice',
  gap: 'words',
  fix: 'grammar',
  listen: 'ear',
  answer: 'ear',
  bangla: 'words',
  situation: 'speed',
};

export const STEP_NAME = ['New', 'Seen', 'Known', 'Mastered'];

export const stepOf = (m: Mastery, id: string) => Math.max(0, Math.min(MAX_STEP, m[id] ?? 0));

/** How a card is shown at each mastery step. */
export function modeFor(card: Card, step: number): Mode {
  const ladders: Record<Card['type'], Mode[]> = {
    say: ['say', 'gap', 'bangla', 'situation'],
    recall: ['say', 'gap', 'bangla', 'situation'],
    fix: ['fix', 'fix', 'bangla', 'situation'],
    listen: ['listen', REPLIES[card.id] ? 'answer' : 'gap', 'bangla', 'situation'],
  };
  return ladders[card.type][Math.max(0, Math.min(MAX_STEP, step))];
}

export const situationOf = (card: Card) => SITUATIONS[card.id] ?? card.prompt ?? card.bn;
export const whyOf = (card: Card): Why | null => WHY[card.id] ?? null;

/** What counts as right for this card in this mode. */
export function expected(card: Card, mode: Mode): { target: string; accept: string[]; strict: boolean } {
  if (mode === 'answer' && REPLIES[card.id]) {
    const r = REPLIES[card.id];
    return { target: r.target, accept: r.accept ?? [], strict: false };
  }
  return { target: card.target, accept: card.accept ?? [], strict: mode === 'fix' };
}

const SMALL = new Set(['the', 'and', 'can', 'you', 'for', 'this', 'that', 'with', 'are', 'not', 'please', 'have', 'here', 'from', 'what', 'your', 'does', 'into']);

/** Indexes of the 1–2 key words to blank: the longest content words. */
export function gapIndexes(target: string): number[] {
  const words = target.split(/\s+/);
  const all = words.map((w, i) => ({ i, w: normalize(w).join('') })).sort((a, b) => b.w.length - a.w.length || a.i - b.i);
  const content = all.filter((x) => x.w.length >= 4 && !SMALL.has(x.w));
  // Short phrases may have no long word; then blank the longest one there is.
  const scored = content.length ? content : all.filter((x) => x.w.length >= 2).slice(0, 1);
  const n = words.length >= 6 ? 2 : 1;
  return scored
    .slice(0, n)
    .map((x) => x.i)
    .sort((a, b) => a - b);
}

/** The sentence with its key words replaced by blanks, keeping punctuation. */
export function gapText(target: string): string {
  const blank = new Set(gapIndexes(target));
  return target
    .split(/\s+/)
    .map((w, i) => (blank.has(i) ? w.replace(/[A-Za-z0-9'’-]+/, '____') : w))
    .join(' ');
}

/** Right first time climbs a step; a miss drops one. A second-try save holds. */
export function afterAnswer(m: Mastery, id: string, right: boolean, firstTry: boolean): Mastery {
  const s = stepOf(m, id);
  const next = right ? (firstTry ? s + 1 : s) : s - 1;
  return { ...m, [id]: Math.max(0, Math.min(MAX_STEP, next)) };
}

/* ---------- Second chances inside one race ---------- */

export const REPEAT_AFTER = 3;

export interface Repeat {
  cardId: string;
  /** Your turn number when it comes back. */
  due: number;
}

export const scheduleRepeat = (list: Repeat[], cardId: string, turn: number): Repeat[] =>
  list.some((r) => r.cardId === cardId) ? list : [...list, { cardId, due: turn + REPEAT_AFTER }];

/** The missed card that is due now, if any (oldest first). */
export const dueRepeat = (list: Repeat[], turn: number): Repeat | null => list.find((r) => r.due <= turn) ?? null;

export const dropRepeat = (list: Repeat[], cardId: string) => list.filter((r) => r.cardId !== cardId);
