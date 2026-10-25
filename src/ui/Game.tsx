import { useEffect, useRef, useState } from 'react';
import { BOT_SKILL, EXPRESS, HOME, botChoice, drawCard, move, placeAt, stepsFor, type Players } from '../game/board';
import { LEVEL_NAME, PLACES, STEPS, type Card, type Level } from '../game/cards';
import { speak } from '../speech';
import { BoardView } from './BoardView';
import { CardSheet, type CardDone } from './CardSheet';

export interface GameSummary {
  won: boolean;
  attempts: number;
  firstTry: number;
  coins: number;
  mistakes: string[];
  saidRight: string[];
}

interface Props {
  sound: boolean;
  bangla: boolean;
  onMistake: (cardId: string) => void;
  onFinish: (s: GameSummary) => void;
  onExit: () => void;
}

type Phase = 'choose' | 'card' | 'moving' | 'bot' | 'over';

interface Toast {
  who: 'you' | 'bot';
  text: string;
  sub?: string;
  good?: boolean;
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export function Game({ sound, bangla, onMistake, onFinish, onExit }: Props) {
  const [players, setPlayers] = useState<Players>({ you: 0, bot: 0 });
  const [phase, setPhase] = useState<Phase>('choose');
  const [card, setCard] = useState<Card | null>(null);
  const [level, setLevel] = useState<Level>(1);
  const [toast, setToast] = useState<Toast | null>(null);
  const [winner, setWinner] = useState<'you' | 'bot' | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const recent = useRef<string[]>([]);
  const stats = useRef<GameSummary>({ won: false, attempts: 0, firstTry: 0, coins: 0, mistakes: [], saidRight: [] });
  const alive = useRef(true);
  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const remember = (c: Card) => {
    recent.current = [...recent.current.slice(-8), c.id];
  };

  const end = (who: 'you' | 'bot') => {
    setWinner(who);
    setPhase('over');
    stats.current.won = who === 'you';
    onFinish({ ...stats.current });
  };

  const describe = (who: 'you' | 'bot', r: ReturnType<typeof move>) => {
    const name = who === 'you' ? 'You' : 'Maya';
    if (r.won) return `${name} reached Home!`;
    if (r.express) return `Express train! ${name} rode from ${r.express.from} to ${r.express.to}.`;
    if (r.bumped) return `${name} landed on ${who === 'you' ? 'Maya' : 'you'}: back 2 squares!`;
    return undefined;
  };

  const choose = (lv: Level) => {
    // The card comes from the place you're heading to.
    const c = drawCard(lv, Math.min(HOME - 1, players.you + STEPS[lv]), recent.current);
    remember(c);
    setLevel(lv);
    setCard(c);
    setPhase('card');
  };

  const botTurn = async () => {
    setPhase('bot');
    await wait(700);
    if (!alive.current) return;
    const now = playersRef.current;
    const lv = botChoice(now);
    const c = drawCard(lv, Math.min(HOME - 1, now.bot + STEPS[lv]), recent.current);
    remember(c);
    const right = Math.random() < BOT_SKILL[lv];
    setToast({ who: 'bot', text: `Maya picked ${LEVEL_NAME[lv]}`, sub: `“${c.target}”` });
    // Hearing Maya's phrase is extra listening practice.
    if (sound) await speak(c.target, 1);
    else await wait(1400);
    if (!alive.current) return;
    if (!right) {
      setToast({ who: 'bot', text: 'Maya missed a word. She stays.', good: false });
      await wait(1200);
    } else {
      const r = move(playersRef.current, 'bot', STEPS[lv]);
      setToast({ who: 'bot', text: `Maya moves ${STEPS[lv]}`, sub: describe('bot', r), good: true });
      setPlayers(r.players);
      await wait(r.express || r.bumped ? 1500 : 1000);
      if (!alive.current) return;
      if (r.won) return end('bot');
    }
    setToast(null);
    setPhase('choose');
  };

  const cardDone = async (d: CardDone) => {
    const c = card!;
    setCard(null);
    stats.current.attempts++;
    if (d.right) {
      if (!d.retry) stats.current.firstTry++;
      stats.current.coins += c.level;
      stats.current.saidRight.push(c.id);
      const steps = stepsFor(c.level, d.retry);
      const r = move(players, 'you', steps);
      setPhase('moving');
      setPlayers(r.players);
      setToast({ who: 'you', text: `+${steps} step${steps > 1 ? 's' : ''}`, sub: describe('you', r), good: true });
      await wait(r.express || r.bumped ? 1500 : 900);
      if (!alive.current) return;
      if (r.won) return end('you');
    } else {
      stats.current.mistakes.push(c.id);
      onMistake(c.id);
      setPhase('moving');
      setToast({ who: 'you', text: 'No move this time', sub: 'This phrase is saved to your review deck.' });
      await wait(1100);
      if (!alive.current) return;
    }
    botTurn();
  };

  const here = placeAt(players.you);
  const previews = ([1, 2, 3] as Level[]).map((lv) => ({ square: Math.min(HOME, players.you + STEPS[lv]), level: lv }));
  const landName = (sq: number) =>
    sq >= HOME ? 'Home' : EXPRESS[sq] !== undefined ? 'Express!' : PLACES[placeAt(sq)!].name;

  return (
    <div className="screen game">
      <header className="game__top">
        <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Leave game">
          ←
        </button>
        <div className={`player player--you ${phase === 'choose' || phase === 'card' ? 'is-turn' : ''}`}>
          <span className="player__dot" />
          You <span className="player__pos">{players.you}/{HOME}</span>
        </div>
        <div className={`player player--bot ${phase === 'bot' ? 'is-turn' : ''}`}>
          <span className="player__dot" />
          Maya <span className="player__pos">{players.bot}/{HOME}</span>
        </div>
      </header>

      <BoardView players={players} previews={phase === 'choose' ? previews : []} active={phase === 'bot' ? 'bot' : 'you'} />

      <div className="game__panel">
        {phase === 'choose' && (
          <>
            <p className="panel-title">
              Your turn{here ? (
                <>
                  {' '}
                  at the <strong>{PLACES[here].name}</strong>
                </>
              ) : null}
              . Pick a card:
            </p>
            <div className="choices">
              {([1, 2, 3] as Level[]).map((lv) => {
                const to = Math.min(HOME, players.you + STEPS[lv]);
                return (
                  <button key={lv} type="button" className={`choice choice--${lv}`} onClick={() => choose(lv)}>
                    <span className="choice__level">{LEVEL_NAME[lv]}</span>
                    <span className="choice__steps">
                      +{STEPS[lv]}
                    </span>
                    <span className="choice__to">→ {landName(to)}</span>
                  </button>
                );
              })}
            </div>
            <p className="panel-note">Say it right to move. No dice.</p>
          </>
        )}
        {phase !== 'choose' && toast && (
          <div className={`toast toast--${toast.who} ${toast.good === false ? 'is-bad' : ''}`} aria-live="polite">
            <p className="toast__text">{toast.text}</p>
            {toast.sub && <p className="toast__sub">{toast.sub}</p>}
          </div>
        )}
        {phase === 'bot' && !toast && <p className="panel-title">Maya's turn…</p>}
      </div>

      {phase === 'card' && card && (
        <CardSheet key={card.id + level} card={card} mode="game" sound={sound} bangla={bangla} onDone={cardDone} />
      )}

      {confirmExit && (
        <div className="sheet-backdrop" onClick={() => setConfirmExit(false)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="exit-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="exit-title">Leave this game?</h2>
            <p>Your review deck is saved. This game won't count.</p>
            <div className="row">
              <button type="button" className="btn btn--soft" onClick={() => setConfirmExit(false)}>
                Keep playing
              </button>
              <button type="button" className="btn btn--go" onClick={onExit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'over' && winner && <EndScreen won={winner === 'you'} stats={stats.current} onExit={onExit} />}
    </div>
  );
}

function EndScreen({ won, stats, onExit }: { won: boolean; stats: GameSummary; onExit: () => void }) {
  const missed = new Set(stats.mistakes).size;
  return (
    <div className="sheet-backdrop">
      <section className="end" role="dialog" aria-modal="true" aria-labelledby="end-title">
        {won && <div className="confetti" aria-hidden="true" />}
        <h2 id="end-title" className={`end__title ${won ? 'is-win' : ''}`}>
          {won ? 'You made it Home!' : 'Maya got Home first'}
        </h2>
        <div className="end__stats">
          <div>
            <span className="big">
              {stats.firstTry}/{stats.attempts}
            </span>
            <span>right first try</span>
          </div>
          <div>
            <span className="big">{stats.saidRight.length}</span>
            <span>said right</span>
          </div>
          <div>
            <span className="big">+{stats.coins}</span>
            <span>coins</span>
          </div>
        </div>
        {missed > 0 ? (
          <p className="end__note">
            <strong>
              {missed} phrase{missed > 1 ? 's' : ''}
            </strong>{' '}
            saved to your review deck. {missed > 1 ? 'They come' : 'It comes'} back tomorrow.
          </p>
        ) : (
          <p className="end__note">No mistakes this game. Great work!</p>
        )}
        <button type="button" className="btn btn--go btn--big" onClick={onExit}>
          See your real-life mission
        </button>
      </section>
    </div>
  );
}
