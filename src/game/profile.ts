import type { WorldId } from './cards';
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
  /** Good answers today, toward the daily goal. */
  daily: { day: string; count: number };
  /** Days in a row the daily goal was met. */
  streak: { last: string | null; days: number };
  /** Stats before the latest weekly re-check, to show progress. */
  prevStats: Stats | null;
  sound: boolean;
  bangla: boolean;
}

const freshWorld = (): WorldProgress => ({ raceWins: 0, stars: 0, startStats: null });

export const NEW_PROFILE: Profile = {
  player: null,
  name: '',
  coins: 0,
  xp: 0,
  stats: null,
  firstDayDate: null,
  worlds: { 1: freshWorld(), 2: freshWorld() },
  outfits: [],
  attempts: 0,
  firstTry: 0,
  review: {},
  mission: null,
  missionsDone: 0,
  missionLog: { worked: 0, unclear: 0, nervous: 0 },
  mastery: {},
  packDone: { 1: false, 2: false },
  daily: { day: '', count: 0 },
  streak: { last: null, days: 0 },
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
      worlds: { ...NEW_PROFILE.worlds, ...(p.worlds ?? {}) },
      packDone: { ...NEW_PROFILE.packDone, ...(p.packDone ?? {}) },
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

/** A world opens when the one before it is cleared, or when your rank is high enough to skip it. */
export function isUnlocked(p: Profile, id: WorldId, rank: number): boolean {
  if (id === 1) return true;
  return p.worlds[1].stars > 0 || rank >= 2;
}

/** The world the PLAY button takes you to. */
export function currentWorld(p: Profile, rank: number): WorldId {
  return isUnlocked(p, 2, rank) ? 2 : 1;
}

export const DAILY_GOAL = 10;
export const RECHECK_DAYS = 7;

/** Count one good answer toward today's goal; meeting the goal extends the streak. */
export function countGood(p: Profile, day: string): Pick<Profile, 'daily' | 'streak'> & { goalJustMet: boolean } {
  const count = (p.daily.day === day ? p.daily.count : 0) + 1;
  const goalJustMet = count === DAILY_GOAL;
  let streak = p.streak;
  if (goalJustMet && p.streak.last !== day) {
    streak = { last: day, days: p.streak.last === addDays(day, -1) ? p.streak.days + 1 : 1 };
  }
  return { daily: { day, count }, streak, goalJustMet };
}

/** The streak as it stands today: 0 once a whole day was missed. */
export function liveStreak(p: Profile, day: string): number {
  if (!p.streak.last) return 0;
  return p.streak.last === day || p.streak.last === addDays(day, -1) ? p.streak.days : 0;
}

export const goodToday = (p: Profile, day: string) => (p.daily.day === day ? p.daily.count : 0);

/** The weekly level check is ready a week after the last one. */
export const recheckDue = (p: Profile, day: string) => !!p.firstDayDate && addDays(p.firstDayDate, RECHECK_DAYS) <= day;
