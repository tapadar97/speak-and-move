import { BOSSES } from '../game/bosses';
import { PLACES, cardById, type WorldId } from '../game/cards';
import { STAT_INFO, STAT_KEYS, type Stats } from '../game/stats';
import { WORLDS, isPlayable } from '../game/worlds';
import { Art, PlayerArt } from './kit';

interface Props {
  world: WorldId;
  stars: number;
  firstClear: boolean;
  before: Stats | null;
  after: Stats | null;
  missionCardId: string | null;
  bangla: boolean;
  onNext: () => void;
  onHome: () => void;
}

export function Victory({ world, stars, firstClear, before, after, missionCardId, bangla, onNext, onHome }: Props) {
  const w = WORLDS[world - 1];
  const reward = w.reward!;
  const boss = BOSSES[world];
  const mission = missionCardId ? cardById(missionCardId) : null;
  const next = WORLDS[world];
  const ups = before && after ? STAT_KEYS.filter((k) => after[k] > before[k]) : [];

  return (
    <div className={`screen victory boss--w${world}`}>
      <div className="confetti" aria-hidden="true" />
      <h1 className="victory__title">WORLD CLEAR!</h1>
      <div className="stars" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((s) => (
          <span key={s} className={s <= stars ? 'is-on' : ''} style={{ animationDelay: `${s * 0.18}s` }}>
            ★
          </span>
        ))}
      </div>

      <div className="victory__cast" aria-hidden="true">
        <PlayerArt pose="cheer" className="victory__hero" />
        <Art name={boss.art} fallback={boss.icon} className="victory__boss" />
      </div>

      {firstClear && (
        <div className="rewards">
          <div className="reward">
            <span className="reward__icon">🪙</span>
            <span>+{reward.coins} coins</span>
          </div>
          <div className="reward">
            <span className="reward__icon">⭐</span>
            <span>+{reward.xp} XP</span>
          </div>
          <div className="reward">
            <span className="reward__icon">🎁</span>
            <span>New: {reward.outfit}</span>
          </div>
        </div>
      )}

      {ups.length > 0 && (
        <ul className="stat-ups">
          {ups.map((k) => (
            <li key={k}>
              <span aria-hidden="true">{STAT_INFO[k].icon}</span>
              <span className="stat-ups__name">{STAT_INFO[k].name}</span>
              <span className="stat-ups__nums">
                {before![k]} → {after![k]}
              </span>
              <span className="stat-ups__arrow" aria-hidden="true">
                ▲
              </span>
            </li>
          ))}
        </ul>
      )}

      {mission && (
        <section className="mission">
          <p className="mission__eyebrow">📋 Real-life mission</p>
          <p>
            Today at the {PLACES[mission.place].name.toLowerCase()}, say: <strong>“{mission.target}”</strong>
          </p>
          {bangla && (
            <p className="bn-line" lang="bn">
              {mission.bn}
            </p>
          )}
        </section>
      )}

      {next && isPlayable(next.id) ? (
        <button type="button" className="btn btn--go btn--big" onClick={onNext}>
          NEXT WORLD →
        </button>
      ) : (
        <p className="victory__soon">More worlds are coming soon: {next ? next.name : 'stay tuned'}!</p>
      )}
      <button type="button" className="btn btn--blue" onClick={onHome}>
        Back to my journey
      </button>
    </div>
  );
}
