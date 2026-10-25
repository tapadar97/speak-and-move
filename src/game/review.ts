/** Spaced repetition: a missed phrase comes back after 1 day, then 3, then 7. */
export const INTERVALS = [1, 3, 7];

export interface ReviewItem {
  cardId: string;
  /** Index into INTERVALS. */
  step: number;
  due: string;
  misses: number;
}

export type ReviewDeck = Record<string, ReviewItem>;

export function addDays(day: string, n: number): string {
  const d = new Date(Date.parse(`${day}T12:00:00Z`) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function today(d: Date = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** A mistake: (re)start the phrase at the first interval. */
export function addMistake(deck: ReviewDeck, cardId: string, day: string): ReviewDeck {
  const old = deck[cardId];
  return {
    ...deck,
    [cardId]: { cardId, step: 0, due: addDays(day, INTERVALS[0]), misses: (old?.misses ?? 0) + 1 },
  };
}

/** Result of reviewing a due phrase. After the last interval it leaves the deck. */
export function reviewed(deck: ReviewDeck, cardId: string, right: boolean, day: string): ReviewDeck {
  const item = deck[cardId];
  if (!item) return deck;
  if (!right) return addMistake(deck, cardId, day);
  const step = item.step + 1;
  if (step >= INTERVALS.length) {
    const { [cardId]: _done, ...rest } = deck;
    return rest;
  }
  return { ...deck, [cardId]: { ...item, step, due: addDays(day, INTERVALS[step]) } };
}

export const dueItems = (deck: ReviewDeck, day: string) =>
  Object.values(deck)
    .filter((i) => i.due <= day)
    .sort((a, b) => a.due.localeCompare(b.due));

export function nextDue(deck: ReviewDeck): string | null {
  const days = Object.values(deck).map((i) => i.due).sort();
  return days[0] ?? null;
}
