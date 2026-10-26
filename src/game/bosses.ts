import type { WorldId } from './cards';

export interface BossRound {
  /** What the boss says. */
  line: string;
  /** What you should say, in Bangla (you answer in English). */
  bn: string;
  target: string;
  accept?: string[];
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
      { line: 'Next! What’ll it be?', bn: 'রোলে বেকন, ডিম আর চিজ দেবেন।', target: 'Bacon, egg and cheese on a roll, please.', accept: ['Can I get a bacon egg and cheese on a roll', 'A bacon egg and cheese on a roll please'] },
      { line: 'Salt, pepper, ketchup?', bn: 'হ্যাঁ, সবকিছু দিন।', target: 'Yes, everything please.', accept: ['Yeah everything', 'Everything please', 'Yes all of it please'] },
      { line: 'You want a coffee with that?', bn: 'হ্যাঁ, দুধ আর চিনি দিয়ে একটা ছোট কফি।', target: 'Yes, a small coffee with milk and sugar.', accept: ['Yeah a small coffee with milk and sugar please'] },
      { line: 'For here or to go?', bn: 'নিয়ে যাব।', target: 'To go, please.', accept: ["It's to go"] },
      { line: 'That’s eight fifty.', bn: 'কার্ডে দিতে পারি?', target: 'Can I pay by card?', accept: ['Can I pay with card', 'Can I use my card', 'Do you take cards'] },
      { line: 'Anything else, my friend?', bn: 'না, আর কিছু লাগবে না। ধন্যবাদ!', target: "No, I'm all set. Thanks!", accept: ["No that's all thanks", "I'm all set thank you", 'No thank you that is it'] },
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
      { line: 'Your ticket’s no good on this train. What are you gonna do?', bn: 'দুঃখিত, কার্ড কোথায় রিফিল করতে পারি?', target: 'Sorry, where can I refill my card?', accept: ['Sorry where can I add money to my card', 'Where can I refill my card'] },
      { line: 'There’s a machine by the stairs. Where are you headed?', bn: 'আমি কুইন্সের জ্যাকসন হাইটসে যাচ্ছি।', target: "I'm going to Jackson Heights in Queens.", accept: ["I'm heading to Jackson Heights in Queens", 'I am going to Jackson Heights in Queens'] },
      { line: 'Then you’re on the wrong side. You need the uptown platform.', bn: 'আপটাউন প্ল্যাটফর্মে কীভাবে যাব?', target: 'How do I get to the uptown platform?', accept: ['How can I get to the uptown platform', 'Where is the uptown platform'] },
      { line: 'Take the stairs, cross over. Express or local?', bn: 'আমার এক্সপ্রেস ট্রেন লাগবে।', target: 'I need the express train.', accept: ['I need the express', 'The express please'] },
      { line: 'The express skips your stop on weekends.', bn: 'তাহলে কি লোকাল ট্রেন নেব?', target: 'So should I take the local train?', accept: ['Should I take the local train then', "Then I'll take the local train"] },
      { line: 'Smart. Local’s here in two minutes. Have a good one!', bn: 'অনেক ধন্যবাদ, আপনার দিন ভালো কাটুক!', target: 'Thank you so much, have a good day!', accept: ['Thanks a lot have a good day', 'Thank you have a good one', 'Thanks have a nice day'] },
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

/** Stars for a win: one per heart left. */
export const starsFor = (s: BattleState) => (s.over === 'won' ? Math.max(1, s.hearts) : 0);
