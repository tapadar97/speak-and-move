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
/** Native rounds: less time, no hints, faster speech. */
export const NATIVE_SECONDS = 12;
export const NATIVE_RATE = 1.15;
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
  3: {
    id: 'russo',
    name: 'Mr. Russo',
    title: 'The Landlord',
    art: 'boss-landlord',
    icon: '🔑',
    intro: 'Forty years I own this building. Nobody gets a repair without a good reason.',
    rounds: [
      { line: 'You’re late on rent again. What’s the story?', cardId: 'landlord-b1' },
      { line: 'Friday. Fine. Anything else? I’m a busy man.', cardId: 'super-b2' },
      { line: 'A week? Nobody else is complaining. You sure?', cardId: 'super-b3' },
      { line: 'Okay, okay. I’ll send somebody next week.', cardId: 'super-b4' },
      { line: 'Tomorrow? Come on. The guy is booked.', cardId: 'call311-b5' },
      { line: 'Alright, alright! Tomorrow, nine a.m. Happy now?', cardId: 'landlord-b6' },
    ],
  },
  4: {
    id: 'grant',
    name: 'Ms. Grant',
    title: 'The Hiring Manager',
    art: 'boss-manager',
    icon: '👔',
    intro: 'Two hundred people applied for this job. Show me why it should be you.',
    rounds: [
      { line: 'Have a seat. So, tell me about yourself.', cardId: 'interview-b1' },
      { line: 'Okay. And why do you want to work here?', cardId: 'interview-b2' },
      { line: 'Tell me about a problem you solved at work.', cardId: 'interview-b3' },
      { line: 'Good. What’s your biggest weakness?', cardId: 'interview-b4' },
      { line: 'Our hours are long. Are you okay with weekends?', cardId: 'interview-b5' },
      { line: 'Last thing. Do you have any questions for me?', cardId: 'interview-b6' },
    ],
  },
  5: {
    id: 'vinny',
    name: 'Vinny',
    title: 'The Midtown Waiter',
    art: 'boss-waiter',
    icon: '🍝',
    intro: 'Saturday night, forty tables, one of me. Keep up or keep walking!',
    rounds: [
      { line: 'Hi folks, you got a reservation?', cardId: 'restaurant-b1' },
      { line: 'Bar seats now, or forty-five minutes for a table. What’ll it be?', cardId: 'bar-b2' },
      { line: 'Great. You know what you want, or you need a minute?', cardId: 'restaurant-b3' },
      { line: 'The steak. Best in Midtown. How you want it cooked?', cardId: 'restaurant-b4' },
      { line: 'Here you go, one salmon. Enjoy!', cardId: 'restaurant-b5' },
      { line: 'My bad! The steak’s on the house. Anything else?', cardId: 'bar-b6' },
    ],
  },
};

/** The hard rematch after each boss: real speed, slang, no hints. */
export const NATIVE_BOSSES: Record<WorldId, Boss> = {
  1: {
    id: 'sal',
    name: 'Big Sal',
    title: 'The 7 a.m. Rush',
    art: 'boss-sal',
    icon: '☕',
    intro: 'Seven a.m., forty people on line. Talk fast or get outta here!',
    rounds: [
      { line: 'Next! Let’s go, let’s go! What’ll it be?', cardId: 'n1-1' },
      { line: 'Coffee? How you want it?', cardId: 'n1-2' },
      { line: 'Anything else? Chips? Juice?', cardId: 'n1-3' },
      { line: 'Hey! Watch it, buddy!', cardId: 'n1-4' },
      { line: 'Four seventy-five. Outta five?', cardId: 'n1-5' },
      { line: 'Sorry ’bout the wait, pal. Take care.', cardId: 'n1-6' },
    ],
  },
  2: {
    id: 'rita',
    name: 'Rush Hour Rita',
    title: 'The Packed 4 Train',
    art: 'boss-rita',
    icon: '🚇',
    intro: 'Eight-fifteen, packed train, everybody’s late. Keep up, newbie!',
    rounds: [
      { line: 'Ugh, this train is packed. You need something?', cardId: 'n2-1' },
      { line: 'Doors are opening. You getting off?', cardId: 'n2-2' },
      { line: 'They changed the trains again this morning.', cardId: 'n2-3' },
      { line: 'Delays. Signal problems. Again.', cardId: 'n2-4' },
      { line: 'So how you getting uptown now?', cardId: 'n2-5' },
      { line: 'Take the back car, it’s right by the stairs.', cardId: 'n2-6' },
    ],
  },
  3: {
    id: 'dolores',
    name: 'Dolores',
    title: 'Queen of the Block',
    art: 'boss-dolores',
    icon: '🏘️',
    intro: 'Thirty years on this block, honey. Let’s see if you can keep up with the gossip!',
    rounds: [
      { line: 'Well look who it is! Haven’t seen you in forever!', cardId: 'n3-1' },
      { line: 'So how’s everything with you?', cardId: 'n3-2' },
      { line: 'Did you hear? The pizza place on the corner is closing!', cardId: 'n3-3' },
      { line: 'Thirty years they were open. Can you believe it?', cardId: 'n3-4' },
      { line: 'We’re doing a goodbye party Saturday. You in?', cardId: 'n3-5' },
      { line: 'Just bring yourself, sweetheart. Saturday at six!', cardId: 'n3-6' },
    ],
  },
  4: {
    id: 'jay',
    name: 'Jay',
    title: 'The Friday Standup',
    art: 'boss-jay',
    icon: '📊',
    intro: 'Quick standup, team. Office talk only. Keep it tight!',
    rounds: [
      { line: 'Can someone jump on the client email?', cardId: 'n4-1' },
      { line: 'And what’s the budget for the new project?', cardId: 'n4-2' },
      { line: 'Can you take the Henderson report too?', cardId: 'n4-3' },
      { line: 'Fine, it can wait. Talk tomorrow?', cardId: 'n4-4' },
      { line: 'And remember, the deck is due end of week.', cardId: 'n4-5' },
      { line: 'Yep, Friday. That’s it, team. We’re done!', cardId: 'n4-6' },
    ],
  },
  5: {
    id: 'frankie',
    name: 'Frankie',
    title: 'The Real New Yorker',
    art: 'boss-frankie',
    icon: '🚖',
    intro: 'Born in the Bronx, drive a cab in Manhattan. Talk to me like a real New Yorker and you’re one of us.',
    rounds: [
      { line: 'Where to, boss?', cardId: 'n5-1' },
      { line: 'Through the park or the West Side Highway?', cardId: 'n5-2' },
      { line: 'Look at this traffic! Nothing’s moving!', cardId: 'n5-3' },
      { line: 'So what’s the best food in this city, huh?', cardId: 'n5-4' },
      { line: 'You’re not from here, right? How long you been in the city?', cardId: 'n5-5' },
      { line: 'Here we are. Twenty-two fifty.', cardId: 'n5-6' },
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
