import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { PlayerChoice } from '../game/profile';
import { canListen, listen, listenLong, stopSpeaking, type ListenError } from '../speech';

/**
 * Game art from public/art/<name>.png. Until the picture exists, a simple
 * placeholder (an emoji in a glossy circle) stands in.
 */
export function Art({ name, fallback, className = '' }: { name: string; fallback: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`art art--fallback ${className}`} aria-hidden="true">
        <span>{fallback}</span>
      </div>
    );
  }
  return (
    <img
      className={`art ${className}`}
      src={`art/${name}.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export type { PlayerChoice };

export const PLAYERS: Record<PlayerChoice, { label: string; fallback: string; cheer: string }> = {
  hero: { label: 'Him', fallback: '🧔🏽‍♂️', cheer: '🙌🏽' },
  girl: { label: 'Her', fallback: '👩🏽', cheer: '🙌🏽' },
};

/** Which character the player picked; every screen draws that one. */
export const PlayerContext = createContext<PlayerChoice>('hero');

/** The player's character in a pose: art is public/art/<hero|girl>-<pose>.png. */
export function PlayerArt({ pose, className = '', who }: { pose: 'wave' | 'cheer' | 'avatar'; className?: string; who?: PlayerChoice }) {
  const picked = useContext(PlayerContext);
  const p = who ?? picked;
  return (
    <Art
      key={`${p}-${pose}`}
      name={`${p}-${pose}`}
      fallback={pose === 'cheer' ? PLAYERS[p].cheer : PLAYERS[p].fallback}
      className={className}
    />
  );
}

export function MicIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size}>
      <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export const ERROR_TEXT: Record<ListenError, string> = {
  'mic-blocked': 'The microphone is blocked. Type your answer, or allow the mic in your browser settings.',
  'no-speech': "I didn't hear anything. Tap the mic and speak a little louder.",
  network: "Voice checking isn't working right now. Type your answer instead.",
  unsupported: "This browser can't listen. Type your answer, or open the game in Chrome or Safari.",
  other: 'Something went wrong with the mic. Try again, or type your answer.',
};

export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

interface SpeakProps {
  /** Called with every guess the recogniser made, or the typed text. */
  onAnswer: (alternatives: string[], typed: boolean) => void;
  disabled?: boolean;
  /** Extra ring drawn around the mic (the boss timer). */
  ring?: React.ReactNode;
  idleLabel?: string;
}

/** The big mic button, with live text while listening and a typing fallback. */
export function SpeakInput({ onAnswer, disabled = false, ring, idleLabel = 'Tap and speak' }: SpeakProps) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<ListenError | null>(null);
  const [typing, setTyping] = useState(!canListen());
  const [typed, setTyped] = useState('');
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);
  useEffect(() => {
    if (disabled) stopRef.current();
  }, [disabled]);

  const tap = () => {
    if (disabled) return;
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
      onResult: (alts) => {
        setInterim('');
        onAnswer(alts, false);
      },
      onError: (e) => {
        setError(e);
        if (e === 'mic-blocked' || e === 'unsupported' || e === 'network') setTyping(true);
      },
      onEnd: () => setListening(false),
    });
  };

  if (typing) {
    return (
      <form
        className="type-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (typed.trim() && !disabled) onAnswer([typed], true);
        }}
      >
        <label htmlFor="typed-answer" className="sr-only">
          Your answer
        </label>
        <input
          id="typed-answer"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type what you would say"
          autoComplete="off"
          disabled={disabled}
        />
        <button type="submit" className="btn btn--go" disabled={!typed.trim() || disabled}>
          Check
        </button>
        {canListen() && (
          <button type="button" className="link-btn" onClick={() => setTyping(false)}>
            Use the mic
          </button>
        )}
        {error && <p className="error">{ERROR_TEXT[error]}</p>}
      </form>
    );
  }

  return (
    <div className="speak">
      <div className="speak__mic-wrap">
        {ring}
        <button
          type="button"
          className={`mic ${listening ? 'is-on' : ''}`}
          onClick={tap}
          disabled={disabled}
          aria-label={listening ? 'Stop listening' : idleLabel}
        >
          <MicIcon />
        </button>
      </div>
      <p className="mic-label" aria-live="polite">
        {listening ? interim || 'Listening… speak now' : idleLabel}
      </p>
      <button type="button" className="link-btn link-btn--light" onClick={() => setTyping(true)} disabled={disabled}>
        Type instead
      </button>
      {error && <p className="error">{ERROR_TEXT[error]}</p>}
    </div>
  );
}

export interface TalkResult {
  text: string;
  /** Seconds actually spent talking; null when typed. */
  seconds: number | null;
}

/** Free talk for up to `limit` seconds, with a countdown and live words. */
export function TalkInput({ limit = 30, onDone }: { limit?: number; onDone: (r: TalkResult) => void }) {
  const [state, setState] = useState<'ready' | 'talking' | 'typing'>(canListen() ? 'ready' : 'typing');
  const [text, setText] = useState('');
  const [left, setLeft] = useState(limit);
  const [error, setError] = useState<ListenError | null>(null);
  const startedAt = useRef(0);
  const stopRef = useRef<() => void>(() => {});
  const textRef = useRef('');
  const active = useRef(false);
  textRef.current = text;

  useEffect(
    () => () => {
      active.current = false;
      stopRef.current();
    },
    [],
  );

  const finish = () => {
    if (!active.current) return;
    active.current = false;
    stopRef.current();
    const seconds = Math.max(5, (Date.now() - startedAt.current) / 1000);
    onDone({ text: textRef.current, seconds });
  };

  // Countdown while talking.
  useEffect(() => {
    if (state !== 'talking') return;
    const t = window.setInterval(() => {
      const l = limit - Math.floor((Date.now() - startedAt.current) / 1000);
      setLeft(Math.max(0, l));
      if (l <= 0) finish();
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const begin = () => {
    stopSpeaking();
    setError(null);
    startedAt.current = Date.now();
    active.current = true;
    setState('talking');
    const run = (prev: string) => {
      stopRef.current = listenLong(
        {
          onText: setText,
          onError: (e) => {
            setError(e);
            if (e === 'mic-blocked' || e === 'unsupported' || e === 'network') {
              active.current = false;
              setState('typing');
            }
          },
          // Some browsers stop after a pause; keep listening until time is up.
          onEnd: () => {
            if (active.current) run(textRef.current);
          },
        },
        prev,
      );
    };
    run('');
  };

  if (state === 'typing') {
    return (
      <form
        className="type-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onDone({ text, seconds: null });
        }}
      >
        <label htmlFor="talk-typed" className="sr-only">
          Tell Rosa about yourself
        </label>
        <textarea id="talk-typed" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Hi, I'm… I'm from… I work as…" />
        <button type="submit" className="btn btn--go" disabled={!text.trim()}>
          Done
        </button>
        {error && <p className="error">{ERROR_TEXT[error]}</p>}
      </form>
    );
  }

  return (
    <div className="talk">
      {state === 'ready' ? (
        <>
          <button type="button" className="mic" onClick={begin} aria-label="Start talking">
            <MicIcon />
          </button>
          <p className="mic-label">Tap and talk for up to {limit} seconds</p>
          <button type="button" className="link-btn link-btn--light" onClick={() => setState('typing')}>
            Type instead
          </button>
        </>
      ) : (
        <>
          <div className="talk__timer" aria-live="off">
            <span className="talk__left">{left}</span>
            <span>seconds</span>
          </div>
          <p className="talk__live" aria-live="polite">
            {text || 'Listening… start talking'}
          </p>
          <button type="button" className="btn btn--go" onClick={finish}>
            I'm done
          </button>
        </>
      )}
      {error && <p className="error">{ERROR_TEXT[error]}</p>}
    </div>
  );
}

/** Plain-text name for a rank's badge. */
export const RANK_ICONS = ['📸', '🎟️', '🏠', '🗽', '👑'];
