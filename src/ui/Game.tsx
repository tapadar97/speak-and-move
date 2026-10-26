import { useEffect, useRef, useState } from 'react';
import { BOSSES } from '../game/bosses';
import { HOME, START, botChoice, drawCard, move, preview, stepsFor, type Players } from '../game/board';
import { LEVEL_NAME, PLACES, STEPS, type Card, type Level, type WorldId } from '../game/cards';
import type { Stats } from '../game/stats';
import { worldById } from '../game/worlds';
import { sayPhrase } from '../speech';
import { BoardView } from './BoardView';
import { CardSheet, type CardDone } from './CardSheet';
import { Art, PlayerArt } from './kit';

export interface RaceSummary {
  won: boolean;
  attempts: number;
  firstTry: number;
  coins: number;
  xp: number;
  mistakes: string[];
  saidRight: string[];
}

interface Props {
  world: WorldId;
  stats: Stats | null;
  sound: boolean;
  bangla: boolean;
  bossBeaten: boolean;
  onCard: (card: Card, right: boolean, firstTry: boolean) => void;
  onFinish: (s: RaceSummary) => void;
  onBoss: () => void;
  onRematch: () => void;
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

const TAUNTS = ['Catch me if you can!', "You're fast… for a tourist!", 'Is that all you got?', 'See you at Home!'];

export function Game({ world, stats, sound, bangla, bossBeaten, onCard, onFinish, onBoss, onRematch, onExit }: Props) {
  const [players, setPlayers] = useState<Players>({ you: START, bot: START });
  const [phase, setPhase] = useState<Phase>('choose');
  const [card, setCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [winner, setWinner] = useState<'you' | 'bot' | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [taunt, setTaunt] = useState(TAUNTS[0]);
  const recent = useRef<string[]>([]);
  const summary = useRef<RaceSummary>({ won: false, attempts: 0, firstTry: 0, coins: 0, xp: 0, mistakes: [], saidRight: [] });
  const alive = useRef(true);
  const playersRef = useRef(players);
  playersRef.current = players;
  const skill = worldById(world).rivalSkill!;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const remember = (c: Card) => {
    recent.current = [...recent.current.slice(-10), c.id];
  };

  const end = (who: 'you' | 'bot') => {
    setWinner(who);
    setPhase('over');
    summary.current.won = who === 'you';
    if (who === 'you') {
      summary.current.xp += 50;
      summary.current.coins += 20;
    }
    onFinish({ ...summary.current });
  };

  const describe = (who: 'you' | 'bot', r: ReturnType<typeof move>) => {
    const name = who === 'you' ? 'You' : 'Maya';
    if (r.won) return `${name} reached Home!`;
    if (r.express) return `Express train! ${name} rode from ${r.express.from} to ${r.express.to}.`;
    if (r.bumped) return who === 'you' ? '💥 You bumped Maya back 2 squares!' : '💥 Maya bumped you back 2 squares!';
    return undefined;
  };

  const choose = (lv: Level) => {
    // The card comes from the place you're heading to.
    const c = drawCard(world, lv, Math.min(HOME - 1, players.you + STEPS[lv]), recent.current, stats);
    remember(c);
    setCard(c);
    setPhase('card');
  };

  const botTurn = async () => {
    setPhase('bot');
    await wait(600);
    if (!alive.current) return;
    const now = playersRef.current;
    const lv = botChoice(now);
    const c = drawCard(world, lv, Math.min(HOME - 1, now.bot + STEPS[lv]), recent.current);
    remember(c);
    const right = Math.random() < skill[lv];
    setToast({ who: 'bot', text: `Maya picked ${LEVEL_NAME[lv]}`, sub: `“${c.target}”` });
    // Hearing Maya's phrase is extra listening practice.
    if (sound) await sayPhrase(c.id, c.target, 'maya', 1);
    else await wait(1400);
    if (!alive.current) return;
    if (!right) {
      setToast({ who: 'bot', text: 'Maya missed a word. She stays.', good: false });
      await wait(1100);
    } else {
      const r = move(world, playersRef.current, 'bot', STEPS[lv]);
      setToast({ who: 'bot', text: `Maya moves ${STEPS[lv]}`, sub: describe('bot', r), good: true });
      setPlayers(r.players);
      if (r.players.bot > r.players.you) setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
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
    summary.current.attempts++;
    onCard(c, d.right, d.right && !d.retry);
    if (d.right) {
      if (!d.retry) summary.current.firstTry++;
      summary.current.coins += c.level;
      summary.current.xp += 10 * c.level;
      summary.current.saidRight.push(c.id);
      const steps = stepsFor(c.level, d.retry);
      const r = move(world, players, 'you', steps);
      setPhase('moving');
      setPlayers(r.players);
      setToast({ who: 'you', text: `+${steps} step${steps > 1 ? 's' : ''}`, sub: describe('you', r), good: true });
      await wait(r.express || r.bumped ? 1500 : 900);
      if (!alive.current) return;
      if (r.won) return end('you');
    } else {
      summary.current.mistakes.push(c.id);
      setPhase('moving');
      setToast({ who: 'you', text: 'No move this time', sub: 'This phrase is saved to your review deck.' });
      await wait(1100);
      if (!alive.current) return;
    }
    botTurn();
  };

  const options = ([1, 2, 3] as Level[]).map((lv) => ({ lv, ...preview(world, players.you, lv, players.bot) }));
  const landLabel = (o: (typeof options)[number]) =>
    o.home ? 'Home!' : o.express ? 'Express!' : o.bump ? 'Bump Maya!' : PLACES[o.place!].name;
  const landIcon = (o: (typeof options)[number]) => (o.home ? '🏠' : o.express ? '🚄' : o.bump ? '💥' : PLACES[o.place!].icon);

  return (
    <div className="screen game">
      <header className="versus">
        <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Leave race">
          ←
        </button>
        <div className={`vs-panel vs-panel--you ${phase === 'choose' || phase === 'card' ? 'is-turn' : ''}`}>
          <PlayerArt pose="avatar" className="vs-panel__avatar" />
          <span className="vs-panel__name">YOU</span>
          <span className="vs-panel__pos">
            <b>{players.you}</b>/{HOME}
          </span>
        </div>
        <div className={`vs-panel vs-panel--bot ${phase === 'bot' ? 'is-turn' : ''}`}>
          <span className="vs-panel__name">MAYA</span>
          <span className="vs-panel__pos">
            <b>{players.bot}</b>/{HOME}
          </span>
          <Art name="maya" fallback="👩🏽‍🦱" className="vs-panel__avatar" />
          <span className="taunt">{taunt}</span>
        </div>
      </header>

      <BoardView
        world={world}
        players={players}
        previews={phase === 'choose' ? options.map((o) => ({ square: o.square, level: o.lv })) : []}
        active={phase === 'bot' ? 'bot' : 'you'}
      />

      <section className="turn-panel">
        {phase === 'choose' && (
          <>
            <p className="turn-panel__title">Your turn! Pick a card:</p>
            <div className="choices">
              {options.map((o) => (
                <button key={o.lv} type="button" className={`choice choice--${o.lv}`} onClick={() => choose(o.lv)}>
                  <span className="choice__level">{LEVEL_NAME[o.lv].toUpperCase()}</span>
                  <span className="choice__steps">+{STEPS[o.lv]}</span>
                  <span className="choice__icon" aria-hidden="true">
                    {landIcon(o)}
                  </span>
                  <span className="choice__to">→ {landLabel(o)}</span>
                </button>
              ))}
            </div>
            <p className="turn-panel__note">Say it right to move. No dice!</p>
            {bangla && (
              <p className="turn-panel__note bn-line" lang="bn">
                সঠিক বললেই এগোবেন!
              </p>
            )}
          </>
        )}
        {phase !== 'choose' && toast && (
          <div className={`toast toast--${toast.who} ${toast.good === false ? 'is-bad' : ''}`} aria-live="polite">
            <p className="toast__text">{toast.text}</p>
            {toast.sub && <p className="toast__sub">{toast.sub}</p>}
          </div>
        )}
      </section>

      {phase === 'card' && card && <CardSheet key={card.id} card={card} mode="game" sound={sound} bangla={bangla} onDone={cardDone} />}

      {confirmExit && (
        <div className="sheet-backdrop" onClick={() => setConfirmExit(false)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="exit-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="exit-title">Leave this race?</h2>
            <p>Your review deck is saved. This race won't count.</p>
            <div className="row">
              <button type="button" className="btn btn--blue" onClick={() => setConfirmExit(false)}>
                Keep playing
              </button>
              <button type="button" className="btn btn--go" onClick={onExit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'over' && winner && (
        <RaceEnd
          won={winner === 'you'}
          summary={summary.current}
          boss={BOSSES[world].name}
          bossBeaten={bossBeaten}
          onBoss={onBoss}
          onRematch={onRematch}
          onExit={onExit}
        />
      )}
    </div>
  );
}

interface EndProps {
  won: boolean;
  summary: RaceSummary;
  boss: string;
  bossBeaten: boolean;
  onBoss: () => void;
  onRematch: () => void;
  onExit: () => void;
}

function RaceEnd({ won, summary, boss, bossBeaten, onBoss, onRematch, onExit }: EndProps) {
  const missed = new Set(summary.mistakes).size;
  return (
    <div className="sheet-backdrop">
      <section className="end" role="dialog" aria-modal="true" aria-labelledby="end-title">
        {won && <div className="confetti" aria-hidden="true" />}
        <h2 id="end-title" className={`end__title ${won ? 'is-win' : ''}`}>
          {won ? 'You beat Maya!' : 'Maya got Home first'}
        </h2>
        <div className="end__stats">
          <div>
            <span className="big">
              {summary.firstTry}/{summary.attempts}
            </span>
            <span>right first try</span>
          </div>
          <div>
            <span className="big">+{summary.xp}</span>
            <span>XP</span>
          </div>
          <div>
            <span className="big">+{summary.coins}</span>
            <span>coins</span>
          </div>
        </div>
        <p className="end__note">
          {missed > 0
            ? `${missed} phrase${missed > 1 ? 's' : ''} saved to your review deck. ${missed > 1 ? 'They come' : 'It comes'} back tomorrow.`
            : 'No mistakes this race. Great work!'}
        </p>
        {won && !bossBeaten ? (
          <>
            <div className="unlock">
              <span aria-hidden="true">🔓</span> Boss unlocked: <strong>{boss}</strong>
            </div>
            <button type="button" className="btn btn--red btn--big" onClick={onBoss}>
              Fight {boss}!
            </button>
            <button type="button" className="link-btn" onClick={onExit}>
              Later. Back to the map
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--go btn--big" onClick={onRematch}>
              {won ? 'Race again' : 'Rematch'}
            </button>
            <button type="button" className="link-btn" onClick={onExit}>
              Back to the map
            </button>
          </>
        )}
      </section>
    </div>
  );
}
