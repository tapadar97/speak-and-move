import { useEffect, useState } from 'react';
import { CARDS } from '../game/cards';
import { loadProfile, saveProfile, type Profile } from '../game/profile';
import { addMistake, dueItems, reviewed, today } from '../game/review';
import { Game, type GameSummary } from './Game';
import { Home } from './Home';
import { Review } from './Review';

type Screen = { name: 'home' } | { name: 'game'; key: number } | { name: 'review'; ids: string[] };

/** A phrase you said right in this game, to use in real life; any card if none. */
function pickMission(s: GameSummary): string {
  const pool = s.saidRight.length ? s.saidRight : CARDS.filter((c) => c.level === 1).map((c) => c.id);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const day = today();

  useEffect(() => saveProfile(profile), [profile]);

  if (screen.name === 'game') {
    return (
      <Game
        key={screen.key}
        sound={profile.sound}
        bangla={profile.bangla}
        onMistake={(id) => setProfile((p) => ({ ...p, review: addMistake(p.review, id, day) }))}
        onFinish={(s) =>
          setProfile((p) => ({
            ...p,
            games: p.games + 1,
            wins: p.wins + (s.won ? 1 : 0),
            attempts: p.attempts + s.attempts,
            firstTry: p.firstTry + s.firstTry,
            coins: p.coins + s.coins,
            mission: { cardId: pickMission(s), given: day },
          }))
        }
        onExit={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'review') {
    return (
      <Review
        ids={screen.ids}
        sound={profile.sound}
        bangla={profile.bangla}
        onResult={(id, right) => setProfile((p) => ({ ...p, review: reviewed(p.review, id, right, day) }))}
        onExit={() => setScreen({ name: 'home' })}
      />
    );
  }

  return (
    <Home
      profile={profile}
      day={day}
      onPlay={() => setScreen({ name: 'game', key: Date.now() })}
      onReview={() => setScreen({ name: 'review', ids: dueItems(profile.review, day).map((i) => i.cardId) })}
      onMissionDone={() =>
        setProfile((p) => ({ ...p, mission: null, missionsDone: p.missionsDone + 1, coins: p.coins + 20 }))
      }
      onToggle={(k) => setProfile((p) => ({ ...p, [k]: !p[k] }))}
    />
  );
}
