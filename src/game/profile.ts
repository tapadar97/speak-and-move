import { WORLD_IDS, type WorldId } from './cards';
import type { Mastery } from './mastery';
import { addDays } from './review';
import type { ReviewDeck } from './review';
import type { Stats } from './stats';

export type PlayerChoice = 'hero' | 'girl';

export interface Mission {
  cardId: string;
  given: string;
}

export interface WorldProgress {
  raceWins: number;
  /** 0 = boss not beaten yet, else 1–3. */
  stars: number;
  /** Native round: 0 = not won yet, else 1–3. */
  nativeStars: number;
  /** Stats when you first entered the world, to show growth on the victory screen. */
  startStats: Stats | null;
}

export interface Profile {
  /** Null until the player picks a character. */
  player: PlayerChoice | null;
  /** Shown on the player card; empty means "YOU". */
  name: string;
  coins: number;
  xp: number;
  /** Null until the First Day level check is done. */
  stats: Stats | null;
  firstDayDate: string | null;
  worlds: Record<WorldId, WorldProgress>;
  outfits: string[];
  /** Cards attempted in races, and how many were right on the first try. */
  attempts: number;
  firstTry: number;
  review: ReviewDeck;
  mission: Mission | null;
  missionsDone: number;
  /** How real-life missions went. */
  missionLog: { worked: number; unclear: number; nervous: number };
  /** Mastery step 0–3 per phrase card. */
  mastery: Mastery;
  /** Phrase Pack finished, per world. */
  packDone: Record<WorldId, boolean>;
  /** Native round phrase pack finished, per world. */
  nativePackDone: Record<WorldId, boolean>;
  /** Good answers today, toward the daily goal. */
  daily: { day: string; count: number };
  /** Days in a row the daily goal was met. */
  streak: { last: string | null; days: number };
  /** Every day the daily goal was met (for the week row). */
  goalDays: string[];
  /** Stats before the latest weekly re-check, to show progress. */
  prevStats: Stats | null;
  sound: boolean;
  bangla: boolean;
}

const freshWorld = (): WorldProgress => ({ raceWins: 0, stars: 0, nativeStars: 0, startStats: null });
const perWorld = <T,>(make: () => T) => Object.fromEntries(WORLD_IDS.map((w) => [w, make()])) as Record<WorldId, T>;

export const NEW_PROFILE: Profile = {
  player: null,
  name: '',
  coins: 0,
  xp: 0,
  stats: null,
  firstDayDate: null,
  worlds: perWorld(freshWorld),
  outfits: [],
  attempts: 0,
  firstTry: 0,
  review: {},
  mission: null,
  missionsDone: 0,
  missionLog: { worked: 0, unclear: 0, nervous: 0 },
  mastery: {},
  packDone: perWorld(() => false),
  nativePackDone: perWorld(() => false),
  daily: { day: '', count: 0 },
  streak: { last: null, days: 0 },
  goalDays: [],
  prevStats: null,
  sound: true,
  bangla: true,
};

export const XP_PER_LEVEL = 500;
export const playerLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

const KEY = 'speak-and-move.v2';

/** Progress lives only in this browser; the game still works if storage is blocked. */
export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return NEW_PROFILE;
    const p = JSON.parse(raw);
    return {
      ...NEW_PROFILE,
      ...p,
      // Older saves have fewer worlds and fields: fill in the gaps.
      worlds: Object.fromEntries(WORLD_IDS.map((w) => [w, { ...freshWorld(), ...(p.worlds?.[w] ?? {}) }])) as Record<WorldId, WorldProgress>,
      packDone: { ...NEW_PROFILE.packDone, ...(p.packDone ?? {}) },
      nativePackDone: { ...NEW_PROFILE.nativePackDone, ...(p.nativePackDone ?? {}) },
    };
  } catch {
    return NEW_PROFILE;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage blocked */
  }
}

/**
 * A world opens when the boss before it is beaten. A strong level check can
 * skip ahead to World 2 (rank 2+) or World 3 (rank 3+), never further.
 */
export function isUnlocked(p: Profile, id: WorldId, rank: number): boolean {
  if (id === 1) return true;
  const prev = (id - 1) as WorldId;
  return p.worlds[prev].stars > 0 || (id <= 3 && rank >= id);
}

/** The Native round opens once the world's boss is beaten. */
export const nativeOpen = (p: Profile, id: WorldId) => p.worlds[id].stars > 0;

/** The world the PLAY button takes you to: an unfinished Native round first, else your newest world. */
export function currentWorld(p: Profile, rank: number): WorldId {
  const open = WORLD_IDS.filter((w) => isUnlocked(p, w, rank));
  const top = open[open.length - 1];
  const pending = open.find((w) => w < top && p.worlds[w].stars > 0 && p.worlds[w].nativeStars === 0);
  return pending ?? top;
}

export const DAILY_GOAL = 10;
export const RECHECK_DAYS = 7;

/** Count one good answer toward today's goal; meeting the goal extends the streak. */
export function countGood(p: Profile, day: string): Pick<Profile, 'daily' | 'streak' | 'goalDays'> & { goalJustMet: boolean } {
  const count = (p.daily.day === day ? p.daily.count : 0) + 1;
  const goalJustMet = count === DAILY_GOAL;
  let streak = p.streak;
  if (goalJustMet && p.streak.last !== day) {
    streak = { last: day, days: p.streak.last === addDays(day, -1) ? p.streak.days + 1 : 1 };
  }
  const goalDays = goalJustMet && !p.goalDays.includes(day) ? [...p.goalDays.slice(-60), day] : p.goalDays;
  return { daily: { day, count }, streak, goalDays, goalJustMet };
}

/** The streak as it stands today: 0 once a whole day was missed. */
export function liveStreak(p: Profile, day: string): number {
  if (!p.streak.last) return 0;
  return p.streak.last === day || p.streak.last === addDays(day, -1) ? p.streak.days : 0;
}

export const goodToday = (p: Profile, day: string) => (p.daily.day === day ? p.daily.count : 0);

/** The weekly level check is ready a week after the last one. */
export const recheckDue = (p: Profile, day: string) => !!p.firstDayDate && addDays(p.firstDayDate, RECHECK_DAYS) <= day;

/** The 7 days (Monday first) of the week containing `day`. */
export function weekDays(day: string): string[] {
  const d = new Date(Date.parse(`${day}T12:00:00Z`));
  const monday = addDays(day, -((d.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
