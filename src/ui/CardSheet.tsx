import { useEffect, useState } from 'react';
import { LEVEL_NAME, PLACES, STEPS, TYPE_NAME, type Card } from '../game/cards';
import { matchSpeech, type MatchResult } from '../game/match';
import { canSpeak, sayPhrase, stopSpeaking } from '../speech';
import { SpeakInput, SpeakerIcon, buzz } from './kit';

export interface CardDone {
  right: boolean;
  /** Right only on the second try. */
  retry: boolean;
}

interface Props {
  card: Card;
  /** 'game' moves your piece; 'review' just practises. */
  mode: 'game' | 'review';
  sound: boolean;
  bangla: boolean;
  onDone: (r: CardDone) => void;
}

export function CardSheet({ card, mode, sound, bangla, onDone }: Props) {
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [typed, setTyped] = useState(false);
  const [showBn, setShowBn] = useState(bangla && card.type === 'say');
  const place = PLACES[card.place];
  const isListen = card.type === 'listen';
  const play = (rate: number) => sayPhrase(card.id, card.target, 'card', rate);

  // Listen cards play the phrase as soon as they open.
  useEffect(() => {
    if (isListen && sound) {
      const t = window.setTimeout(() => play(1), 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const check = (alts: string[], wasTyped: boolean) => {
    const r = matchSpeech(card.target, card.accept, alts, card.level, card.type === 'fix');
    setTyped(wasTyped);
    setResult(r);
    buzz(r.pass ? 30 : [20, 60, 20]);
  };

  const tryAgain = () => {
    setAttempt(2);
    setResult(null);
  };

  const finish = (right: boolean) => onDone({ right, retry: right && attempt === 2 });

  const right = result?.pass ?? false;
  const exact = result?.words.every((w) => w.ok) ?? false;
  const answered = result !== null;
  const steps = attempt === 2 ? 1 : STEPS[card.level];

  return (
    <div className="sheet-backdrop">
      <section className={`card-sheet place--${card.place}`} role="dialog" aria-modal="true" aria-labelledby="card-title">
        <header className="card-sheet__head">
          <span className="card-sheet__place">
            <span aria-hidden="true">{place.icon}</span> {place.name}
          </span>
          <span className={`level-pill level-pill--${card.level}`}>
            {LEVEL_NAME[card.level]}
            {mode === 'game' && ` · ${STEPS[card.level]} step${STEPS[card.level] > 1 ? 's' : ''}`}
          </span>
        </header>

        <div className="card-sheet__body">
          <p className="card-type" id="card-title">
            {TYPE_NAME[card.type]}
          </p>

          {card.type === 'say' && <p className="phrase">{card.target}</p>}

          {isListen && !answered && (
            <div className="listen-box">
              <p className="instruction">Listen, then say what you heard.</p>
              <div className="row">
                <button type="button" className="pill-btn" onClick={() => play(1)} disabled={!canSpeak()}>
                  <SpeakerIcon /> Play
                </button>
                <button type="button" className="pill-btn pill-btn--soft" onClick={() => play(0.6)} disabled={!canSpeak()}>
                  Slow
                </button>
              </div>
            </div>
          )}

          {card.type === 'fix' && (
            <>
              <p className="instruction">This sentence has a mistake. Say it the right way.</p>
              <p className="phrase phrase--wrong">{card.prompt}</p>
            </>
          )}

          {card.type === 'recall' && (
            <>
              <p className="instruction">{card.prompt}</p>
              <p className="phrase phrase--bn" lang="bn">
                {card.bn}
              </p>
              <p className="instruction">Say it in English.</p>
            </>
          )}

          {card.type !== 'recall' && !(answered && card.type !== 'say') && (
            <div className="bn-hint">
              {showBn ? (
                <p lang="bn">{card.bn}</p>
              ) : (
                <button type="button" className="link-btn" onClick={() => setShowBn(true)}>
                  Show Bangla meaning
                </button>
              )}
            </div>
          )}

          {card.type === 'say' && !answered && (
            <button type="button" className="pill-btn" onClick={() => play(0.85)}>
              <SpeakerIcon /> Hear it
            </button>
          )}

          {!answered && (
            <div className="answer">
              {attempt === 2 && <p className="retry-note">Second try. Get it right for 1 step.</p>}
              <SpeakInput key={attempt} onAnswer={check} />
            </div>
          )}

          {answered && (
            <div className={`verdict ${right ? 'is-right' : 'is-wrong'}`} aria-live="assertive">
              <p className="verdict__title">{!right ? 'Not quite' : !exact ? 'Good!' : attempt === 2 ? 'Got it!' : 'Perfect!'}</p>
              {right && !exact && <p className="hint-line">You still move. Check the red word for next time.</p>}
              <p className="words">
                {result.words.map((w, i) => (
                  <span key={i} className={w.ok ? 'w-ok' : 'w-miss'}>
                    {w.word}
                  </span>
                ))}
              </p>
              {result.heard && (
                <p className="heard">
                  {typed ? 'You wrote' : 'I heard'}: “{result.heard}”
                </p>
              )}
              <div className="row">
                <button type="button" className="pill-btn" onClick={() => play(0.9)}>
                  <SpeakerIcon /> Hear it
                </button>
                <button type="button" className="pill-btn pill-btn--soft" onClick={() => play(0.6)}>
                  Slow
                </button>
              </div>
              {card.type !== 'say' && (
                <p className="bn-under" lang="bn">
                  {card.bn}
                </p>
              )}
            </div>
          )}
        </div>

        {answered && (
          <footer className="card-sheet__foot">
            {right ? (
              <button type="button" className="btn btn--go btn--big" onClick={() => finish(true)}>
                {mode === 'game' ? `Move ${steps} step${steps > 1 ? 's' : ''}` : 'Next'}
              </button>
            ) : attempt === 1 ? (
              <>
                <button type="button" className="btn btn--go btn--big" onClick={tryAgain}>
                  Try again
                </button>
                <button type="button" className="link-btn" onClick={() => finish(false)}>
                  {mode === 'game' ? 'Skip. I stay here' : 'Skip'}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--blue btn--big" onClick={() => finish(false)}>
                {mode === 'game' ? 'Saved to review. Continue' : 'Continue'}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
