import type { CardType } from './cards';

export type StatKey = 'ear' | 'voice' | 'grammar' | 'words' | 'speed';
export type Stats = Record<StatKey, number>;

export const STAT_KEYS: StatKey[] = ['ear', 'voice', 'grammar', 'words', 'speed'];

export const STAT_INFO: Record<StatKey, { name: string; icon: string; color: string; what: string }> = {
  ear: { name: 'Ear', icon: '👂', color: '#ffd23f', what: 'Understanding what you hear' },
  voice: { name: 'Voice', icon: '🗣️', color: '#2fe083', what: 'How clearly the phone understands you' },
  grammar: { name: 'Grammar', icon: '🔧', color: '#ff5a6a', what: 'Putting words in the right order and form' },
  words: { name: 'Words', icon: '📚', color: '#b06cff', what: 'Finding the English words you need' },
  speed: { name: 'Speed', icon: '⚡', color: '#3fd4ff', what: 'Answering without long pauses' },
};

/** Your English level from the level check (separate from the New York rank ladder). */
export const RANKS = ['Beginner', 'Elementary', 'Intermediate', 'Upper intermediate', 'Advanced'] as const;
export type Rank = (typeof RANKS)[number];
const RANK_FLOOR = [0, 30, 50, 65, 80];

export const clampStat = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
export const average = (s: Stats) => STAT_KEYS.reduce((t, k) => t + s[k], 0) / STAT_KEYS.length;

/** Rank index 0–4 from the average of all five stats. */
export function rankIndex(s: Stats): number {
  const avg = average(s);
  let r = 0;
  RANK_FLOOR.forEach((floor, i) => {
    if (avg >= floor) r = i;
  });
  return r;
}

export function weakest(s: Stats): StatKey {
  return STAT_KEYS.reduce((w, k) => (s[k] < s[w] ? k : w), STAT_KEYS[0]);
}

/** Which stat each card type trains. */
export const STAT_FOR: Record<CardType, StatKey> = {
  say: 'voice',
  listen: 'ear',
  fix: 'grammar',
  recall: 'words',
};

/** Weak stats make their card type come up more often (weight 1 to 5). */
export function typeWeights(s: Stats | null): Record<CardType, number> {
  const w = (k: StatKey) => (s ? 1 + (100 - s[k]) / 25 : 1);
  return { say: w('voice'), listen: w('ear'), fix: w('grammar'), recall: w('words') };
}

/** Small, steady growth: more for weak stats, never a loss for a mistake. */
export function grow(s: Stats, key: StatKey, firstTry: boolean): Stats {
  const room = 100 - s[key];
  const gain = (firstTry ? 2 : 1) * (room > 40 ? 1.5 : room > 15 ? 1 : 0.5);
  return { ...s, [key]: clampStat(s[key] + gain) };
}

export const QUESTS: Record<StatKey, { en: string; bn: string }> = {
  ear: { en: 'Train your ear: catch fast New York speech.', bn: 'কান তৈরি করুন: দ্রুত কথা ধরতে শিখুন।' },
  voice: { en: 'Speak clearly: every word, slow and steady.', bn: 'স্পষ্ট বলুন: প্রতিটা শব্দ, ধীরে আর স্থিরভাবে।' },
  grammar: { en: "Master questions: 'Where can I buy…?'", bn: "প্রশ্ন করা শিখুন: 'Where can I buy…?'" },
  words: { en: 'Find your words: say it from the Bangla meaning.', bn: 'শব্দ খুঁজে পান: বাংলা দেখে ইংরেজিতে বলুন।' },
  speed: { en: "Answer faster: don't wait for the perfect sentence.", bn: 'দ্রুত উত্তর দিন: নিখুঁত বাক্যের অপেক্ষা করবেন না।' },
};
