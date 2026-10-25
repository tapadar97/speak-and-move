import { describe, expect, it } from 'vitest';
import { CARDS, PLACES, type Level } from './cards';
import { EXPRESS, HOME, botChoice, cellOf, drawCard, move, placeAt } from './board';
import { matchSpeech, normalize } from './match';
import { addMistake, dueItems, reviewed } from './review';

describe('phrase cards', () => {
  it('every place has easy, medium and hard cards', () => {
    for (const place of Object.keys(PLACES)) {
      for (const level of [1, 2, 3] as Level[]) {
        expect(CARDS.some((c) => c.place === place && c.level === level), `${place} L${level}`).toBe(true);
      }
    }
  });

  it('cards are complete and ids unique', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    for (const c of CARDS) {
      expect(c.target.length, c.id).toBeGreaterThan(3);
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

  it('"please" is optional', () => {
    expect(matchSpeech('Can I get a coffee, please?', [], ['can I get a coffee'], 1).pass).toBe(true);
  });

  it('short phrases need every word', () => {
    expect(matchSpeech('My throat hurts.', [], ['my throat'], 1).pass).toBe(false);
  });

  it('marks the missing word so the player can see it', () => {
    const r = matchSpeech('Does this train go to Queens?', [], ['does this train to queens'], 1);
    expect(r.words.find((w) => w.word === 'go')?.ok).toBe(false);
    expect(r.words.find((w) => w.word === 'Queens')?.ok).toBe(true);
  });

  it('picks the best of several recogniser guesses', () => {
    const r = matchSpeech('Is this machine free?', [], ['is this mushin three', 'is this machine free'], 1);
    expect(r.pass).toBe(true);
  });

  it('wrong grammar fails', () => {
    expect(matchSpeech("I've been sick since Monday.", [], ['I am sick since Monday'], 2).pass).toBe(false);
  });
});

describe('board', () => {
  it('the snake path visits 21 distinct cells and Home sits above square 19', () => {
    const cells = new Set(Array.from({ length: HOME + 1 }, (_, i) => JSON.stringify(cellOf(i))));
    expect(cells.size).toBe(HOME + 1);
    expect(cellOf(19)).toEqual({ row: 1, col: 0 });
    expect(cellOf(HOME)).toEqual({ row: 0, col: 0 });
  });

  it('express squares are subway squares', () => {
    for (const from of Object.keys(EXPRESS)) expect(placeAt(Number(from))).toBe('subway');
  });

  it('moves, rides the express and bumps the other player back 2', () => {
    const r = move({ you: 0, bot: 5 }, 'you', 2);
    expect(r.express).toEqual({ from: 2, to: 5 });
    expect(r.players.you).toBe(5);
    expect(r.bumped).toBe(true);
    expect(r.players.bot).toBe(3);
  });

  it('reaching Home wins, even with steps to spare', () => {
    const r = move({ you: 18, bot: 0 }, 'you', 3);
    expect(r.won).toBe(true);
    expect(r.players.you).toBe(HOME);
  });

  it('draws a card of the chosen level, from the place you stand on', () => {
    const c = drawCard(2, 1, []); // square 1 is the deli
    expect(c.level).toBe(2);
    expect(c.place).toBe('deli');
  });

  it('avoids repeating recent cards', () => {
    const recent = CARDS.filter((c) => c.level === 1 && c.place === 'deli').map((c) => c.id);
    expect(recent).not.toContain(drawCard(1, 1, recent).id);
  });

  it('bot takes risks when behind and plays safe near Home', () => {
    expect(botChoice({ you: 10, bot: 4 })).toBe(3);
    expect(botChoice({ you: 3, bot: 19 })).toBe(1);
  });
});

describe('review deck', () => {
  it('a mistake comes back tomorrow, then after 3 days, then 7, then leaves', () => {
    let d = addMistake({}, 'deli-1', '2026-10-24');
    expect(d['deli-1'].due).toBe('2026-10-25');
    expect(dueItems(d, '2026-10-24')).toHaveLength(0);
    d = reviewed(d, 'deli-1', true, '2026-10-25');
    expect(d['deli-1'].due).toBe('2026-10-28');
    d = reviewed(d, 'deli-1', true, '2026-10-28');
    expect(d['deli-1'].due).toBe('2026-11-04');
    d = reviewed(d, 'deli-1', true, '2026-11-04');
    expect(d['deli-1']).toBeUndefined();
  });

  it('getting it wrong in review starts it over', () => {
    let d = addMistake({}, 'deli-1', '2026-10-24');
    d = reviewed(d, 'deli-1', true, '2026-10-25');
    d = reviewed(d, 'deli-1', false, '2026-10-28');
    expect(d['deli-1'].step).toBe(0);
    expect(d['deli-1'].misses).toBe(2);
  });
});
