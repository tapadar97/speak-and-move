import { useState } from 'react';
import { BOSSES, NATIVE_BOSSES } from '../game/bosses';
import { CARDS, type WorldId } from '../game/cards';
import { MAX_STEP, stepOf } from '../game/mastery';
import { LADDER, ladderRank, nextRung } from '../game/ladder';
import { DAILY_GOAL, goodToday, isUnlocked, liveStreak, nativeOpen, recheckDue, weekDays, type Profile } from '../game/profile';
import { dueItems } from '../game/review';
import { WORLDS, isPlayable } from '../game/worlds';
import { Art, PlayerArt } from './kit';

interface Props {
  profile: Profile;
  rank: number;
  current: WorldId;
  day: string;
  onLearn: (w: WorldId) => void;
  onRace: (w: WorldId) => void;
  onBoss: (w: WorldId) => void;
  /** The Native round: its slang pack first, then the fight. */
  onNative: (w: WorldId) => void;
  onReview: () => void;
  onRecheck: () => void;
  onProfile: () => void;
}

/** Phrases you have at least met once (Seen or better), out of the world's total. */
export function worldLearned(p: Profile, w: WorldId): { learned: number; total: number } {
  const cards = CARDS.filter((c) => c.world === w);
  return { learned: cards.filter((c) => stepOf(p.mastery, c.id) >= 1).length, total: cards.length };
}

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/** How far through a world's phrases you are: average mastery, 0–100. */
export function worldPercent(p: Profile, w: WorldId): number {
  const cards = CARDS.filter((c) => c.world === w);
  const total = cards.reduce((t, c) => t + stepOf(p.mastery, c.id), 0);
  return Math.round((total / (cards.length * MAX_STEP)) * 100);
}

interface TileProps {
  label: string;
  art: React.ReactNode;
  tone: 'sun' | 'sky' | 'coral' | 'lilac' | 'mint';
  state?: 'done' | 'locked' | 'next' | null;
  badge?: string;
  onClick?: () => void;
}

function Tile({ label, art, tone, state = null, badge, onClick }: TileProps) {
  const locked = state === 'locked';
  return (
    <button type="button" className={`tile ${state ? `is-${state}` : ''}`} onClick={locked ? undefined : onClick} disabled={locked}>
      <span className={`tile__art tile__art--${tone}`}>
        {art}
        {state === 'done' && (
          <span className="tile__check" aria-label="Done">
            ✓
          </span>
        )}
        {locked && (
          <span className="tile__lock" aria-label="Locked">
            🔒
          </span>
        )}
        {badge && <span className="tile__badge">{badge}</span>}
        {state === 'next' && <span className="tile__next">START</span>}
      </span>
      <span className="tile__label">{label}</span>
    </button>
  );
}

export function Journey({ profile, rank, current, day, onLearn, onRace, onBoss, onNative, onReview, onRecheck, onProfile }: Props) {
  const [world, setWorld] = useState<WorldId>(current);
  const [picking, setPicking] = useState(false);
  const info = WORLDS[world - 1];
  const prog = profile.worlds[world];
  const boss = BOSSES[world];
  const { learned, total } = worldLearned(profile, world);
  const mastered = worldPercent(profile, world);
  const streak = liveStreak(profile, day);
  const good = goodToday(profile, day);
  const due = dueItems(profile.review, day).length;
  const packDone = profile.packDone[world];
  const raceDone = prog.raceWins > 0;
  const bossDone = prog.stars > 0;
  const nativeBoss = NATIVE_BOSSES[world];
  const nativeDone = prog.nativeStars > 0;
  const nextWorld = WORLDS[world] && isPlayable(WORLDS[world].id) && isUnlocked(profile, (world + 1) as WorldId, rank) ? WORLDS[world] : null;
  const myRank = LADDER[ladderRank(profile)];
  const climb = nextRung(profile);
  // The single next step is marked START, like a lesson path.
  const next = !packDone ? 'learn' : !raceDone ? 'race' : !bossDone ? 'boss' : !nativeDone ? 'native' : null;

  // One clear action at the top of the screen: what to do now, why, and how long.
  const upNext = !packDone
    ? { title: 'Learn 8 phrases', why: `Hear and say the phrases ${boss.name} will test you on.`, time: '3 min', icon: '📒', go: () => onLearn(world) }
    : !raceDone
      ? { title: 'Race Maya', why: 'Use your new phrases in real situations. Say it right to move.', time: '5 min', icon: '🏁', go: () => onRace(world) }
      : !bossDone
        ? { title: `Beat ${boss.name}`, why: 'Answer fast, like in a real New York line. Hints if you need them.', time: '3 min', icon: boss.icon, go: () => onBoss(world) }
        : !nativeDone
          ? { title: `Native round: ${nativeBoss.name}`, why: 'Real New York speed and slang. 12 seconds, no hints, no Bangla.', time: '4 min', icon: '⚡', go: () => onNative(world) }
        : nextWorld
          ? { title: `Go to ${nextWorld.name}`, why: nextWorld.goal ?? '', time: '3 min', icon: nextWorld.icon, go: () => setWorld(nextWorld.id as WorldId) }
        : due
          ? { title: `Review ${due} phrase${due > 1 ? 's' : ''}`, why: 'You missed these before. Saying them again now makes them stick.', time: '2 min', icon: '🔁', go: onReview }
          : { title: 'Race again', why: `${mastered}% mastered. Every right answer moves a phrase up a star.`, time: '5 min', icon: '🏁', go: () => onRace(world) };

  return (
    <div className="screen journey">
      <header className="j-top">
        <div className="j-top__left">
          <button type="button" className="j-world" onClick={() => setPicking(true)} aria-haspopup="dialog">
            {info.name}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="j-progress" aria-label={`${learned} of ${total} phrases learned in ${info.name}`}>
            <span className="j-progress__bar">
              <span style={{ width: `${Math.max((learned / total) * 100, 3)}%` }} />
            </span>
            <span className="j-progress__pct">
              {learned}/{total} phrases
            </span>
          </div>
        </div>
        <span className="j-streak" aria-label={`${streak} day streak`}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#ff5a36" />
          </svg>
          {streak}
        </span>
        <button type="button" className="j-avatar" onClick={onProfile} aria-label="Your progress">
          <PlayerArt pose="avatar" />
        </button>
      </header>

      <ol className="week" aria-label={`This week: ${good} of ${DAILY_GOAL} good answers today`}>
        {weekDays(day).map((d, i) => {
          const done = profile.goalDays.includes(d);
          const isToday = d === day;
          return (
            <li key={d} className={`week__day ${done ? 'is-done' : ''} ${isToday ? 'is-today' : ''}`}>
              <span
                className="week__dot"
                style={isToday && !done ? { ['--p' as string]: Math.min(1, good / DAILY_GOAL) } : undefined}
              >
                {done ? '✓' : ''}
              </span>
              <span className="week__name">{DAY_NAMES[i]}</span>
            </li>
          );
        })}
      </ol>
      <p className="week__note">
        {good >= DAILY_GOAL ? 'Daily goal done. See you tomorrow!' : `Today: ${good} of ${DAILY_GOAL} good answers`}
      </p>

      <button type="button" className="rank-strip" onClick={onProfile} aria-label={`Rank: ${myRank.name}. ${climb ? `Next: ${climb.rung.name}, ${climb.done} of ${climb.total} done` : 'Top rank'}`}>
        <span className="rank-strip__icon" aria-hidden="true">
          {myRank.icon}
        </span>
        <span className="rank-strip__text">
          <span className="rank-strip__name">{myRank.name}</span>
          <span className="rank-strip__next">{climb ? `Next: ${climb.rung.icon} ${climb.rung.name} · ${climb.todo.label}` : 'Top rank. You did it!'}</span>
        </span>
        <span className="rank-strip__steps" aria-hidden="true">
          {LADDER.map((r, i) => (
            <i key={r.name} className={i <= ladderRank(profile) ? 'is-on' : ''} />
          ))}
        </span>
      </button>

      <section className="up-next" aria-labelledby="up-next-title">
        <span className="up-next__icon" aria-hidden="true">
          {upNext.icon}
        </span>
        <div className="up-next__text">
          <p className="up-next__eyebrow">Up next · about {upNext.time}</p>
          <h2 id="up-next-title" className="up-next__title">
            {upNext.title}
          </h2>
          <p className="up-next__why">{upNext.why}</p>
        </div>
        <button type="button" className="btn btn--go up-next__go" onClick={upNext.go}>
          Start
        </button>
      </section>

      <section className="level">
        <div className="level__art">
          <Art name={info.art} fallback={info.icon} className="level__img" />
        </div>
        <div>
          <span className="level__badge">WORLD {world}</span>
          <h1 className="level__title">{info.goal}</h1>
          <p className="level__about">{info.about}</p>
        </div>
      </section>

      <div className="tiles">
        <Tile
          label="Learn 8 phrases"
          tone="sun"
          art={<span className="tile__emoji">📒</span>}
          state={packDone ? 'done' : next === 'learn' ? 'next' : null}
          onClick={() => onLearn(world)}
        />
        <Tile
          label="Race Maya"
          tone="sky"
          art={<Art name="maya" fallback="🏁" className="tile__img" />}
          state={!packDone ? 'locked' : raceDone ? 'done' : next === 'race' ? 'next' : null}
          badge={prog.raceWins > 1 ? `×${prog.raceWins}` : undefined}
          onClick={() => onRace(world)}
        />
        <Tile
          label={`Beat ${boss.name}`}
          tone="coral"
          art={<Art name={boss.art} fallback={boss.icon} className="tile__img" />}
          state={!raceDone ? 'locked' : bossDone ? 'done' : next === 'boss' ? 'next' : null}
          badge={bossDone ? '★'.repeat(prog.stars) : undefined}
          onClick={() => onBoss(world)}
        />
        <Tile
          label="Native round"
          tone="mint"
          art={<span className="tile__emoji">⚡</span>}
          state={!nativeOpen(profile, world) ? 'locked' : nativeDone ? 'done' : next === 'native' ? 'next' : null}
          badge={nativeDone ? '★'.repeat(prog.nativeStars) : undefined}
          onClick={() => onNative(world)}
        />
        <Tile
          label={due ? `Review (${due})` : 'Review'}
          tone="lilac"
          art={<span className="tile__emoji">🔁</span>}
          state={due ? null : 'locked'}
          onClick={onReview}
        />
        {recheckDue(profile, day) && (
          <Tile label="Weekly check-up" tone="mint" art={<span className="tile__emoji">📈</span>} state="next" onClick={onRecheck} />
        )}
      </div>
      {due === 0 && <p className="week__note">Review opens when a missed phrase is due.</p>}

      {picking && (
        <div className="sheet-backdrop" onClick={() => setPicking(false)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="pick-world" onClick={(e) => e.stopPropagation()}>
            <h2 id="pick-world">Your worlds</h2>
            {WORLDS.map((w) => {
              const id = w.id as WorldId;
              const playable = isPlayable(w.id);
              const open = playable && isUnlocked(profile, id, rank);
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`setting ${world === w.id ? 'is-on' : ''}`}
                  disabled={!open}
                  onClick={() => {
                    setWorld(id);
                    setPicking(false);
                  }}
                >
                  <span>
                    {w.icon} {w.name}
                  </span>
                  <span className="setting__state">{!playable ? 'Soon' : !open ? '🔒' : `${worldLearned(profile, id).learned}/${worldLearned(profile, id).total}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
