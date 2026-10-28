import { nextRung } from '../game/ladder';
import { DAILY_GOAL, goodToday, liveStreak, weekDays, type Profile } from '../game/profile';
import { Bushes, Check, Chevron, Lock, SkylineScene } from './scene';

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  profile: Profile;
  day: string;
  onStart: () => void;
  onClose: () => void;
}

/** Your speaking streak: the week so far, today's goal and the next rank to unlock. */
export function Streak({ profile, day, onStart, onClose }: Props) {
  const streak = liveStreak(profile, day);
  const good = goodToday(profile, day);
  const doneToday = good >= DAILY_GOAL;
  const climb = nextRung(profile);

  return (
    <div className="screen celebrate streak-screen">
      <button type="button" className="icon-btn celebrate__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <h1 className="streak-title">
        <span className="streak-title__num">{streak}</span>
        <span>
          {streak === 1 ? 'day' : 'days'} of
          <br />
          speaking!
        </span>
      </h1>

      <div className="celebrate__art">
        <SkylineScene mood={streak > 0 ? 'happy' : 'calm'} />
      </div>

      <ol className="week-card" aria-label="This week">
        {weekDays(day).map((d, i) => {
          const done = profile.goalDays.includes(d);
          const isToday = d === day;
          const past = d < day;
          return (
            <li key={d} className={`week-card__day ${done ? 'is-done' : ''} ${isToday ? 'is-today' : ''} ${past && !done ? 'is-missed' : ''}`}>
              <span className="week-card__name">{isToday ? 'Today' : DAY_NAMES[i]}</span>
              <span className="week-card__dot" style={isToday && !done ? { ['--p' as string]: Math.min(1, good / DAILY_GOAL) } : undefined}>
                {done && <Check />}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="streak-note">{doneToday ? 'Today is done. Your streak is safe.' : `Today: ${good} of ${DAILY_GOAL} good answers to keep it.`}</p>

      {climb && (
        <section className="unlock-card">
          <span className="unlock-card__lock" aria-hidden="true">
            <Lock size={38} />
          </span>
          <p>
            <b>
              {climb.total - climb.done} more to unlock {climb.rung.name}
            </b>
            <span>Next: {climb.todo.label}</span>
          </p>
        </section>
      )}

      <button type="button" className="btn btn--go btn--big btn--split" onClick={onStart}>
        {doneToday ? 'Keep practising' : "Start today's lesson"} <Chevron />
      </button>
      <Bushes />
    </div>
  );
}
