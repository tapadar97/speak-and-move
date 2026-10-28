import { useState } from 'react';
import { BOSSES, NATIVE_BOSSES } from '../game/bosses';
import { CARDS, type WorldId } from '../game/cards';
import { MAX_STEP, stepOf } from '../game/mastery';
import { LADDER, ladderRank, nextRung } from '../game/ladder';
import { DAILY_GOAL, goodToday, isUnlocked, liveStreak, nativeOpen, recheckDue, type Profile } from '../game/profile';
import { dueItems } from '../game/review';
import { WORLDS, isPlayable } from '../game/worlds';
import { MicIcon } from './kit';
import { BlockScene, Check, Chevron, Flame, Lock } from './scene';

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
  onStreak: () => void;
}

/** Phrases you have at least met once (Seen or better), out of the world's total. */
export function worldLearned(p: Profile, w: WorldId): { learned: number; total: number } {
  const cards = CARDS.filter((c) => c.world === w);
  return { learned: cards.filter((c) => stepOf(p.mastery, c.id) >= 1).length, total: cards.length };
}

/** How far through a world's phrases you are: average mastery, 0–100. */
export function worldPercent(p: Profile, w: WorldId): number {
  const cards = CARDS.filter((c) => c.world === w);
  const total = cards.reduce((t, c) => t + stepOf(p.mastery, c.id), 0);
  return Math.round((total / (cards.length * MAX_STEP)) * 100);
}

export function Journey({ profile, rank, current, day, onLearn, onRace, onBoss, onNative, onReview, onRecheck, onProfile, onStreak }: Props) {
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

  type Step = { key: string; label: string; done: boolean; locked: boolean; badge?: string; go: () => void };
  const steps: Step[] = [
    { key: 'learn', label: 'Learn 8 phrases', done: packDone, locked: false, go: () => onLearn(world) },
    { key: 'race', label: 'Race Maya', done: raceDone, locked: !packDone, badge: prog.raceWins > 1 ? `×${prog.raceWins}` : undefined, go: () => onRace(world) },
    { key: 'boss', label: `Beat ${boss.name}`, done: bossDone, locked: !raceDone, badge: bossDone ? '★'.repeat(prog.stars) : undefined, go: () => onBoss(world) },
    { key: 'native', label: 'Native round', done: nativeDone, locked: !nativeOpen(profile, world), badge: nativeDone ? '★'.repeat(prog.nativeStars) : undefined, go: () => onNative(world) },
  ];
  if (due) steps.push({ key: 'review', label: `Review ${due} phrase${due > 1 ? 's' : ''}`, done: false, locked: false, go: onReview });
  if (recheckDue(profile, day)) steps.push({ key: 'recheck', label: 'Weekly check-up', done: false, locked: false, go: onRecheck });

  return (
    <div className="screen journey">
      <header className="j-hero">
        <div className="j-hero__bar">
          <button type="button" className="j-unit" onClick={() => setPicking(true)} aria-haspopup="dialog">
            World {world} · {info.name}
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="j-streak" onClick={onStreak} aria-label={`${streak} day streak. Today ${good} of ${DAILY_GOAL}.`}>
            <Flame />
            {streak}
          </button>
        </div>
        <h1 className="j-hero__title">{info.goal}</h1>
        <p className="j-hero__count" aria-label={`${learned} of ${total} phrases learned`}>
          <span className="j-hero__bar-track">
            <span style={{ width: `${Math.max((learned / total) * 100, 3)}%` }} />
          </span>
          {learned}/{total} phrases
        </p>
        <BlockScene />
      </header>

      <ol className="path" aria-label="Lessons">
        <svg className="path__road" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M70 -10C110 40 20 60 30 110S90 170 60 220 0 290 40 330 80 380 50 420" fill="none" stroke="#efe2cc" strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {steps.map((s, n) => {
          const now = s.key === next || ((s.key === 'review' || s.key === 'recheck') && !next && n === 4);
          const state = now ? 'now' : s.done ? 'done' : s.locked ? 'locked' : 'open';
          return (
            <li key={s.key} className={`path__step path__step--${n % 4}`}>
              <button type="button" className={`step is-${state}`} onClick={s.locked ? undefined : s.go} disabled={s.locked} aria-label={`${s.label}${s.done ? ', done' : s.locked ? ', locked' : now ? ', up next' : ''}`}>
                {now ? (
                  <span className="step__mic" aria-hidden="true">
                    <MicIcon size={30} />
                  </span>
                ) : (
                  <span className="step__mark" aria-hidden="true">
                    {s.done ? <Check /> : s.locked ? <Lock size={16} /> : null}
                  </span>
                )}
                <span className="step__label">{s.label}</span>
                {s.badge && <span className="step__badge">{s.badge}</span>}
              </button>
              {now && <span className="step__sparks" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

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
        <div className="up-next__text">
          <p id="up-next-title" className="up-next__title">
            <span className="up-next__eyebrow">Up next:</span> {upNext.title}
          </p>
          <p className="up-next__why">
            {upNext.why} · {upNext.time}
          </p>
        </div>
        <button type="button" className="btn btn--go up-next__go" onClick={upNext.go}>
          Start <Chevron />
        </button>
      </section>

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
