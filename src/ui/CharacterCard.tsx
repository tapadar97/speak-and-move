import { QUESTS, RANKS, STAT_INFO, STAT_KEYS, rankIndex, weakest, type Stats } from '../game/stats';
import { PlayerArt, RANK_ICONS } from './kit';

interface Props {
  stats: Stats;
  /** Stats before the latest weekly check-up, to show progress. */
  before: Stats | null;
  name: string;
  mode: 'result' | 'view';
  bangla: boolean;
  outfits: string[];
  onStart: () => void;
  onRetake?: () => void;
  /** Shown as the Progress tab (no back button). */
  inTab?: boolean;
  onSettings?: () => void;
}

export function CharacterCard({ stats, before, name, mode, bangla, outfits, onStart, onRetake, inTab = false, onSettings }: Props) {
  const rank = rankIndex(stats);
  const weak = weakest(stats);
  const quest = QUESTS[weak];

  return (
    <div className={`screen card-screen ${mode === 'result' ? 'is-result' : ''}`}>
      <div className="sky-scene" aria-hidden="true">
        <div className="skyline" />
        <div className="street" />
      </div>
      {mode === 'result' && <div className="confetti" aria-hidden="true" />}
      {inTab && (
        <header className="page-head">
          <h1 className="page-title">Progress</h1>
          <p className="page-sub">Your level, your five skills, and what to work on next.</p>
        </header>
      )}

      <section className="player-card" aria-label="Your player card">
        <div className="player-card__hero">
          <PlayerArt pose="avatar" className="player-card__art" />
          <p className="player-card__you">{name ? name.toUpperCase() : 'YOU'}</p>
        </div>

        <div className="rank-badge">
          <span aria-hidden="true">{RANK_ICONS[rank]}</span> {RANKS[rank].toUpperCase()}
        </div>

        <ol className="rank-path" aria-label="Ranks">
          {RANKS.map((r, i) => (
            <li key={r} className={i < rank ? 'is-past' : i === rank ? 'is-now' : 'is-locked'}>
              <span className="rank-path__dot" aria-hidden="true">
                {i <= rank ? RANK_ICONS[i] : '🔒'}
              </span>
              <span className="rank-path__name">{r}</span>
            </li>
          ))}
        </ol>

        <ul className="stat-list">
          {STAT_KEYS.map((k) => {
            const info = STAT_INFO[k];
            return (
              <li key={k} className="stat-row">
                <span className="stat-row__icon" aria-hidden="true">
                  {info.icon}
                </span>
                <span className="stat-row__name">
                  {info.name}
                  {k === weak && <span className="weak-tag">Weak</span>}
                </span>
                <span className="stat-row__bar" role="meter" aria-valuenow={stats[k]} aria-valuemin={0} aria-valuemax={100} aria-label={`${info.name}: ${info.what}`}>
                  <span style={{ width: `${stats[k]}%`, background: info.color }} />
                </span>
                <span className="stat-row__num">
                  {stats[k]}
                  {before && stats[k] !== before[k] && (
                    <span className={`delta ${stats[k] > before[k] ? 'is-up' : 'is-down'}`}>
                      {stats[k] > before[k] ? '+' : ''}
                      {stats[k] - before[k]}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        {before && <p className="player-card__since">Green numbers: change since your last check-up</p>}
        {outfits.length > 0 && <p className="player-card__outfits">Outfits: {outfits.join(' · ')}</p>}
      </section>

      <section className="quest-box">
        <span className="quest-box__icon" aria-hidden="true">
          📜
        </span>
        <div>
          <p className="quest-box__title">Your quest</p>
          <p>{quest.en}</p>
          {bangla && (
            <p className="quest-box__bn" lang="bn">
              {quest.bn}
            </p>
          )}
        </div>
      </section>

      {inTab ? null : (
        <button type="button" className="btn btn--go btn--big" onClick={onStart}>
          {mode === 'result' ? 'Start your journey' : 'Back to your journey'}
        </button>
      )}
      {onRetake && (
        <button type="button" className="link-btn link-btn--light" onClick={onRetake}>
          Replay First Day to update your card
        </button>
      )}
      {onSettings && (
        <button type="button" className="link-btn" onClick={onSettings}>
          Settings and title screen
        </button>
      )}
    </div>
  );
}
