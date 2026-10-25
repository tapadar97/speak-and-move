import type { Level } from './cards';

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "i've": 'i have',
  "i'll": 'i will',
  "i'd": 'i would',
  "you're": 'you are',
  "we're": 'we are',
  "they're": 'they are',
  "it's": 'it is',
  "it'll": 'it will',
  "that's": 'that is',
  "what's": 'what is',
  "where's": 'where is',
  "how's": 'how is',
  "there's": 'there is',
  "let's": 'let us',
  "can't": 'can not',
  cannot: 'can not',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "isn't": 'is not',
  "aren't": 'are not',
  "won't": 'will not',
  "wasn't": 'was not',
};

const NUMBERS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
  eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', fifteen: '15', twenty: '20',
  thirty: '30',
};

/** Spoken and written forms the recogniser may split or join differently. */
const JOINS: [RegExp, string][] = [
  [/\bmetro card\b/g, 'metrocard'],
  [/\bmetro tech\b/g, 'metrotech'],
  [/\bokay\b/g, 'ok'],
  [/\balright\b/g, 'all right'],
  [/\bjay st\b/g, 'jay street'],
  [/\b(\d+):00\b/g, '$1'],
  [/\bo'clock\b/g, ''],
];

/** Words that never decide pass or fail. */
const OPTIONAL = new Set(['please', 'um', 'uh', 'so', 'oh']);

export function normalize(text: string): string[] {
  let s = text.toLowerCase().replace(/[’‘`]/g, "'");
  s = s.replace(/[^a-z0-9' :]+/g, ' ');
  for (const [re, rep] of JOINS) s = s.replace(re, rep);
  return s
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) => (CONTRACTIONS[w] ?? w).split(' '))
    .map((w) => NUMBERS[w] ?? w.replace(/^'+|'+$/g, ''))
    .filter(Boolean);
}

export interface WordResult {
  word: string;
  ok: boolean;
}

export interface MatchResult {
  pass: boolean;
  score: number;
  /** The expected sentence, word by word, marked right or missing. */
  words: WordResult[];
  heard: string;
}

/** Longest common subsequence; returns which target words were matched. */
function matchedWords(target: string[], heard: string[]): boolean[] {
  const n = target.length;
  const m = heard.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = target[i] === heard[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ok = new Array<boolean>(n).fill(false);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (target[i] === heard[j]) {
      ok[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return ok;
}

/** How much of the sentence must be right: short phrases need every word. */
export function required(count: number, level: Level): number {
  if (count <= 3) return count;
  return Math.ceil(count * (level === 3 ? 0.75 : 0.8));
}

function scoreOne(target: string, heard: string, level: Level, strict: boolean) {
  const tWords = normalize(target);
  const hWords = normalize(heard);
  const ok = matchedWords(tWords, hWords);
  const counted = tWords.map((w, i) => ({ w, ok: ok[i] })).filter((x) => !OPTIONAL.has(x.w));
  const hits = counted.filter((x) => x.ok).length;
  const need = strict ? counted.length : required(counted.length, level);
  return {
    pass: hits >= need,
    score: counted.length ? hits / counted.length : 0,
    tWords,
    ok,
  };
}

/**
 * Compare what was heard (all recogniser alternatives, or typed text) with the
 * target and its accepted variants. Returns the best match, word by word.
 * `strict` (Fix it cards) needs every word, because the fixed word is the point.
 */
export function matchSpeech(
  target: string,
  accept: string[] = [],
  heardAlts: string[],
  level: Level,
  strict = false,
): MatchResult {
  const candidates = [target, ...accept];
  let best: (ReturnType<typeof scoreOne> & { heard: string; display: string }) | null = null;
  for (const heard of heardAlts.length ? heardAlts : ['']) {
    for (const c of candidates) {
      const r = scoreOne(c, heard, level, strict);
      const better =
        !best || (r.pass && !best.pass) || (r.pass === best.pass && r.score > best.score);
      if (better) best = { ...r, heard, display: c };
    }
  }
  const b = best!;
  // Show the words in their written form so the player sees the sentence they know.
  const shown = b.display.replace(/[.?!,]/g, '').split(/\s+/).filter(Boolean);
  let k = 0;
  const words: WordResult[] = shown.map((word) => {
    const parts = normalize(word);
    const slice = b.ok.slice(k, k + parts.length);
    k += parts.length;
    const ok = (slice.length > 0 && slice.every(Boolean)) || parts.every((p) => OPTIONAL.has(p));
    return { word, ok };
  });
  return { pass: b.pass, score: b.score, words, heard: b.heard };
}
