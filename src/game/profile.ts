import type { WorldId } from './cards';
import type { ReviewDeck } from './review';
import type { Stats } from './stats';

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
  sound: boolean;
  bangla: boolean;
}

const freshWorld = (): WorldProgress => ({ raceWins: 0, stars: 0, startStats: null });

export const NEW_PROFILE: Profile = {
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
    return { ...NEW_PROFILE, ...p, worlds: { ...NEW_PROFILE.worlds, ...(p.worlds ?? {}) } };
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
