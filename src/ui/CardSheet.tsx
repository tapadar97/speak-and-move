import { useEffect, useState } from 'react';
import { LEVEL_NAME, PLACES, STEPS, type Card } from '../game/cards';
import { REPLIES } from '../game/learning';
import { matchSpeech, normalize, type MatchResult } from '../game/match';
import { MAX_STEP, MODE_NAME, STEP_NAME, expected, gapText, situationOf, whyOf, type Mode } from '../game/mastery';
import { canSpeak, sayPhrase, speak, stopSpeaking } from '../speech';
import { SpeakInput, SpeakerIcon, buzz } from './kit';

export interface CardDone {
  right: boolean;
  /** Right only on the second try. */
  retry: boolean;
}

interface Props {
  card: Card;
  mode: Mode;
  /** Mastery step 0–3, shown as stars. */
  step: number;
  /** 'game' moves your piece; 'practice' just practises. */
  context: 'game' | 'practice';
  secondChance?: boolean;
  sound: boolean;
  bangla: boolean;
  onDone: (r: CardDone) => void;
}

/** Text with **bold** parts. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
    </>
  );
}

export function StepStars({ step }: { step: number }) {
  return (
    <span className="step-stars" aria-label={`Mastery: ${STEP_NAME[step]}`}>
      {Array.from({ length: MAX_STEP }, (_, i) => (
        <span key={i} className={i < step ? 'is-on' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Practise one word you got wrong: hear it slowly, say just that word. */
function WordPractice({ word, onClose }: { word: string; onClose: () => void }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const want = normalize(word);
  const check = (alts: string[]) => {
    const good = alts.some((a) => {
      const heard = normalize(a);
      return want.every((w) => heard.includes(w));
    });
    setOk(good);
    buzz(good ? 30 : 15);
  };
  useEffect(() => {
    speak(word, 0.6);
  }, [word]);
  return (
    <div className="word-practice" role="group" aria-label={`Practise the word ${word}`}>
      <p className="word-practice__word">{word}</p>
      <div className="row">
        <button type="button" className="pill-btn pill-btn--soft" onClick={() => speak(word, 0.6)}>
          <SpeakerIcon /> Slow
        </button>
        <button type="button" className="pill-btn pill-btn--soft" onClick={onClose}>
          Done
        </button>
      </div>
      {ok === true ? (
        <p className="word-practice__ok">✓ Nice! That's it.</p>
      ) : (
        <>
          {ok === false && <p className="word-practice__try">Almost. Listen once more and try again.</p>}
          <SpeakInput key={String(ok)} onAnswer={check} idleLabel="Say just this word" />
        </>
      )}
    </div>
  );
}

export function CardSheet({ card, mode, step, context, secondChance = false, sound, bangla, onDone }: Props) {
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [typed, setTyped] = useState(false);
  const [showBn, setShowBn] = useState(bangla && (mode === 'say' || mode === 'gap'));
  const [practising, setPractising] = useState<string | null>(null);
  const place = PLACES[card.place];
  const heard = mode === 'listen' || mode === 'answer';
  const want = expected(card, mode);
  const why = whyOf(card);
  const play = (rate: number) => sayPhrase(card.id, card.target, 'card', rate);

  // Listening cards play the phrase as soon as they open.
  useEffect(() => {
    if (heard && sound) {
      const t = window.setTimeout(() => play(1), 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const check = (alts: string[], wasTyped: boolean) => {
    const r = matchSpeech(want.target, want.accept, alts, card.level, want.strict);
    setTyped(wasTyped);
    setResult(r);
    setPractising(null);
    buzz(r.pass ? 30 : [20, 60, 20]);
  };

  const tryAgain = () => {
    setAttempt(2);
    setResult(null);
    setPractising(null);
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
            {context === 'game' && ` · ${STEPS[card.level]} step${STEPS[card.level] > 1 ? 's' : ''}`}
          </span>
        </header>

        <div className="card-sheet__body">
          {secondChance && <p className="second-chance">🔁 Second chance: you missed this one earlier</p>}
          <p className="card-type" id="card-title">
            {MODE_NAME[mode]} <StepStars step={step} />
          </p>

          {mode === 'say' && <p className="phrase">{card.target}</p>}

          {mode === 'gap' && (
            <>
              <p className="instruction">Say the whole sentence, with the missing words.</p>
              <p className="phrase phrase--gap">{gapText(card.target)}</p>
            </>
          )}

          {heard && !answered && (
            <div className="listen-box">
              <p className="instruction">{mode === 'listen' ? 'Listen, then say what you heard.' : 'Listen, then answer.'}</p>
              <div className="row">
                <button type="button" className="pill-btn" onClick={() => play(1)} disabled={!canSpeak()}>
                  <SpeakerIcon /> Play
                </button>
                <button type="button" className="pill-btn pill-btn--soft" onClick={() => play(0.6)} disabled={!canSpeak()}>
                  Slow
                </button>
              </div>
              {mode === 'answer' && <p className="phrase phrase--ask">{REPLIES[card.id].ask}</p>}
            </div>
          )}

          {mode === 'fix' && (
            <>
              <p className="instruction">This sentence has a mistake. Say it the right way.</p>
              <p className="phrase phrase--wrong">{card.prompt}</p>
            </>
          )}

          {mode === 'bangla' && (
            <>
              <p className="instruction">Say this in English.</p>
              <p className="phrase phrase--bn" lang="bn">
                {card.bn}
              </p>
            </>
          )}

          {mode === 'situation' && (
            <>
              <p className="instruction">What do you say?</p>
              <p className="phrase phrase--situation">{situationOf(card)}</p>
            </>
          )}

          {mode !== 'bangla' && !answered && (
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

          {mode === 'say' && !answered && (
            <button type="button" className="pill-btn" onClick={() => play(0.85)}>
              <SpeakerIcon /> Hear it
            </button>
          )}

          {!answered && (
            <div className="answer">
              {attempt === 2 && <p className="retry-note">Second try. Get it right for {context === 'game' ? '1 step' : 'a point'}.</p>}
              <SpeakInput key={attempt} onAnswer={check} />
            </div>
          )}

          {answered && (
            <div className={`verdict ${right ? 'is-right' : 'is-wrong'}`} aria-live="assertive">
              <p className="verdict__title">{!right ? 'Not quite' : !exact ? 'Good!' : attempt === 2 ? 'Got it!' : 'Perfect!'}</p>
              {right && !exact && <p className="hint-line">You still move. Tap the red word to practise it.</p>}
              <p className="words">
                {result.words.map((w, i) =>
                  w.ok ? (
                    <span key={i} className="w-ok">
                      {w.word}
                    </span>
                  ) : (
                    <button key={i} type="button" className="w-miss" onClick={() => setPractising(w.word)} aria-label={`Practise the word ${w.word}`}>
                      {w.word}
                    </button>
                  ),
                )}
              </p>
              {!right && !practising && <p className="hint-line">Tap a red word to hear it and practise it alone.</p>}
              {practising && <WordPractice word={practising} onClose={() => setPractising(null)} />}
              {result.heard && (
                <p className="heard">
                  {typed ? 'You wrote' : 'I heard'}: “{result.heard}”
                </p>
              )}
              {mode === 'answer' && (
                <p className="heard">
                  They said: “{card.target}”
                </p>
              )}
              <div className="row">
                <button type="button" className="pill-btn" onClick={() => (mode === 'answer' ? speak(want.target.replace(/XNUM/g, '9'), 0.9) : play(0.9))}>
                  <SpeakerIcon /> Hear it
                </button>
                <button type="button" className="pill-btn pill-btn--soft" onClick={() => (mode === 'answer' ? speak(want.target.replace(/XNUM/g, '9'), 0.6) : play(0.6))}>
                  Slow
                </button>
              </div>
              {why && (mode === 'fix' || !right) && (
                <div className="why">
                  <p className="why__title">💡 Why</p>
                  <p>
                    <Rich text={why.en} />
                  </p>
                  {bangla && (
                    <p className="why__bn" lang="bn">
                      {why.bn}
                    </p>
                  )}
                </div>
              )}
              {mode !== 'say' && (
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
                {context === 'game' ? `Move ${steps} step${steps > 1 ? 's' : ''}` : 'Next'}
              </button>
            ) : attempt === 1 ? (
              <>
                <button type="button" className="btn btn--go btn--big" onClick={tryAgain}>
                  Try again
                </button>
                <button type="button" className="link-btn" onClick={() => finish(false)}>
                  {context === 'game' ? 'Skip. I stay here' : 'Skip'}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--blue btn--big" onClick={() => finish(false)}>
                {context === 'game' ? "It'll come back soon. Continue" : 'Continue'}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
