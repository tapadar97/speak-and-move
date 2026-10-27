import { BOSSES } from './bosses';
import type { WorldId } from './cards';
import type { Profile } from './profile';
import { WORLDS } from './worlds';

export interface Goal {
  id: string;
  label: string;
  world: WorldId;
  native: boolean;
  done: (p: Profile) => boolean;
}

export interface Rung {
  name: string;
  icon: string;
  about: string;
  /** Everything needed to reach this rank (on top of the ranks below it). */
  goals: Goal[];
}

const boss = (w: WorldId): Goal => ({
  id: `boss-${w}`,
  label: `Beat ${BOSSES[w].name} in ${WORLDS[w - 1].name}`,
  world: w,
  native: false,
  done: (p) => p.worlds[w].stars > 0,
});

const native = (w: WorldId): Goal => ({
  id: `native-${w}`,
  label: `Win the Native round in ${WORLDS[w - 1].name}`,
  world: w,
  native: true,
  done: (p) => p.worlds[w].nativeStars > 0,
});

/** The climb from Newcomer to Expert New Yorker: every boss and every Native round. */
export const LADDER: Rung[] = [
  { name: 'Newcomer', icon: '🧳', about: 'Just landed. Every New Yorker started here.', goals: [] },
  { name: 'Local', icon: '🥯', about: 'You can order food, ask for help and get around your block.', goals: [boss(1)] },
  { name: 'Regular', icon: '🚇', about: 'The city moves fast, and now so do you.', goals: [boss(2), native(1)] },
  { name: 'Real New Yorker', icon: '🏙️', about: 'Home, work, people: you handle it all in English.', goals: [boss(3), boss(4), native(2)] },
  { name: 'Expert New Yorker', icon: '🗽', about: 'Slang, speed, any situation. You sound like you grew up here.', goals: [boss(5), native(3), native(4), native(5)] },
];

export const EXPERT = LADDER.length - 1;

/** Your rank: the highest rung whose goals, and every rung below it, are done. */
export function ladderRank(p: Profile): number {
  let r = 0;
  for (let i = 1; i < LADDER.length; i++) {
    if (!LADDER[i].goals.every((g) => g.done(p))) break;
    r = i;
  }
  return r;
}

/** The next rank and how close you are; null once you're an Expert New Yorker. */
export function nextRung(p: Profile) {
  const rank = ladderRank(p);
  if (rank >= EXPERT) return null;
  const rung = LADDER[rank + 1];
  const done = rung.goals.filter((g) => g.done(p)).length;
  return { rank: rank + 1, rung, done, total: rung.goals.length, todo: rung.goals.find((g) => !g.done(p))! };
}
