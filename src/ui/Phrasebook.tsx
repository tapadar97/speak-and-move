import { useState } from 'react';
import { CARDS, PLACES, type WorldId } from '../game/cards';
import { MAX_STEP, STEP_NAME, stepOf, type Mastery } from '../game/mastery';
import { sayPhrase } from '../speech';
import { WORLDS } from '../game/worlds';
import { StepStars } from './CardSheet';
import { SpeakerIcon } from './kit';

interface Props {
  mastery: Mastery;
  bangla: boolean;
  startWorld: WorldId;
  onPractise: (ids: string[]) => void;
  onExit: () => void;
}

/** Every phrase with its mastery stars, weakest first, so you can see what you know. */
export function Phrasebook({ mastery, bangla, startWorld, onPractise, onExit }: Props) {
  const [world, setWorld] = useState<WorldId>(startWorld);
  const cards = CARDS.filter((c) => c.world === world).sort((a, b) => stepOf(mastery, a.id) - stepOf(mastery, b.id) || a.id.localeCompare(b.id));
  const mastered = cards.filter((c) => stepOf(mastery, c.id) >= MAX_STEP).length;
  const counts = [0, 1, 2, 3].map((s) => cards.filter((c) => stepOf(mastery, c.id) === s).length);
  const weakest = cards.slice(0, 5).map((c) => c.id);

  return (
    <div className="screen book-screen">
      <header className="review__head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back to the map">
          ←
        </button>
        <div>
          <h1 className="display book-title">Phrasebook</h1>
          <p className="review__why">
            {mastered} of {cards.length} mastered in {WORLDS[world - 1].name}
          </p>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="World">
        {([1, 2] as WorldId[]).map((w) => (
          <button key={w} type="button" role="tab" aria-selected={world === w} className={`tab ${world === w ? 'is-on' : ''}`} onClick={() => setWorld(w)}>
            {WORLDS[w - 1].icon} {WORLDS[w - 1].name}
          </button>
        ))}
      </div>

      <div className="mastery-bar" aria-label="Phrases by mastery">
        {counts.map((n, s) => (
          <span key={s} className={`mastery-bar__seg mastery-bar__seg--${s}`} style={{ flex: n || 0.0001 }} title={`${STEP_NAME[s]}: ${n}`} />
        ))}
      </div>
      <p className="mastery-legend">
        {counts.map((n, s) => (
          <span key={s}>
            <i className={`mastery-dot mastery-dot--${s}`} /> {STEP_NAME[s]} {n}
          </span>
        ))}
      </p>

      <button type="button" className="btn btn--go btn--big" onClick={() => onPractise(weakest)}>
        Practise my 5 weakest
      </button>

      <ul className="book-list">
        {cards.map((c) => {
          const step = stepOf(mastery, c.id);
          return (
            <li key={c.id} className="book-row">
              <button type="button" className="book-row__play" onClick={() => sayPhrase(c.id, c.target, 'card', 0.95)} aria-label={`Hear: ${c.target}`}>
                <SpeakerIcon />
              </button>
              <button type="button" className="book-row__main" onClick={() => onPractise([c.id])}>
                <span className="book-row__text">{c.target}</span>
                {bangla && (
                  <span className="book-row__bn" lang="bn">
                    {c.bn}
                  </span>
                )}
                <span className="book-row__meta">
                  {PLACES[c.place].icon} {PLACES[c.place].name} · <StepStars step={step} /> {STEP_NAME[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
