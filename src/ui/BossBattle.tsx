import { useEffect, useRef, useState } from 'react';
import { BOSSES, BOSS_HP, FAST_MS, HEARTS, ROUND_SECONDS, answer, startBattle, type BattleState } from '../game/bosses';
import { cardById, type WorldId } from '../game/cards';
import { matchSpeech } from '../game/match';
import { sayPhrase, stopSpeaking } from '../speech';
import { Art, SpeakInput, SpeakerIcon, buzz, PlayerArt } from './kit';

interface Props {
  world: WorldId;
  sound: boolean;
  bangla: boolean;
  onAnswer: (right: boolean, fast: boolean) => void;
  onWin: (s: BattleState, hintsUsed: number) => void;
  onExit: () => void;
}

type Phase = 'intro' | 'line' | 'answer' | 'hit' | 'miss' | 'lost';

const SMALL_WORD = /^(a|an|the|to|of|in|on|at|my|is|i|i'm|and|so|by|for)$/i;

/** Hint ladder: 1 = first two words, 2 = key words only, 3 = the full answer. */
function hintText(target: string, level: number): string {
  const words = target.split(/\s+/);
  if (level === 1) return `${words.slice(0, 2).join(' ')} …`;
  if (level === 2) return words.map((w) => (SMALL_WORD.test(w.replace(/[^\w']/g, '')) ? '_' : w)).join(' ');
  return `“${target}”`;
}

export function BossBattle({ world, sound, bangla, onAnswer, onWin, onExit }: Props) {
  const boss = BOSSES[world];
  const [state, setState] = useState<BattleState>(() => startBattle(boss));
  const [phase, setPhase] = useState<Phase>('intro');
  const [left, setLeft] = useState(ROUND_SECONDS);
  /** Hint ladder for this round: 0 none, 1 first words, 2 key words, 3 full answer. */
  const [hint, setHint] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [shake, setShake] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const askedAt = useRef(0);
  const alive = useRef(true);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // The phone's back button: leave from the intro or end screens, ask first mid-fight.
  useEffect(() => {
    const onBack = () => (phaseRef.current === 'intro' || phaseRef.current === 'lost' ? onExit() : setConfirmExit(true));
    window.addEventListener('sm-back', onBack);
    return () => window.removeEventListener('sm-back', onBack);
  }, [onExit]);

  const roundIndex = state.queue[0];
  const round = boss.rounds[roundIndex];
  const answerCard = cardById(round.cardId)!;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopSpeaking();
    };
  }, []);

  const playLine = async (rate = 1) => {
    if (sound) await sayPhrase(`boss-${world}-${roundIndex}`, round.line, 'card', rate);
  };

  // Each round: the boss speaks, then your timer starts.
  useEffect(() => {
    if (phase !== 'line') return;
    let cancelled = false;
    (async () => {
      await playLine();
      if (cancelled || !alive.current) return;
      askedAt.current = Date.now();
      setLeft(ROUND_SECONDS);
      setPhase('answer');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex]);

  const resolve = (right: boolean) => {
    const ms = Date.now() - askedAt.current;
    const next = answer(state, right, ms);
    onAnswer(right, right && ms < FAST_MS);
    setState(next);
    setHint(0);
    if (right) {
      setShake((n) => n + 1);
      buzz(40);
      setPhase('hit');
    } else {
      buzz([30, 80, 30]);
      setPhase('miss');
    }
    window.setTimeout(
      () => {
        if (!alive.current) return;
        if (next.over === 'won') onWin(next, hintsUsed);
        else if (next.over === 'lost') setPhase('lost');
        else setPhase('line');
      },
      right ? 1100 : 2400,
    );
  };

  // The round timer. It pauses while the "Leave?" question is open.
  const pausedAt = useRef(0);
  useEffect(() => {
    if (phase !== 'answer') return;
    if (confirmExit) {
      pausedAt.current = Date.now();
      return;
    }
    if (pausedAt.current) {
      askedAt.current += Date.now() - pausedAt.current;
      pausedAt.current = 0;
    }
    const t = window.setInterval(() => {
      const l = ROUND_SECONDS - (Date.now() - askedAt.current) / 1000;
      setLeft(Math.max(0, l));
      if (l <= 0) {
        window.clearInterval(t);
        resolve(false);
      }
    }, 100);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex, confirmExit]);

  const answered = (alts: string[]) => {
    if (phase !== 'answer') return;
    resolve(matchSpeech(answerCard.target, answerCard.accept, alts, 2).pass);
  };

  const restart = () => {
    setState(startBattle(boss));
    setHintsUsed(0);
    setHint(0);
    setPhase('line');
  };

  const r = 46;
  const circ = 2 * Math.PI * r;
  const ring = (
    <svg className="timer-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={r} className="timer-ring__track" />
      <circle
        cx="50"
        cy="50"
        r={r}
        className={`timer-ring__fill ${left < 6 ? 'is-low' : ''}`}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - (phase === 'answer' ? left / ROUND_SECONDS : 1))}
      />
    </svg>
  );

  if (phase === 'intro') {
    return (
      <div className={`screen boss boss--w${world}`}>
        <div className="boss-intro">
          <p className="eyebrow">Boss battle · World {world}</p>
          <Art name={boss.art} fallback={boss.icon} className="boss-intro__art" />
          <h1 className="display">{boss.name}</h1>
          <p className="boss-intro__title">{boss.title}</p>
          <div className="bubble bubble--center">
            <p className="bubble__line">{boss.intro}</p>
          </div>
          <ul className="boss-rules">
            <li>
              Answer in English using the <strong>Bangla meaning</strong>.
            </li>
            <li>
              {ROUND_SECONDS} seconds each. <strong>{BOSS_HP} right answers</strong> win.
            </li>
            <li>
              {HEARTS} mistakes and you're out. Hints are free, but fewer hints = more stars.
            </li>
          </ul>
          <button type="button" className="btn btn--red btn--big" onClick={() => setPhase('line')}>
            FIGHT!
          </button>
          <button type="button" className="link-btn link-btn--light" onClick={onExit}>
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'lost') {
    return (
      <div className={`screen boss boss--w${world}`}>
        <div className="boss-intro">
          <Art name={boss.art} fallback={boss.icon} className="boss-intro__art" />
          <h1 className="display">So close!</h1>
          <p>
            {boss.name} won this time. You hit them {BOSS_HP - state.hp} of {BOSS_HP} times.
          </p>
          <p className="bn-line" lang="bn">
            আবার চেষ্টা করুন, আপনি পারবেন!
          </p>
          <button type="button" className="btn btn--red btn--big" onClick={restart}>
            Try again
          </button>
          <button type="button" className="link-btn link-btn--light" onClick={onExit}>
            Back to my journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen boss boss--w${world}`}>
      <header className="boss-top">
        <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Leave the battle">
          ←
        </button>
        <div className="boss-plate">
          <p className="boss-plate__name">{boss.name.toUpperCase()}</p>
          <div className="hp" role="meter" aria-label={`${boss.name} health`} aria-valuenow={state.hp} aria-valuemin={0} aria-valuemax={BOSS_HP}>
            {Array.from({ length: BOSS_HP }, (_, i) => (
              <span key={i} className={i < state.hp ? 'is-on' : ''} />
            ))}
          </div>
          <p className="boss-plate__hp">
            {state.hp} / {BOSS_HP}
          </p>
        </div>
      </header>

      <div className="boss-stage">
        <div key={shake} className={`boss-stage__art ${phase === 'hit' ? 'is-hit' : ''}`}>
          <Art name={boss.art} fallback={boss.icon} />
        </div>
        <div className="bubble">
          <p className="bubble__line">{round.line}</p>
          <button type="button" className="pill-btn pill-btn--small" onClick={() => playLine(0.8)} disabled={!sound}>
            <SpeakerIcon /> Again
          </button>
        </div>
        {state.combo >= 2 && <p className="combo">COMBO x{state.combo}</p>}
      </div>

      <section className="boss-panel">
        {phase === 'hit' && <p className="hit-text">💥 Hit!</p>}
        {phase === 'miss' && (
          <div className="miss-box" role="status">
            <p className="miss-box__title">{left <= 0 ? "Time's up!" : 'Not quite!'} −1 ❤️</p>
            <p>You could say: “{answerCard.target}”</p>
          </div>
        )}
        {(phase === 'line' || phase === 'answer') && (
          <>
            <p className="say-label">Say this in English:</p>
            <p className="phrase phrase--bn" lang="bn">
              {answerCard.bn}
            </p>
            {hint > 0 && <p className="hint-card">💡 {hintText(answerCard.target, hint)}</p>}
            <SpeakInput key={`${roundIndex}-${state.hearts}-${state.hp}`} onAnswer={answered} disabled={phase !== 'answer'} ring={ring} idleLabel={phase === 'line' ? 'Listen…' : `${Math.ceil(left)}s · Tap and answer`} />
          </>
        )}
      </section>

      <footer className="boss-foot">
        <div className="me">
          <PlayerArt pose="avatar" className="me__avatar" />
          <span className="hearts" aria-label={`${state.hearts} hearts left`}>
            {Array.from({ length: HEARTS }, (_, i) => (
              <span key={i} className={i < state.hearts ? 'is-on' : ''}>
                ❤
              </span>
            ))}
          </span>
        </div>
        <button
          type="button"
          className="pill-btn pill-btn--gold"
          onClick={() => {
            setHint((h) => h + 1);
            setHintsUsed((n) => n + 1);
          }}
          disabled={hint >= 3 || phase !== 'answer'}
        >
          💡 {hint === 0 ? 'Hint' : hint < 3 ? 'More help' : 'Full answer shown'}
        </button>
      </footer>
      {bangla && (
        <p className="bn-line boss-bn" lang="bn">
          দ্রুত উত্তর দিন!
        </p>
      )}
      {confirmExit && (
        <div className="sheet-backdrop" onClick={() => setConfirmExit(false)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="boss-exit-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="boss-exit-title">Leave this fight?</h2>
            <p>The timer is paused. If you leave, this fight won't count.</p>
            <div className="row">
              <button type="button" className="btn btn--blue" onClick={() => setConfirmExit(false)}>
                Keep fighting
              </button>
              <button type="button" className="btn btn--go" onClick={onExit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
