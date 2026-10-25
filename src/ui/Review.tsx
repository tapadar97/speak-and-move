import { useState } from 'react';
import { cardById } from '../game/cards';
import { CardSheet } from './CardSheet';

interface Props {
  ids: string[];
  sound: boolean;
  bangla: boolean;
  onResult: (cardId: string, right: boolean) => void;
  onExit: () => void;
}

/** Practise due phrases one after another. Right on the first try pushes a phrase further out. */
export function Review({ ids, sound, bangla, onResult, onExit }: Props) {
  const [queue] = useState(ids);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const card = queue[i] ? cardById(queue[i]) : undefined;

  if (!card) {
    return (
      <div className="screen review-done">
        <h1 className="end__title is-win">Review done</h1>
        <p className="tagline">
          {right} of {queue.length} right first try. Phrases you missed come back tomorrow.
        </p>
        <button type="button" className="btn btn--go btn--big" onClick={onExit}>
          Back home
        </button>
      </div>
    );
  }

  return (
    <div className="screen review">
      <header className="review__head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back home">
          ←
        </button>
        <div>
          <p className="review__count">
            Review {i + 1} of {queue.length}
          </p>
          <p className="review__why">Phrases you missed. Get one right and it comes back later, until you know it.</p>
        </div>
      </header>
      <CardSheet
        key={card.id}
        card={card}
        mode="review"
        sound={sound}
        bangla={bangla}
        onDone={(d) => {
          const ok = d.right && !d.retry;
          if (ok) setRight((n) => n + 1);
          onResult(card.id, ok);
          setI((n) => n + 1);
        }}
      />
    </div>
  );
}
