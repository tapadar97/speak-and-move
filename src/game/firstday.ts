import type { Level } from './cards';
import { clampStat, type Stats } from './stats';

/**
 * read   – a hint shows the sentence; say it (tests Voice)
 * repeat – hear it with text hidden; say it back (Ear)
 * fix    – a sentence with a mistake; say it correctly (Grammar)
 * recall – see the Bangla; say it in English (Words)
 * talk   – talk freely for up to 30 seconds (Words + Speed)
 * reply  – answer a question quickly; a hint shows a model answer (Speed)
 */
export type SceneTask = 'read' | 'repeat' | 'fix' | 'recall' | 'talk' | 'reply';

export interface SceneVariant {
  /** What the character says. */
  line: string;
  target?: string;
  accept?: string[];
  /** fix: the wrong sentence. recall: the Bangla to say in English. */
  prompt?: string;
}

export interface Scene {
  id: string;
  who: string;
  art: string;
  icon: string;
  task: SceneTask;
  /** Instruction shown above the answer area. */
  ask: string;
  askBn: string;
  /** Index 0–2 for levels 1–3. The talk scene has one variant. */
  variants: SceneVariant[];
}

export const SCENES: Scene[] = [
  {
    id: 'taxi',
    who: 'Taxi driver',
    art: 'taxi-driver',
    icon: '🚕',
    task: 'read',
    ask: 'Tell him where to go. Say the hint.',
    askBn: 'কোথায় যাবেন বলুন। সংকেতটা বলুন।',
    variants: [
      { line: 'Where to?', target: 'Times Square, please.' },
      { line: 'Where to, my friend?', target: 'Can you take me to Times Square, please?' },
      { line: 'Where are we headed?', target: "Could you take me to Grand Central? I'm in a bit of a hurry." },
    ],
  },
  {
    id: 'subway',
    who: 'Train announcement',
    art: 'announcer',
    icon: '🚇',
    task: 'repeat',
    ask: 'Listen, then say exactly what you heard.',
    askBn: 'শুনুন, তারপর যা শুনলেন ঠিক তাই বলুন।',
    variants: [
      { line: 'Stand clear of the closing doors.', target: 'Stand clear of the closing doors.' },
      { line: 'The next stop is Union Square. Stand clear of the doors.', target: 'The next stop is Union Square. Stand clear of the doors.' },
      {
        line: 'We are being held momentarily by the train dispatcher. We will be moving shortly.',
        target: 'We are being held momentarily by the train dispatcher. We will be moving shortly.',
      },
    ],
  },
  {
    id: 'deli',
    who: 'Deli worker',
    art: 'deli-worker',
    icon: '🥯',
    task: 'fix',
    ask: 'This sentence has a mistake. Say it the right way.',
    askBn: 'বাক্যে একটা ভুল আছে। ঠিক করে বলুন।',
    variants: [
      { line: 'What can I get you?', prompt: 'Can I has a coffee?', target: 'Can I have a coffee?' },
      { line: 'What else, hon?', prompt: 'How much it costs?', target: 'How much does it cost?' },
      { line: 'Sorry, we close at six today.', prompt: "I didn't knew you closed so early.", target: "I didn't know you closed so early." },
    ],
  },
  {
    id: 'home',
    who: 'Landlord',
    art: 'landlord',
    icon: '🏠',
    task: 'recall',
    ask: 'Say this in English.',
    askBn: 'এটা ইংরেজিতে বলুন।',
    variants: [
      { line: "So, what's the problem?", prompt: 'আমার চাবি কাজ করছে না।', target: "My key doesn't work.", accept: ["My key isn't working", 'My key is not working'] },
      {
        line: "Yeah? What's wrong now?",
        prompt: 'সোমবার থেকে হিটারটা নষ্ট।',
        target: 'The heater has been broken since Monday.',
        accept: ["The heater's been broken since Monday"],
      },
      {
        line: "I'm busy. Make it quick.",
        prompt: 'কেউ কি আজ এসে রান্নাঘরের সিঙ্কটা ঠিক করে দিতে পারবেন?',
        target: 'Can someone come today and fix the kitchen sink?',
        accept: ['Could someone come today to fix the kitchen sink', 'Can someone come and fix the kitchen sink today'],
      },
    ],
  },
  {
    id: 'neighbor',
    who: 'Rosa, your neighbor',
    art: 'neighbor',
    icon: '👋',
    task: 'talk',
    ask: 'Talk for up to 30 seconds: your name, where you are from, your work, what you like.',
    askBn: '৩০ সেকেন্ড কথা বলুন: নাম, কোথা থেকে এসেছেন, কাজ, কী ভালো লাগে।',
    variants: [{ line: "Hi! I'm Rosa from 3B. Tell me about yourself!" }],
  },
  {
    id: 'boss',
    who: 'Your boss (phone)',
    art: 'office-boss',
    icon: '💼',
    task: 'reply',
    ask: 'Answer quickly. You can use the hint.',
    askBn: 'তাড়াতাড়ি উত্তর দিন। সংকেত ব্যবহার করতে পারেন।',
    variants: [
      {
        line: 'Can you come in tomorrow?',
        target: 'Yes, I can.',
        accept: ['Yes I can come tomorrow', 'Yes I can come in tomorrow', 'Sure I can', "No I can't", 'No sorry I can not'],
      },
      {
        line: 'What time can you start tomorrow?',
        target: 'I can start at XNUM.',
        accept: ['I can be there at XNUM', 'I can come at XNUM', 'I can start at XNUM tomorrow'],
      },
      {
        line: 'The client moved the meeting to Friday. Can you get the report done by then?',
        target: 'Yes, I can have it ready by Friday.',
        accept: ['Yes I can finish it by Friday', 'Sure I can get it done by Friday', 'Yes I can do it by Friday', 'No problem I can have it done by Friday'],
      },
    ],
  },
];

/** Shown as the reply hint, with the wildcard as a real example. */
export const exampleOf = (target = '') => target.replace(/XNUM/g, '9');

export interface SceneResult {
  sceneId: string;
  level: Level;
  pass: boolean;
  /** 0–1 share of words right. */
  score: number;
  /** talk: words spoken, unique words, words per minute (null when typed). */
  words?: number;
  unique?: number;
  wpm?: number | null;
  /** reply: milliseconds from the question ending to the answer. */
  ms?: number;
}

/** Start in the middle; go up after a pass, down after a miss. */
export function nextLevel(current: Level, pass: boolean): Level {
  return Math.max(1, Math.min(3, current + (pass ? 1 : -1))) as Level;
}

/** 15–100 from how hard the scene was and how much was right. */
export function sceneValue(r: SceneResult): number {
  return clampStat(15 + (r.level - 1) * 25 + r.score * 35 - (r.pass ? 0 : 10));
}

export const wpmScore = (wpm: number) => clampStat((wpm - 20) / 1.2);
export const uniqueScore = (unique: number) => clampStat(unique * 2.5);

function responseFactor(ms = 10_000): number {
  if (ms < 3000) return 1;
  if (ms < 6000) return 0.85;
  return 0.7;
}

/** Turn the six scene results into the five starting stats. */
export function scoreFirstDay(results: SceneResult[]): Stats {
  const by = (id: string) => results.find((r) => r.sceneId === id);
  const v = (id: string, fallback = 25) => {
    const r = by(id);
    return r ? sceneValue(r) : fallback;
  };
  const talk = by('neighbor');
  const reply = by('boss');
  const replyValue = reply ? sceneValue(reply) * responseFactor(reply.ms) : 25;
  const talkWords = talk ? uniqueScore(talk.unique ?? 0) : 25;
  const speed = talk?.wpm != null ? (wpmScore(talk.wpm) + replyValue) / 2 : replyValue;
  return {
    voice: v('taxi'),
    ear: v('subway'),
    grammar: v('deli'),
    words: clampStat((v('home') + talkWords) / 2),
    speed: clampStat(speed),
  };
}

/** Count words in free talk. */
export function talkCounts(text: string): { words: number; unique: number } {
  const ws = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return { words: ws.length, unique: new Set(ws).size };
}
