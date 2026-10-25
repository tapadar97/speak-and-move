import type { ReviewDeck } from './review';

export interface Mission {
  cardId: string;
  given: string;
}

export interface Profile {
  coins: number;
  games: number;
  wins: number;
  /** Cards attempted in games, and how many were right on the first try. */
  attempts: number;
  firstTry: number;
  review: ReviewDeck;
  mission: Mission | null;
  missionsDone: number;
  sound: boolean;
  bangla: boolean;
}

export const NEW_PROFILE: Profile = {
  coins: 0,
  games: 0,
  wins: 0,
  attempts: 0,
  firstTry: 0,
  review: {},
  mission: null,
  missionsDone: 0,
  sound: true,
  bangla: true,
};

const KEY = 'speak-and-move.v1';

/** Progress lives only in this browser; the game still works if storage is blocked. */
export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...NEW_PROFILE, ...JSON.parse(raw) } : NEW_PROFILE;
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
