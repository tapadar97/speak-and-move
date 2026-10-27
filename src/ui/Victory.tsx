import { BOSSES, NATIVE_BOSSES } from '../game/bosses';
import type { Rung } from '../game/ladder';
import { PLACES, cardById, type WorldId } from '../game/cards';
import { STAT_INFO, STAT_KEYS, type Stats } from '../game/stats';
import { WORLDS, isPlayable } from '../game/worlds';
import { Art, PlayerArt } from './kit';

interface Props {
  world: WorldId;
  /** A Native round win rather than the world's boss. */
  native: boolean;
  /** The new rank, when this win moved you up the ladder. */
  rankUp: Rung | null;
  /** This was the last step: you're an Expert New Yorker. */
  expert: boolean;
  stars: number;
  firstClear: boolean;
  before: Stats | null;
  after: Stats | null;
  missionCardId: string | null;
  bangla: boolean;
  onNext: () => void;
  /** After a boss: go on to this world's Native round. */
  onNative: () => void;
  onHome: () => void;
}

export function Victory({ world, native, rankUp, expert, stars, firstClear, before, after, missionCardId, bangla, onNext, onNative, onHome }: Props) {
  const w = WORLDS[world - 1];
  const reward = native ? w.nativeReward! : w.reward!;
  const boss = native ? NATIVE_BOSSES[world] : BOSSES[world];
  const mission = missionCardId ? cardById(missionCardId) : null;
  const next = WORLDS[world];
  const ups = before && after ? STAT_KEYS.filter((k) => after[k] > before[k]) : [];

  return (
    <div className={`screen victory boss--w${world}`}>
      <div className="confetti" aria-hidden="true" />
      <h1 className="victory__title">{expert ? 'EXPERT NEW YORKER!' : native ? 'NATIVE ROUND CLEAR!' : 'WORLD CLEAR!'}</h1>
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

      {rankUp && (
        <section className="rank-up" role="status">
          <span className="rank-up__icon" aria-hidden="true">
            {rankUp.icon}
          </span>
          <div>
            <p className="rank-up__eyebrow">New rank</p>
            <p className="rank-up__name">{rankUp.name}</p>
            <p className="rank-up__about">{rankUp.about}</p>
          </div>
        </section>
      )}

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

      {!native ? (
        <>
          <button type="button" className="btn btn--go btn--big" onClick={onNative}>
            NATIVE ROUND: {NATIVE_BOSSES[world].name.toUpperCase()} →
          </button>
          <p className="victory__soon">Real New York speed and slang. Win it to climb the rank ladder.</p>
          {next && isPlayable(next.id) && (
            <button type="button" className="link-btn" onClick={onNext}>
              Skip to {next.name}
            </button>
          )}
        </>
      ) : next && isPlayable(next.id) ? (
        <button type="button" className="btn btn--go btn--big" onClick={onNext}>
          NEXT WORLD: {next.name.toUpperCase()} →
        </button>
      ) : (
        <p className="victory__soon">
          {expert ? 'You beat every boss and every Native round. Now go use it out there, New Yorker.' : 'Finish the other Native rounds to become an Expert New Yorker.'}
        </p>
      )}
      <button type="button" className="btn btn--blue" onClick={onHome}>
        Back to my journey
      </button>
    </div>
  );
}
