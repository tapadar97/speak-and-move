import { useState } from 'react';
import { BOSSES } from '../game/bosses';
import { PLACES, cardById, type WorldId } from '../game/cards';
import { XP_PER_LEVEL, isUnlocked, playerLevel, type Profile } from '../game/profile';
import { dueItems } from '../game/review';
import { RANKS } from '../game/stats';
import { WORLDS, isPlayable } from '../game/worlds';
import { Art, RANK_ICONS } from './kit';

interface Props {
  profile: Profile;
  rank: number;
  current: WorldId;
  day: string;
  onRace: (w: WorldId) => void;
  onBoss: (w: WorldId) => void;
  onCard: () => void;
  onReview: () => void;
  onMissionDone: () => void;
  onTitle: () => void;
}

export function MapScreen({ profile, rank, current, day, onRace, onBoss, onCard, onReview, onMissionDone, onTitle }: Props) {
  const [open, setOpen] = useState<WorldId | null>(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const due = dueItems(profile.review, day).length;
  const xpInto = profile.xp % XP_PER_LEVEL;
  const mission = profile.mission ? cardById(profile.mission.cardId) : null;

  /** PLAY goes to the next step in the current world: the race, then the boss. */
  const play = () => {
    const w = profile.worlds[current];
    if (w.raceWins > 0 && w.stars === 0) onBoss(current);
    else onRace(current);
  };

  return (
    <div className="screen map-screen">
      <header className="map-top">
        <button type="button" className="map-top__me" onClick={onCard} aria-label="Open your player card">
          <Art name="hero-avatar" fallback="🧔🏽‍♂️" className="map-top__avatar" />
          <span className="map-top__rank">
            {RANK_ICONS[rank]} {RANKS[rank].toUpperCase()}
          </span>
        </button>
        <div className="xp" aria-label={`Level ${playerLevel(profile.xp)}, ${xpInto} of ${XP_PER_LEVEL} XP`}>
          <span className="xp__bar">
            <span style={{ width: `${(xpInto / XP_PER_LEVEL) * 100}%` }} />
          </span>
          <span className="xp__text">
            Lv {playerLevel(profile.xp)} · {xpInto} / {XP_PER_LEVEL} XP
          </span>
        </div>
        <div className="coins" aria-label={`${profile.coins} coins`}>
          <span className="coin" aria-hidden="true" />
          {profile.coins}
        </div>
      </header>

      <ol className="world-path">
        {[...WORLDS].reverse().map((w) => {
          const id = w.id as WorldId;
          const playable = isPlayable(w.id);
          const unlocked = playable && isUnlocked(profile, id, rank);
          const prog = playable ? profile.worlds[id] : null;
          const cleared = (prog?.stars ?? 0) > 0;
          const isCurrent = playable && id === current;
          const boss = playable ? BOSSES[id] : null;
          const state = !playable ? 'soon' : !unlocked ? 'locked' : cleared ? 'cleared' : isCurrent ? 'current' : 'open';
          return (
            <li key={w.id} className={`world world--${state}`}>
              <button
                type="button"
                className="world__island"
                onClick={() => unlocked && setOpen(id)}
                disabled={!unlocked}
                aria-label={`${w.name}: ${state === 'soon' ? 'coming soon' : state}`}
              >
                <span className="world__icon" aria-hidden="true">
                  {w.icon}
                </span>
                <span className="world__name">{w.name}</span>
                {cleared && (
                  <span className="world__stars" aria-label={`${prog!.stars} stars`}>
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={s <= prog!.stars ? 'is-on' : ''}>
                        ★
                      </span>
                    ))}
                  </span>
                )}
                {state === 'current' && <span className="world__tag">CURRENT</span>}
                {state === 'locked' && <span className="world__lock">🔒</span>}
                {state === 'soon' && <span className="world__tag world__tag--soon">COMING SOON</span>}
              </button>
              <div className={`world__boss ${unlocked ? '' : 'is-dark'}`} aria-hidden="true">
                {boss ? <Art name={boss.art} fallback={boss.icon} /> : <span className="art art--fallback"><span>❔</span></span>}
              </div>
              {isCurrent && (
                <div className="world__pin" aria-hidden="true">
                  <Art name="hero-avatar" fallback="🧔🏽‍♂️" />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <footer className="map-foot">
        <button type="button" className="round-btn" onClick={onReview} disabled={due === 0} aria-label={`Review, ${due} phrases due`}>
          <span aria-hidden="true">📖</span>
          {due > 0 && <span className="round-btn__badge">{due}</span>}
          <span className="round-btn__label">Review</span>
        </button>
        <button type="button" className="btn btn--go btn--mega" onClick={play}>
          PLAY
        </button>
        <button type="button" className="round-btn" onClick={() => setMissionOpen(true)} aria-label="Daily mission">
          <span aria-hidden="true">📋</span>
          {mission && <span className="round-btn__badge round-btn__badge--gold">1</span>}
          <span className="round-btn__label">Mission</span>
        </button>
      </footer>
      <button type="button" className="link-btn link-btn--light map-title-link" onClick={onTitle}>
        Title screen
      </button>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(null)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="world-title" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">World {open}</p>
            <h2 id="world-title">{WORLDS[open - 1].name}</h2>
            <button type="button" className="btn btn--go" onClick={() => onRace(open)}>
              Race Maya
            </button>
            <button type="button" className="btn btn--red" onClick={() => onBoss(open)} disabled={profile.worlds[open].raceWins === 0}>
              Boss: {BOSSES[open].name} {profile.worlds[open].raceWins === 0 ? '🔒' : ''}
            </button>
            {profile.worlds[open].raceWins === 0 && <p className="fine">Beat Maya once to unlock the boss.</p>}
          </div>
        </div>
      )}

      {missionOpen && (
        <div className="sheet-backdrop" onClick={() => setMissionOpen(false)}>
          <div className="small-sheet mission-sheet" role="dialog" aria-modal="true" aria-labelledby="mission-title" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">Real-life mission</p>
            {mission ? (
              <>
                <h2 id="mission-title">At the {PLACES[mission.place].name.toLowerCase()}, say:</h2>
                <p className="mission__phrase">“{mission.target}”</p>
                <p className="fine">Missions completed: {profile.missionsDone}</p>
                <button
                  type="button"
                  className="btn btn--gold"
                  onClick={() => {
                    onMissionDone();
                    setMissionOpen(false);
                  }}
                >
                  I said it in real life (+20 coins)
                </button>
              </>
            ) : (
              <>
                <h2 id="mission-title">No mission yet</h2>
                <p>Finish a race and you'll get a phrase to try in real life.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
