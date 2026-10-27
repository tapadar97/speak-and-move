import { CARDS, STEPS, type Card, type Level, type Place, type WorldId } from './cards';
import { typeWeights, type Stats } from './stats';
import { worldById } from './worlds';

/** A ring of 20 squares around the board's edge. You start on 1 and race to 20. */
export const START = 1;
export const HOME = 20;

export function placeAt(world: WorldId, square: number): Place | null {
  if (square <= START || square >= HOME) return null;
  return worldById(world).layout![square - 2];
}

export const expressOf = (world: WorldId) => worldById(world).express ?? {};

/**
 * Grid cell for a square on a 6×6 ring, clockwise from the top-left:
 * 1–6 across the top, 7–10 down the right, 11 bottom-right, 12–16 back along
 * the bottom, 17–20 up the left (20 sits just below 1).
 */
export function cellOf(square: number): { row: number; col: number } {
  const s = Math.max(START, Math.min(HOME, square));
  if (s <= 6) return { row: 0, col: s - 1 };
  if (s <= 10) return { row: s - 6, col: 5 };
  if (s === 11) return { row: 5, col: 5 };
  if (s <= 16) return { row: 5, col: 16 - s };
  return { row: 21 - s, col: 0 };
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
export function move(world: WorldId, players: Players, who: Who, steps: number): MoveOutcome {
  const other: Who = who === 'you' ? 'bot' : 'you';
  const landed = Math.min(HOME, players[who] + steps);
  const ex = expressOf(world);
  let to = landed;
  let express: MoveOutcome['express'] = null;
  if (ex[landed] !== undefined) {
    to = ex[landed];
    express = { from: landed, to };
  }
  const next: Players = { ...players, [who]: to };
  let bumped = false;
  // Landing on the other player pushes them back 2 squares (never from Start or Home).
  if (to > START && to < HOME && next[other] === to) {
    next[other] = Math.max(START, to - 2);
    bumped = true;
  }
  return { players: next, landed, express, bumped, won: to >= HOME };
}

/**
 * Pick a card for this world and level, from the place on `square` when
 * possible. Card types that train weak stats come up more often.
 */
export function drawCard(
  world: WorldId,
  level: Level,
  square: number,
  recent: string[],
  stats: Stats | null = null,
  rng: () => number = Math.random,
): Card {
  const place = placeAt(world, square);
  const pool = CARDS.filter((c) => c.world === world && c.level === level && !c.native);
  const fresh = pool.filter((c) => !recent.includes(c.id));
  const here = fresh.filter((c) => c.place === place);
  const from = here.length ? here : fresh.length ? fresh : pool;
  const weights = typeWeights(stats);
  const total = from.reduce((t, c) => t + weights[c.type], 0);
  let r = rng() * total;
  for (const c of from) {
    r -= weights[c.type];
    if (r <= 0) return c;
  }
  return from[from.length - 1];
}

/** The rival plays it safe when ahead and takes risks when behind. */
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

/** Where each choice would land you, for the card buttons. */
export function preview(world: WorldId, from: number, level: Level, other: number) {
  const landed = Math.min(HOME, from + STEPS[level]);
  const ex = expressOf(world)[landed];
  const to = ex ?? landed;
  return {
    square: landed,
    to,
    express: ex !== undefined,
    bump: to > START && to < HOME && to === other,
    home: to >= HOME,
    place: placeAt(world, landed),
  };
}
