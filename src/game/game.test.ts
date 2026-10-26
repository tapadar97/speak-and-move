import { describe, expect, it } from 'vitest';
import { CARDS, PLACES, cardById, type Level, type WorldId } from './cards';
import { HOME, START, botChoice, cellOf, drawCard, expressOf, move, placeAt, preview } from './board';
import { BOSSES, BOSS_HP, HEARTS, answer, startBattle, starsFor } from './bosses';
import { SCENES, exampleOf, nextLevel, scoreFirstDay, talkCounts, type SceneResult } from './firstday';
import { matchSpeech, normalize } from './match';
import { NEW_PROFILE, currentWorld, isUnlocked } from './profile';
import { addMistake, dueItems, reviewed } from './review';
import { grow, rankIndex, typeWeights, weakest, type Stats } from './stats';
import { WORLDS } from './worlds';
import { PACKS, REPLIES, SITUATIONS, WHY } from './learning';
import { afterAnswer, dueRepeat, expected, gapIndexes, gapText, modeFor, scheduleRepeat, stepOf } from './mastery';
import { DAILY_GOAL, countGood, liveStreak, recheckDue, weekDays } from './profile';

const WORLD_IDS: WorldId[] = [1, 2];

describe('phrase cards', () => {
  it('every place used on a board has easy, medium and hard cards', () => {
    for (const w of WORLD_IDS) {
      const places = new Set(WORLDS[w - 1].layout);
      for (const place of places) {
        for (const level of [1, 2, 3] as Level[]) {
          expect(CARDS.some((c) => c.world === w && c.place === place && c.level === level), `W${w} ${place} L${level}`).toBe(true);
        }
      }
    }
  });

  it('cards are complete, ids unique, places known', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    for (const c of CARDS) {
      expect(PLACES[c.place], c.id).toBeTruthy();
      expect(c.bn.length, c.id).toBeGreaterThan(3);
      if (c.type === 'fix' || c.type === 'recall') expect(c.prompt, c.id).toBeTruthy();
    }
  });

  it('every card passes when said exactly, and its accepted variants pass too', () => {
    for (const c of CARDS) {
      expect(matchSpeech(c.target, c.accept, [c.target], c.level).pass, c.id).toBe(true);
      for (const a of c.accept ?? []) expect(matchSpeech(c.target, c.accept, [a], c.level).pass, `${c.id}: ${a}`).toBe(true);
    }
  });

  it('a fix card fails if you repeat the mistake', () => {
    for (const c of CARDS.filter((x) => x.type === 'fix')) {
      expect(matchSpeech(c.target, c.accept, [c.prompt!], c.level, true).pass, c.id).toBe(false);
    }
  });
});

describe('speech matching', () => {
  it('ignores case, punctuation and contractions', () => {
    expect(normalize("I'm all set, THANKS.")).toEqual(['i', 'am', 'all', 'set', 'thanks']);
    expect(normalize("It'll be ready in about twenty minutes")).toContain('20');
  });

  it('accepts recogniser spellings like "metro card" and digits', () => {
    expect(matchSpeech('Where can I buy a MetroCard?', [], ['where can i buy a metro card'], 2).pass).toBe(true);
    expect(matchSpeech('I have an appointment at three.', [], ['I have an appointment at 3:00'], 1).pass).toBe(true);
  });

  it('"please" is optional and short phrases need every word', () => {
    expect(matchSpeech('Can I get a coffee, please?', [], ['can I get a coffee'], 1).pass).toBe(true);
    expect(matchSpeech('My throat hurts.', [], ['my throat'], 1).pass).toBe(false);
  });

  it('XNUM accepts any number or time, and shows as a blank', () => {
    expect(matchSpeech('I can start at XNUM.', [], ['I can start at 9'], 2).pass).toBe(true);
    expect(matchSpeech('I can start at XNUM.', [], ['I can start at nine thirty'], 2).pass).toBe(true);
    expect(matchSpeech('I can start at XNUM.', [], ['I can start at noon'], 2).pass).toBe(true);
    const r = matchSpeech('I can start at XNUM.', [], ['I can start'], 2);
    expect(r.words.at(-1)).toEqual({ word: '…', ok: false });
    expect(exampleOf('I can start at XNUM.')).toBe('I can start at 9.');
  });

  it('marks the missing word', () => {
    const r = matchSpeech('Does this train go to Queens?', [], ['does this train to queens'], 1);
    expect(r.words.find((w) => w.word === 'go')?.ok).toBe(false);
  });
});

describe('board', () => {
  it('the ring visits 20 distinct edge cells, and Home sits just below Start', () => {
    const cells = Array.from({ length: HOME }, (_, i) => cellOf(i + 1));
    expect(new Set(cells.map((c) => `${c.row},${c.col}`)).size).toBe(HOME);
    for (const c of cells) expect(c.row === 0 || c.row === 5 || c.col === 0 || c.col === 5).toBe(true);
    expect(cellOf(START)).toEqual({ row: 0, col: 0 });
    expect(cellOf(HOME)).toEqual({ row: 1, col: 0 });
  });

  it('every playable world has 18 places and forward express rides from a train square', () => {
    for (const w of WORLD_IDS) {
      expect(WORLDS[w - 1].layout).toHaveLength(18);
      for (const [from, to] of Object.entries(expressOf(w))) {
        expect(Number(to)).toBeGreaterThan(Number(from));
        expect(['subway', 'train']).toContain(placeAt(w, Number(from)));
      }
    }
  });

  it('moves, rides the express and bumps the other player back 2', () => {
    const r = move(1, { you: 2, bot: 8 }, 'you', 2);
    expect(r.express).toEqual({ from: 4, to: 8 });
    expect(r.players.you).toBe(8);
    expect(r.bumped).toBe(true);
    expect(r.players.bot).toBe(6);
  });

  it('reaching Home wins, even with steps to spare', () => {
    const r = move(2, { you: 18, bot: 1 }, 'you', 3);
    expect(r.won).toBe(true);
    expect(r.players.you).toBe(HOME);
  });

  it('previews say where each choice lands, including express and bumps', () => {
    expect(preview(1, 2, 2, 1)).toMatchObject({ square: 4, to: 8, express: true });
    expect(preview(1, 5, 1, 6)).toMatchObject({ to: 6, bump: true });
    expect(preview(1, 18, 3, 1)).toMatchObject({ home: true });
  });

  it('draws a card of the chosen world and level, from the place you land on', () => {
    const c = drawCard(2, 2, 2, []); // square 2 in world 2 is the turnstile
    expect(c.world).toBe(2);
    expect(c.level).toBe(2);
    expect(c.place).toBe('turnstile');
  });

  it('weak stats make their card type more likely', () => {
    const weakEar: Stats = { ear: 10, voice: 90, grammar: 90, words: 90, speed: 50 };
    const w = typeWeights(weakEar);
    expect(w.listen).toBeGreaterThan(w.say);
    let listens = 0;
    let seed = 3;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 400; i++) if (drawCard(1, 2, 9, [], weakEar, rng).type === 'listen') listens++;
    expect(listens).toBeGreaterThan(120);
  });

  it('the rival takes risks when behind and plays safe near Home', () => {
    expect(botChoice({ you: 12, bot: 5 })).toBe(3);
    expect(botChoice({ you: 3, bot: 19 })).toBe(1);
  });
});

describe('First Day level check', () => {
  it('has six scenes; every answer scene has three levels whose targets pass', () => {
    expect(SCENES).toHaveLength(6);
    for (const s of SCENES) {
      if (s.task === 'talk') continue;
      expect(s.variants, s.id).toHaveLength(3);
      for (const [i, v] of s.variants.entries()) {
        const said = exampleOf(v.target);
        expect(matchSpeech(v.target!, v.accept, [said], (i + 1) as Level, s.task === 'fix').pass, `${s.id} L${i + 1}`).toBe(true);
        if (s.task === 'fix') expect(matchSpeech(v.target!, v.accept, [v.prompt!], (i + 1) as Level, true).pass).toBe(false);
      }
    }
  });

  it('moves up after a pass and down after a miss, within 1–3', () => {
    expect(nextLevel(2, true)).toBe(3);
    expect(nextLevel(3, true)).toBe(3);
    expect(nextLevel(1, false)).toBe(1);
  });

  const run = (level: 1 | 2 | 3, pass: boolean, score: number, wpm: number, unique: number): SceneResult[] =>
    SCENES.map((s) =>
      s.task === 'talk'
        ? { sceneId: s.id, level: 1, pass: true, score: 1, words: unique * 2, unique, wpm }
        : { sceneId: s.id, level, pass, score, ms: 2000 },
    );

  it('a strong speaker ranks high and a beginner ranks low', () => {
    const strong = scoreFirstDay(run(3, true, 1, 140, 45));
    const weak = scoreFirstDay(run(1, false, 0.3, 30, 6));
    expect(rankIndex(strong)).toBeGreaterThanOrEqual(3);
    expect(rankIndex(weak)).toBe(0);
    for (const v of Object.values(strong)) expect(v).toBeLessThanOrEqual(100);
  });

  it('typed free talk does not count toward speed', () => {
    const r = run(2, true, 1, 0, 20).map((x) => (x.sceneId === 'neighbor' ? { ...x, wpm: null } : x));
    expect(scoreFirstDay(r).speed).toBeGreaterThan(0);
  });

  it('counts words and unique words in free talk', () => {
    expect(talkCounts("Hi, I'm Rahim. I'm from Dhaka, I'm a driver.")).toEqual({ words: 9, unique: 7 });
  });
});

describe('stats and ranks', () => {
  const s: Stats = { ear: 42, voice: 58, grammar: 35, words: 50, speed: 40 };

  it('finds the weakest stat and the rank', () => {
    expect(weakest(s)).toBe('grammar');
    expect(rankIndex(s)).toBe(1); // average 45 → Rookie, as on the character card design
  });

  it('grows weak stats faster and never above 100', () => {
    const weakGain = grow(s, 'grammar', true).grammar - s.grammar;
    const strongGain = grow({ ...s, grammar: 95 }, 'grammar', true).grammar - 95;
    expect(weakGain).toBeGreaterThan(strongGain);
    expect(grow({ ...s, ear: 100 }, 'ear', true).ear).toBe(100);
  });
});

describe('boss battle', () => {
  it('every boss line target passes when said exactly', () => {
    for (const b of Object.values(BOSSES)) {
      for (const r of b.rounds) {
        const c = cardById(r.cardId)!;
        expect(c, r.cardId).toBeTruthy();
        expect(matchSpeech(c.target, c.accept, [c.target], 2).pass, c.target).toBe(true);
      }
      expect(b.rounds.length).toBeGreaterThanOrEqual(BOSS_HP);
    }
  });

  it('five right answers win; a miss costs a heart and the round comes back later', () => {
    let s = startBattle(BOSSES[1]);
    s = answer(s, false, 5000);
    expect(s.hearts).toBe(HEARTS - 1);
    expect(s.queue.at(-1)).toBe(0);
    for (let i = 0; i < BOSS_HP; i++) s = answer(s, true, 3000);
    expect(s.over).toBe('won');
    expect(starsFor(s)).toBe(2);
    expect(s.bestCombo).toBe(5);
  });

  it('three misses lose', () => {
    let s = startBattle(BOSSES[2]);
    for (let i = 0; i < HEARTS; i++) s = answer(s, false, 20000);
    expect(s.over).toBe('lost');
    expect(starsFor(s)).toBe(0);
  });
});

describe('worlds and progress', () => {
  it('World 2 opens after clearing World 1, or for a Local rank or higher', () => {
    expect(isUnlocked(NEW_PROFILE, 2, 1)).toBe(false);
    expect(isUnlocked(NEW_PROFILE, 2, 2)).toBe(true);
    const cleared = { ...NEW_PROFILE, worlds: { ...NEW_PROFILE.worlds, 1: { raceWins: 1, stars: 2, startStats: null } } };
    expect(currentWorld(cleared, 0)).toBe(2);
  });
});

describe('review deck', () => {
  it('a mistake comes back after 1, 3 and 7 days, then leaves', () => {
    let d = addMistake({}, 'deli-1', '2026-10-24');
    expect(dueItems(d, '2026-10-24')).toHaveLength(0);
    d = reviewed(d, 'deli-1', true, '2026-10-25');
    d = reviewed(d, 'deli-1', true, '2026-10-28');
    d = reviewed(d, 'deli-1', true, '2026-11-04');
    expect(d['deli-1']).toBeUndefined();
  });
});

describe('teaching content', () => {
  it('every card has a real-life situation for its last step', () => {
    for (const c of CARDS) expect(SITUATIONS[c.id] ?? c.prompt, c.id).toBeTruthy();
  });

  it('every Fix it card explains why, in English and Bangla', () => {
    for (const c of CARDS.filter((x) => x.type === 'fix')) {
      expect(WHY[c.id]?.en, c.id).toBeTruthy();
      expect(WHY[c.id]?.bn, c.id).toBeTruthy();
    }
  });

  it('listen replies accept their own answers', () => {
    for (const [id, r] of Object.entries(REPLIES)) {
      expect(cardById(id)?.type, id).toBe('listen');
      const said = r.target.replace(/XNUM/g, '12');
      expect(matchSpeech(r.target, r.accept, [said], 2).pass, id).toBe(true);
      for (const a of r.accept ?? []) expect(matchSpeech(r.target, r.accept, [a.replace(/XNUM/g, '12')], 2).pass, `${id}: ${a}`).toBe(true);
    }
  });

  it('each world has an 8-phrase pack from its own cards, and the boss uses the first 6', () => {
    for (const w of WORLD_IDS) {
      expect(PACKS[w]).toHaveLength(8);
      for (const id of PACKS[w]) expect(cardById(id)?.world, id).toBe(w);
      expect(BOSSES[w].rounds.map((r) => r.cardId)).toEqual(PACKS[w].slice(0, 6));
    }
  });
});

describe('mastery steps', () => {
  const say = cardById('deli-1')!;
  const fix = cardById('deli-5')!;
  const listen = cardById('deli-4')!;

  it('the card gives less help as you climb', () => {
    expect([0, 1, 2, 3].map((s) => modeFor(say, s))).toEqual(['say', 'gap', 'bangla', 'situation']);
    expect([0, 1, 2, 3].map((s) => modeFor(fix, s))).toEqual(['fix', 'fix', 'bangla', 'situation']);
    expect(modeFor(listen, 1)).toBe('answer');
  });

  it('right first time climbs, a miss drops, a second-try save holds', () => {
    let m = afterAnswer({}, 'deli-1', true, true);
    expect(stepOf(m, 'deli-1')).toBe(1);
    m = afterAnswer(m, 'deli-1', true, false);
    expect(stepOf(m, 'deli-1')).toBe(1);
    m = afterAnswer(m, 'deli-1', false, false);
    expect(stepOf(m, 'deli-1')).toBe(0);
    m = afterAnswer(m, 'deli-1', false, false);
    expect(stepOf(m, 'deli-1')).toBe(0);
  });

  it('Listen & answer checks the reply, not the line you heard', () => {
    const e = expected(listen, 'answer');
    expect(e.target).toBe(REPLIES['deli-4'].target);
    expect(expected(fix, 'fix').strict).toBe(true);
  });

  it('gap blanks 1–2 key words and keeps the rest', () => {
    expect(gapIndexes('Can I get a coffee, please?')).toHaveLength(1);
    expect(gapText('Can I get a coffee, please?')).toBe('Can I get a ____, please?');
    expect(gapIndexes('Take one pill twice a day after meals.')).toHaveLength(2);
    for (const c of CARDS) expect(gapText(c.target), c.id).toContain('____');
  });

  it('a missed card comes back 3 turns later, once', () => {
    let list = scheduleRepeat([], 'deli-1', 2);
    list = scheduleRepeat(list, 'deli-1', 3);
    expect(list).toHaveLength(1);
    expect(dueRepeat(list, 4)).toBeNull();
    expect(dueRepeat(list, 5)?.cardId).toBe('deli-1');
  });
});

describe('daily goal, streak and re-check', () => {
  it('meeting the goal on consecutive days builds a streak', () => {
    let p = { ...NEW_PROFILE };
    const day1 = '2026-10-26';
    for (let i = 0; i < DAILY_GOAL; i++) p = { ...p, ...countGood(p, day1) };
    expect(p.streak).toEqual({ last: day1, days: 1 });
    const day2 = '2026-10-27';
    for (let i = 0; i < DAILY_GOAL; i++) p = { ...p, ...countGood(p, day2) };
    expect(p.streak.days).toBe(2);
    expect(p.goalDays).toEqual([day1, day2]);
    expect(liveStreak(p, '2026-10-29')).toBe(0);
  });

  it('the week row runs Monday to Sunday', () => {
    expect(weekDays('2026-10-29')).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  });

  it('the weekly check is due 7 days after the last one', () => {
    const p = { ...NEW_PROFILE, firstDayDate: '2026-10-20' };
    expect(recheckDue(p, '2026-10-26')).toBe(false);
    expect(recheckDue(p, '2026-10-27')).toBe(true);
  });
});
