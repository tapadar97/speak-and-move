import { useEffect, useState } from 'react';
import { BOSSES, NATIVE_BOSSES, NATIVE_RATE } from '../game/bosses';
import { PLACES, cardById, type WorldId } from '../game/cards';
import { NATIVE_PACKS, PACKS } from '../game/learning';
import { matchSpeech, type MatchResult } from '../game/match';
import { situationOf } from '../game/mastery';
import { sayPhrase, stopSpeaking } from '../speech';
import { WORLDS } from '../game/worlds';
import { MicIcon, SpeakInput, SpeakerIcon, buzz } from './kit';
import { Chevron, DeliScene } from './scene';

interface Props {
  world: WorldId;
  /** The Native round's slang pack instead of the world's first pack. */
  native?: boolean;
  sound: boolean;
  bangla: boolean;
  /** Each phrase: did you say it right? */
  onPhrase: (cardId: string, right: boolean) => void;
  onDone: () => void;
  onExit: () => void;
}

/** Learn a world's 8 key phrases before you race: hear it, see it, say it. */
export function PhrasePack({ world, native = false, sound, bangla, onPhrase, onDone, onExit }: Props) {
  const ids = native ? NATIVE_PACKS[world] : PACKS[world];
  const boss = native ? NATIVE_BOSSES[world] : BOSSES[world];
  // Native phrases are heard at real New York speed.
  const speed = native ? NATIVE_RATE : 0.95;
  const [i, setI] = useState(-1);
  const [result, setResult] = useState<MatchResult | null>(null);
  const card = i >= 0 && i < ids.length ? cardById(ids[i])! : null;

  useEffect(() => {
    if (card && sound) {
      const t = window.setTimeout(() => sayPhrase(card.id, card.target, 'card', speed), 300);
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
    const preview = ids.map((id) => cardById(id)!);
    return (
      <div className="screen lesson-screen">
        <div className="lesson-hero">
          <DeliScene />
          <button type="button" className="icon-btn lesson-hero__back" onClick={onExit} aria-label="Back to my journey">
            ←
          </button>
          <p className="talk-bubble talk-bubble--1">{preview[0].target}</p>
          <p className="talk-bubble talk-bubble--2">{preview[1].target}</p>
        </div>
        <ol className="lesson-steps" aria-label="How it works">
          <li className="is-on">
            <SpeakerIcon /> Listen
          </li>
          <li aria-hidden="true">
            <Chevron />
          </li>
          <li>
            <MicIcon size={22} /> Speak
          </li>
          <li aria-hidden="true">
            <Chevron />
          </li>
          <li>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 20V13M12 20V8M18 20V4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Feedback
          </li>
        </ol>
        <div className="lesson-head">
          <p className="eyebrow">
            World {world} · {native ? 'Native round' : 'Phrase Pack'}
          </p>
          <h1 className="lesson-title">{native ? 'Talk like a local' : WORLDS[world - 1].goal}</h1>
          <p className="lesson-why">
            {native
              ? `8 phrases real New Yorkers say, at real speed. Then face ${boss.name}: no hints, 12 seconds.`
              : `Hear each phrase, then say it out loud. You'll use them to beat ${boss.name}.`}
          </p>
          {bangla && (
            <p className="lesson-why" lang="bn">
              {native ? 'নিউ ইয়র্কের মানুষ যেভাবে কথা বলে, সেই ৮টা বাক্য শিখুন।' : 'খেলার আগে ৮টা বাক্য শিখে নিন। শুনুন, তারপর একবার বলুন।'}
            </p>
          )}
        </div>
        <ul className="lesson-list">
          {preview.map((c, n) => (
            <li key={c.id} className="lesson-row">
              <span className="lesson-row__text">
                {c.target}
                {bangla && (
                  <span className="lesson-row__bn" lang="bn">
                    {c.bn}
                  </span>
                )}
              </span>
              <button type="button" className="round-btn round-btn--play" onClick={() => sayPhrase(c.id, c.target, 'card', speed)} aria-label={`Hear: ${c.target}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                </svg>
              </button>
              <button type="button" className="round-btn round-btn--mic" onClick={() => setI(n)} aria-label={`Practise: ${c.target}`}>
                <MicIcon size={22} />
              </button>
            </li>
          ))}
        </ul>
        <div className="lesson-cta">
          <button type="button" className="btn btn--go btn--big btn--split" onClick={next}>
            <span className="btn__mic" aria-hidden="true">
              <MicIcon size={20} />
            </span>
            Start speaking <Chevron />
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
          {native ? (
            <p>Now the real test. {boss.name} talks fast and won't wait. Answer from the situation, in English.</p>
          ) : (
            <p>Now use them. Each time a phrase comes back, it gets a little harder, until you can say it from memory.</p>
          )}
          <button type="button" className="btn btn--go btn--big" onClick={onDone}>
            {native ? `Face ${boss.name}` : 'Start the race'}
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
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back to my journey">
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
          <button type="button" className="pill-btn" onClick={() => sayPhrase(card.id, card.target, 'card', speed)}>
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
            {!result.pass && <p className="hint-line">{native ? 'No problem. Hear it again, then try the fight.' : "No problem. You'll practise it again in the race."}</p>}
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
