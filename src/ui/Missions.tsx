import { useState } from 'react';
import { PLACES, cardById } from '../game/cards';
import { sayPhrase } from '../speech';
import type { Profile } from '../game/profile';
import { SpeakerIcon } from './kit';

type How = 'worked' | 'unclear' | 'nervous';

const HOW: { key: How; label: string; icon: string }[] = [
  { key: 'worked', label: 'It worked!', icon: '🙂' },
  { key: 'unclear', label: "They didn't understand me", icon: '😕' },
  { key: 'nervous', label: 'I was too nervous', icon: '😬' },
];

interface Props {
  profile: Profile;
  bangla: boolean;
  onMission: (how: How) => void;
}

/** Real-life missions: use a phrase in New York, then say how it went. */
export function Missions({ profile, bangla, onMission }: Props) {
  const [asking, setAsking] = useState(false);
  const [thanks, setThanks] = useState<How | null>(null);
  const mission = profile.mission ? cardById(profile.mission.cardId) : null;
  const log = profile.missionLog;

  return (
    <div className="screen tab-page">
      <header className="page-head">
        <h1 className="page-title">Missions</h1>
        <p className="page-sub">Say it in the real New York. That's where English sticks.</p>
      </header>

      {thanks && (
        <div className={`notice ${thanks === 'worked' ? 'is-good' : ''}`} role="status">
          {thanks === 'worked'
            ? '🎉 Great job! +20 coins. That phrase moves up a star.'
            : 'Thanks for trying! +10 coins. The phrase is back in your review, so you can practise it slowly.'}
        </div>
      )}

      {mission ? (
        <section className="mission-card">
          <span className="mission-card__art" aria-hidden="true">
            {PLACES[mission.place].icon}
          </span>
          <p className="eyebrow">Today's mission</p>
          <p className="mission-card__where">Next time you're at a {PLACES[mission.place].name.toLowerCase()}, say:</p>
          <p className="mission__phrase">“{mission.target}”</p>
          {bangla && (
            <p className="bn-line" lang="bn">
              {mission.bn}
            </p>
          )}
          <button type="button" className="pill-btn" onClick={() => sayPhrase(mission.id, mission.target, 'card', 0.9)}>
            <SpeakerIcon /> Hear it
          </button>
          {asking ? (
            <div className="how">
              <p className="how__q">How did it go?</p>
              {HOW.map((h) => (
                <button
                  key={h.key}
                  type="button"
                  className="setting"
                  onClick={() => {
                    onMission(h.key);
                    setAsking(false);
                    setThanks(h.key);
                  }}
                >
                  <span>
                    {h.icon} {h.label}
                  </span>
                  <span className="setting__state">{h.key === 'worked' ? '+20' : '+10'}</span>
                </button>
              ))}
              <p className="fine">Any answer is fine. Trying in real life is the win.</p>
            </div>
          ) : (
            <button type="button" className="btn btn--go btn--big" onClick={() => setAsking(true)}>
              I said it in real life
            </button>
          )}
        </section>
      ) : (
        <section className="empty">
          <span className="empty__art" aria-hidden="true">
            🎯
          </span>
          <p className="empty__title">No mission right now</p>
          <p className="fine">Finish a race and you'll get a phrase to try in real life.</p>
        </section>
      )}

      <section className="stat-tiles" aria-label="Your missions so far">
        <div>
          <span className="big">{log.worked}</span>
          <span>worked</span>
        </div>
        <div>
          <span className="big">{log.unclear}</span>
          <span>not understood</span>
        </div>
        <div>
          <span className="big">{log.nervous}</span>
          <span>too nervous</span>
        </div>
      </section>
    </div>
  );
}
