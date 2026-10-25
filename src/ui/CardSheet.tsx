import { useEffect, useRef, useState } from 'react';
import { LEVEL_NAME, PLACES, STEPS, TYPE_NAME, type Card } from '../game/cards';
import { matchSpeech, type MatchResult } from '../game/match';
import { canListen, canSpeak, listen, speak, stopSpeaking, type ListenError } from '../speech';

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

const ERROR_TEXT: Record<ListenError, string> = {
  'mic-blocked': 'The microphone is blocked. You can type your answer, or allow the mic in your browser settings.',
  'no-speech': "I didn't hear anything. Tap the mic and speak a little louder.",
  network: "Voice checking isn't working right now. Type your answer instead.",
  unsupported: "This browser can't listen. Type your answer, or open the game in Chrome or Safari.",
  other: 'Something went wrong with the mic. Try again, or type your answer.',
};

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="36" height="36">
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CardSheet({ card, mode, sound, bangla, onDone }: Props) {
  const [attempt, setAttempt] = useState(1);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<ListenError | null>(null);
  const [typing, setTyping] = useState(!canListen());
  const [typed, setTyped] = useState('');
  const [showBn, setShowBn] = useState(bangla && card.type === 'say');
  const stopRef = useRef<() => void>(() => {});
  const place = PLACES[card.place];

  const isListen = card.type === 'listen';
  const fastRate = card.level === 3 ? 1.08 : 1;

  // Listen cards play the phrase as soon as they open.
  useEffect(() => {
    if (isListen && sound) {
      const t = window.setTimeout(() => speak(card.target, fastRate), 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    stopRef.current();
    stopSpeaking();
  }, []);

  const check = (alts: string[]) => {
    const r = matchSpeech(card.target, card.accept, alts, card.level, card.type === 'fix');
    setResult(r);
    setInterim('');
    try {
      navigator.vibrate?.(r.pass ? 30 : [20, 60, 20]);
    } catch {
      /* not supported */
    }
  };

  const startMic = () => {
    if (listening) {
      stopRef.current();
      return;
    }
    stopSpeaking();
    setError(null);
    setInterim('');
    setListening(true);
    stopRef.current = listen({
      onInterim: setInterim,
      onResult: check,
      onError: (e) => {
        setError(e);
        if (e === 'mic-blocked' || e === 'unsupported' || e === 'network') setTyping(true);
      },
      onEnd: () => setListening(false),
    });
  };

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim()) check([typed]);
  };

  const tryAgain = () => {
    setAttempt(2);
    setResult(null);
    setTyped('');
    setError(null);
  };

  const finish = (right: boolean) => onDone({ right, retry: right && attempt === 2 });

  const right = result?.pass ?? false;
  const exact = result?.words.every((w) => w.ok) ?? false;
  const answered = result !== null;
  // Before answering, the English is hidden on Listen, Fix and From-Bangla cards.
  const revealTarget = answered || card.type === 'say';
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

          {card.type === 'listen' && !answered && (
            <div className="listen-box">
              <p className="instruction">Listen, then say what you heard.</p>
              <div className="row">
                <button type="button" className="btn btn--soft" onClick={() => speak(card.target, fastRate)} disabled={!canSpeak()}>
                  <SpeakerIcon /> Play
                </button>
                <button type="button" className="btn btn--soft" onClick={() => speak(card.target, 0.6)} disabled={!canSpeak()}>
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

          {card.type === 'say' && !answered && canSpeak() && (
            <button type="button" className="link-btn" onClick={() => speak(card.target, 0.85)}>
              <SpeakerIcon /> Hear it first
            </button>
          )}

          {/* Answer area */}
          {!answered && (
            <div className="answer">
              {attempt === 2 && <p className="retry-note">Second try. Get it right for 1 step.</p>}
              {!typing ? (
                <>
                  <button
                    type="button"
                    className={`mic ${listening ? 'is-on' : ''}`}
                    onClick={startMic}
                    aria-label={listening ? 'Stop listening' : 'Tap and speak'}
                  >
                    <MicIcon />
                  </button>
                  <p className="mic-label" aria-live="polite">
                    {listening ? interim || 'Listening… speak now' : 'Tap and speak'}
                  </p>
                  <button type="button" className="link-btn" onClick={() => setTyping(true)}>
                    Type instead
                  </button>
                </>
              ) : (
                <form className="type-form" onSubmit={submitTyped}>
                  <label htmlFor="typed-answer" className="sr-only">
                    Your answer
                  </label>
                  <input
                    id="typed-answer"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Type what you would say"
                    autoComplete="off"
                    autoFocus
                  />
                  <button type="submit" className="btn btn--go" disabled={!typed.trim()}>
                    Check
                  </button>
                  {canListen() && (
                    <button type="button" className="link-btn" onClick={() => setTyping(false)}>
                      Use the mic
                    </button>
                  )}
                </form>
              )}
              {error && <p className="error">{ERROR_TEXT[error]}</p>}
            </div>
          )}

          {answered && (
            <div className={`verdict ${right ? 'is-right' : 'is-wrong'}`} aria-live="assertive">
              <p className="verdict__title">
                {!right ? 'Not quite' : !exact ? 'Good!' : attempt === 2 ? 'Got it!' : 'Perfect!'}
              </p>
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
                  {typing ? 'You wrote' : 'I heard'}: “{result.heard}”
                </p>
              )}
              {!right && revealTarget && (
                <p className="hint-line">
                  The words in <span className="w-miss">red</span> were missing or different.
                </p>
              )}
              {canSpeak() && (
                <div className="row">
                  <button type="button" className="btn btn--soft" onClick={() => speak(card.target, 0.9)}>
                    <SpeakerIcon /> Hear it
                  </button>
                  <button type="button" className="btn btn--soft" onClick={() => speak(card.target, 0.6)}>
                    Slow
                  </button>
                </div>
              )}
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
              <button type="button" className="btn btn--soft btn--big" onClick={() => finish(false)}>
                {mode === 'game' ? 'Saved to review. Continue' : 'Continue'}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
