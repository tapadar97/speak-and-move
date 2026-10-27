import { useState } from 'react';
import { cardById, type Card } from '../game/cards';
import { modeFor, stepOf, type Mastery, type Mode } from '../game/mastery';
import { CardSheet } from './CardSheet';

interface Props {
  ids: string[];
  mastery: Mastery;
  sound: boolean;
  bangla: boolean;
  title?: string;
  why?: string;
  onResult: (card: Card, mode: Mode, right: boolean, firstTry: boolean, typed: boolean) => void;
  onExit: () => void;
}

/** Practise a list of phrases one after another (review deck or phrasebook). */
export function Review({ ids, mastery, sound, bangla, title = 'Review', why, onResult, onExit }: Props) {
  // Freeze each card's step when the session starts, so a phrase doesn't change mid-card.
  const [queue] = useState(() => ids.map((id) => ({ id, step: stepOf(mastery, id) })));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const item = queue[i];
  const card = item ? cardById(item.id) : undefined;

  if (!card) {
    return (
      <div className="screen review-done">
        <h1 className="end__title is-win">{title} done</h1>
        <p className="tagline">
          {right} of {queue.length} right first try. Phrases you missed come back tomorrow.
        </p>
        <button type="button" className="btn btn--go btn--big" onClick={onExit}>
          Done
        </button>
      </div>
    );
  }

  const mode = modeFor(card, item.step);
  return (
    <div className="screen review">
      <header className="review__head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back">
          ←
        </button>
        <div>
          <p className="review__count">
            {title} {i + 1} of {queue.length}
          </p>
          <p className="review__why">{why ?? 'Phrases you missed. Get one right and it comes back later, until you know it.'}</p>
        </div>
      </header>
      <CardSheet
        key={`${card.id}-${i}`}
        card={card}
        mode={mode}
        step={item.step}
        context="practice"
        sound={sound}
        bangla={bangla}
        onDone={(d) => {
          const first = d.right && !d.retry;
          if (first) setRight((n) => n + 1);
          onResult(card, mode, d.right, first, d.typed);
          setI((n) => n + 1);
        }}
      />
    </div>
  );
}
