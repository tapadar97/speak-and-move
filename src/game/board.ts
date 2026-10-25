import { CARDS, STEPS, type Card, type Level, type Place } from './cards';

export const HOME = 20;
export const PLACE_ORDER: Place[] = ['deli', 'subway', 'pharmacy', 'laundromat', 'doctor', 'street'];

/** Square 0 is Start, 20 is Home; 1–19 cycle through the places. */
export function placeAt(square: number): Place | null {
  if (square <= 0 || square >= HOME) return null;
  return PLACE_ORDER[(square - 1) % PLACE_ORDER.length];
}

/** Land exactly on a subway square with an express and you ride ahead. */
export const EXPRESS: Record<number, number> = { 2: 5, 8: 12, 14: 17 };

/** Grid cell for a square: a 5×5 snake from bottom-left up to Home at top-left. */
export function cellOf(square: number): { row: number; col: number } {
  if (square >= HOME) return { row: 0, col: 0 };
  const band = Math.floor(square / 5);
  const k = square % 5;
  return { row: 4 - band, col: band % 2 === 0 ? k : 4 - k };
}

export type Who = 'you' | 'bot';

export interface Players {
  you: number;
  bot: number;
}

export interface MoveOutcome {
  players: Players;
  /** Square reached by stepping, before any express ride. */
  landed: number;
  express: { from: number; to: number } | null;
  bumped: boolean;
  won: boolean;
}

/** Move `who` forward `steps`, apply express rides and bumping. */
export function move(players: Players, who: Who, steps: number): MoveOutcome {
  const other: Who = who === 'you' ? 'bot' : 'you';
  const landed = Math.min(HOME, players[who] + steps);
  let to = landed;
  let express: MoveOutcome['express'] = null;
  if (EXPRESS[landed] !== undefined) {
    to = EXPRESS[landed];
    express = { from: landed, to };
  }
  const next: Players = { ...players, [who]: to };
  let bumped = false;
  // Landing on the other player pushes them back 2 squares (never from Start or Home).
  if (to > 0 && to < HOME && next[other] === to) {
    next[other] = Math.max(0, to - 2);
    bumped = true;
  }
  return { players: next, landed, express, bumped, won: to >= HOME };
}

/** Pick a card for this level, matching the place on `square` when possible. */
export function drawCard(level: Level, square: number, recent: string[], rng: () => number = Math.random): Card {
  const place = placeAt(square);
  const pool = CARDS.filter((c) => c.level === level);
  const fresh = pool.filter((c) => !recent.includes(c.id));
  const here = fresh.filter((c) => c.place === place);
  const from = here.length ? here : fresh.length ? fresh : pool;
  return from[Math.floor(rng() * from.length)];
}

/** Chance the friendly bot gets each level right. */
export const BOT_SKILL: Record<Level, number> = { 1: 0.92, 2: 0.72, 3: 0.5 };

/** The bot plays it safe when ahead and takes risks when behind. */
export function botChoice(players: Players): Level {
  const toHome = HOME - players.bot;
  if (toHome <= 1) return 1;
  if (toHome <= 2) return 2;
  const behind = players.you - players.bot;
  if (behind >= 4) return 3;
  if (behind <= -4) return 1;
  return 2;
}

export const stepsFor = (level: Level, retry: boolean) => (retry ? 1 : STEPS[level]);
