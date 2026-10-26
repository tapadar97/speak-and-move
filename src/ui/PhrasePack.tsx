import { useEffect, useState } from 'react';
import { BOSSES } from '../game/bosses';
import { PLACES, cardById, type WorldId } from '../game/cards';
import { PACKS } from '../game/learning';
import { matchSpeech, type MatchResult } from '../game/match';
import { situationOf } from '../game/mastery';
import { sayPhrase, stopSpeaking } from '../speech';
import { Art, SpeakInput, SpeakerIcon, buzz } from './kit';

interface Props {
  world: WorldId;
  sound: boolean;
  bangla: boolean;
  /** Each phrase: did you say it right? */
  onPhrase: (cardId: string, right: boolean) => void;
  onDone: () => void;
  onExit: () => void;
}

/** Learn a world's 8 key phrases before you race: hear it, see it, say it. */
export function PhrasePack({ world, sound, bangla, onPhrase, onDone, onExit }: Props) {
  const ids = PACKS[world];
  const boss = BOSSES[world];
  const [i, setI] = useState(-1);
  const [result, setResult] = useState<MatchResult | null>(null);
  const card = i >= 0 && i < ids.length ? cardById(ids[i])! : null;

  useEffect(() => {
    if (card && sound) {
      const t = window.setTimeout(() => sayPhrase(card.id, card.target, 'card', 0.95), 300);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => () => stopSpeaking(), []);

  const check = (alts: string[]) => {
    if (!card) return;
    const r = matchSpeech(card.target, card.accept, alts, card.level);
    setResult(r);
    buzz(r.pass ? 30 : 15);
    onPhrase(card.id, r.pass);
  };

  const next = () => {
    setResult(null);
    setI((n) => n + 1);
  };

  if (i < 0) {
    return (
      <div className="screen pack-screen">
        <div className="sky-scene" aria-hidden="true">
          <div className="skyline" />
          <div className="street" />
        </div>
        <div className="intro-card">
          <p className="eyebrow">World {world} · Phrase Pack</p>
          <h1 className="display">Learn before you play</h1>
          <p>
            8 phrases you'll need here. Hear each one, then say it once. You'll use the first 6 to beat <strong>{boss.name}</strong>.
          </p>
          {bangla && (
            <p className="bn-line" lang="bn">
              খেলার আগে ৮টা বাক্য শিখে নিন। শুনুন, তারপর একবার বলুন।
            </p>
          )}
          <Art name={boss.art} fallback={boss.icon} className="pack-boss" />
          <button type="button" className="btn btn--go btn--big" onClick={next}>
            Start learning
          </button>
          <button type="button" className="link-btn" onClick={onExit}>
            Back to the map
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="screen pack-screen">
        <div className="sky-scene" aria-hidden="true">
          <div className="skyline" />
          <div className="street" />
        </div>
        <div className="intro-card">
          <div className="confetti" aria-hidden="true" />
          <h1 className="display">8 phrases learned!</h1>
          <p>Now use them. Each time a phrase comes back, it gets a little harder, until you can say it from memory.</p>
          <button type="button" className="btn btn--go btn--big" onClick={onDone}>
            Start the race
          </button>
        </div>
      </div>
    );
  }

  const place = PLACES[card.place];
  return (
    <div className="screen pack-screen">
      <div className="sky-scene" aria-hidden="true">
        <div className="skyline" />
        <div className="street" />
      </div>
      <header className="review__head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back to the map">
          ←
        </button>
        <div>
          <p className="review__count">
            Phrase {i + 1} of {ids.length}
          </p>
          <ol className="pack-dots" aria-hidden="true">
            {ids.map((id, n) => (
              <li key={id} className={n < i ? 'is-done' : n === i ? 'is-now' : ''} />
            ))}
          </ol>
        </div>
      </header>

      <section className={`learn-card place--${card.place}`}>
        <p className="learn-card__place">
          <span aria-hidden="true">{place.icon}</span> {situationOf(card)}
        </p>
        <p className="phrase learn-card__phrase">{card.target}</p>
        {bangla && (
          <p className="learn-card__bn" lang="bn">
            {card.bn}
          </p>
        )}
        <div className="row">
          <button type="button" className="pill-btn" onClick={() => sayPhrase(card.id, card.target, 'card', 0.95)}>
            <SpeakerIcon /> Hear it
          </button>
          <button type="button" className="pill-btn pill-btn--soft" onClick={() => sayPhrase(card.id, card.target, 'card', 0.6)}>
            Slow
          </button>
        </div>

        {result ? (
          <div className={`verdict ${result.pass ? 'is-right' : 'is-wrong'}`} aria-live="assertive">
            <p className="verdict__title">{result.pass ? 'Nice!' : 'Good try!'}</p>
            <p className="words">
              {result.words.map((w, n) => (
                <span key={n} className={w.ok ? 'w-ok' : 'w-miss'}>
                  {w.word}
                </span>
              ))}
            </p>
            {!result.pass && <p className="hint-line">No problem. You'll practise it again in the race.</p>}
            <button type="button" className="btn btn--go btn--big" onClick={next}>
              {i + 1 < ids.length ? 'Next phrase' : 'Finish'}
            </button>
          </div>
        ) : (
          <SpeakInput key={i} onAnswer={check} idleLabel="Now you say it" />
        )}
      </section>
    </div>
  );
}
