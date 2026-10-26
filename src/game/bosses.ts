import type { WorldId } from './cards';

export interface BossRound {
  /** What the boss says. */
  line: string;
  /** The Phrase Pack card you answer with (its Bangla is shown, you say the English). */
  cardId: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  art: string;
  icon: string;
  intro: string;
  rounds: BossRound[];
}

export const BOSS_HP = 5;
export const HEARTS = 3;
export const ROUND_SECONDS = 20;
/** Answering faster than this trains Speed. */
export const FAST_MS = 8000;

export const BOSSES: Record<WorldId, Boss> = {
  1: {
    id: 'tony',
    name: 'Tony',
    title: 'The Deli Owner',
    art: 'boss-deli',
    icon: '🥪',
    intro: 'Best sandwich in Queens. But only if you can order like a New Yorker!',
    rounds: [
      { line: 'Next! What’ll it be?', cardId: 'deli-b1' },
      { line: 'Salt, pepper, ketchup?', cardId: 'deli-b2' },
      { line: 'You want a coffee with that?', cardId: 'deli-b3' },
      { line: 'For here or to go?', cardId: 'deli-b4' },
      { line: 'That’s eight fifty.', cardId: 'deli-b5' },
      { line: 'Anything else, my friend?', cardId: 'deli-b6' },
    ],
  },
  2: {
    id: 'conductor',
    name: 'The Conductor',
    title: 'City Transit',
    art: 'boss-conductor',
    icon: '🚇',
    intro: 'Nobody rides my train without knowing where they’re going.',
    rounds: [
      { line: 'Your ticket’s no good on this train. What are you gonna do?', cardId: 'turnstile-b1' },
      { line: 'There’s a machine by the stairs. Where are you headed?', cardId: 'exit-b2' },
      { line: 'Then you’re on the wrong side. You need the uptown platform.', cardId: 'platform-b3' },
      { line: 'Take the stairs, cross over. Express or local?', cardId: 'train-b4' },
      { line: 'The express skips your stop on weekends.', cardId: 'train-b5' },
      { line: 'Smart. Local’s here in two minutes. Have a good one!', cardId: 'exit-b6' },
    ],
  },
};

export interface BattleState {
  hp: number;
  hearts: number;
  combo: number;
  bestCombo: number;
  /** Round indexes still to play; a missed round goes to the back. */
  queue: number[];
  fastAnswers: number;
  over: 'won' | 'lost' | null;
}

export function startBattle(boss: Boss): BattleState {
  return {
    hp: BOSS_HP,
    hearts: HEARTS,
    combo: 0,
    bestCombo: 0,
    queue: boss.rounds.map((_, i) => i),
    fastAnswers: 0,
    over: null,
  };
}

/** Apply one answer: right hits the boss, wrong (or time out) costs a heart. */
export function answer(s: BattleState, right: boolean, ms: number): BattleState {
  const [current, ...rest] = s.queue;
  if (right) {
    const hp = s.hp - 1;
    const combo = s.combo + 1;
    return {
      ...s,
      hp,
      combo,
      bestCombo: Math.max(s.bestCombo, combo),
      queue: rest,
      fastAnswers: s.fastAnswers + (ms < FAST_MS ? 1 : 0),
      over: hp <= 0 ? 'won' : null,
    };
  }
  const hearts = s.hearts - 1;
  return { ...s, hearts, combo: 0, queue: [...rest, current], over: hearts <= 0 ? 'lost' : null };
}

/** Stars for a win: one per heart left, minus one for leaning on many hints (never below 1). */
export const starsFor = (s: BattleState, hintsUsed = 0) =>
  s.over === 'won' ? Math.max(1, s.hearts - (hintsUsed >= 4 ? 1 : 0)) : 0;
