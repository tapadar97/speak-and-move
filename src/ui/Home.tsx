import { PLACES, cardById } from '../game/cards';
import type { Profile } from '../game/profile';
import { dueItems, nextDue } from '../game/review';

interface Props {
  profile: Profile;
  day: string;
  onPlay: () => void;
  onReview: () => void;
  onMissionDone: () => void;
  onToggle: (key: 'sound' | 'bangla') => void;
}

function friendlyDay(due: string, day: string): string {
  const diff = Math.round((Date.parse(due) - Date.parse(day)) / 86_400_000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return `in ${diff} days`;
}

export function Home({ profile, day, onPlay, onReview, onMissionDone, onToggle }: Props) {
  const due = dueItems(profile.review, day);
  const waiting = Object.keys(profile.review).length;
  const next = nextDue(profile.review);
  const mission = profile.mission ? cardById(profile.mission.cardId) : null;
  const pct = profile.attempts ? Math.round((profile.firstTry / profile.attempts) * 100) : null;

  return (
    <div className="screen home">
      <header className="home__head">
        <div className="coins" aria-label={`${profile.coins} coins`}>
          <span className="coin" aria-hidden="true" />
          {profile.coins}
        </div>
        <div className="row">
          <button
            type="button"
            className={`toggle ${profile.sound ? 'is-on' : ''}`}
            onClick={() => onToggle('sound')}
            aria-pressed={profile.sound}
          >
            Sound {profile.sound ? 'on' : 'off'}
          </button>
          <button
            type="button"
            className={`toggle ${profile.bangla ? 'is-on' : ''}`}
            onClick={() => onToggle('bangla')}
            aria-pressed={profile.bangla}
          >
            বাংলা {profile.bangla ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <div className="logo" aria-label="Speak and Move">
        <span className="logo__speak">Speak</span>
        <span className="logo__amp">&amp;</span>
        <span className="logo__move">Move</span>
      </div>
      <p className="tagline">Say it right. Move ahead. Beat Maya home.</p>

      <section className="level-card">
        <div className="level-card__art" aria-hidden="true">
          {(['deli', 'subway', 'pharmacy', 'laundromat', 'doctor', 'street'] as const).map((p) => (
            <span key={p}>{PLACES[p].icon}</span>
          ))}
        </div>
        <p className="level-card__eyebrow">Level 1</p>
        <h2>The Bodega Block</h2>
        <p className="level-card__sub">Deli, subway, pharmacy, laundromat, doctor, street</p>
        <button type="button" className="btn btn--go btn--big" onClick={onPlay}>
          Play vs Maya
        </button>
      </section>

      {mission && (
        <section className="mission">
          <p className="mission__eyebrow">Real-life mission</p>
          <p>
            Next time you're at a <strong>{PLACES[mission.place].name.toLowerCase()}</strong>, say:
          </p>
          <p className="mission__phrase">“{mission.target}”</p>
          <button type="button" className="btn btn--gold" onClick={onMissionDone}>
            I said it in real life (+20)
          </button>
        </section>
      )}

      <button type="button" className={`review-card ${due.length ? 'has-due' : ''}`} onClick={onReview} disabled={due.length === 0}>
        <span>
          <span className="review-card__title">Review deck</span>
          <span className="review-card__sub">
            {due.length > 0
              ? `${due.length} phrase${due.length > 1 ? 's' : ''} to practise now`
              : waiting > 0 && next
                ? `${waiting} phrase${waiting > 1 ? 's' : ''} waiting. Next ${friendlyDay(next, day)}.`
                : 'Phrases you miss come back here to practise.'}
          </span>
        </span>
        {due.length > 0 && <span className="review-card__count">{due.length}</span>}
      </button>

      <section className="progress">
        <div>
          <span className="big">{profile.games}</span>
          <span>games</span>
        </div>
        <div>
          <span className="big">{pct === null ? '–' : `${pct}%`}</span>
          <span>right first try</span>
        </div>
        <div>
          <span className="big">{profile.missionsDone}</span>
          <span>real-life missions</span>
        </div>
      </section>
    </div>
  );
}
