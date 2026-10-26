import { useEffect, useState } from 'react';
import type { BattleState } from '../game/bosses';
import { starsFor } from '../game/bosses';
import { CARDS, type WorldId } from '../game/cards';
import { scoreFirstDay } from '../game/firstday';
import { currentWorld, loadProfile, saveProfile, type Profile } from '../game/profile';
import { addMistake, dueItems, reviewed, today } from '../game/review';
import { STAT_FOR, grow, rankIndex, type Stats } from '../game/stats';
import { WORLDS } from '../game/worlds';
import { BossBattle } from './BossBattle';
import { CharacterCard } from './CharacterCard';
import { FirstDay } from './FirstDay';
import { Game, type RaceSummary } from './Game';
import { PlayerContext } from './kit';
import { MapScreen } from './MapScreen';
import { PickPlayer } from './PickPlayer';
import { Review } from './Review';
import { Title } from './Title';
import { Victory } from './Victory';

type Screen =
  | { name: 'title' }
  | { name: 'pick'; then: 'play' | 'title' }
  | { name: 'firstday' }
  | { name: 'card'; mode: 'result' | 'view' }
  | { name: 'map' }
  | { name: 'race'; world: WorldId; key: number }
  | { name: 'boss'; world: WorldId; key: number }
  | { name: 'victory'; world: WorldId; stars: number; firstClear: boolean; before: Stats | null; after: Stats | null }
  | { name: 'review'; ids: string[] };

/** A phrase you said right, to use in real life; any easy card of the world if none. */
function pickMission(world: WorldId, said: string[]): string {
  const pool = said.length ? said : CARDS.filter((c) => c.world === world && c.level === 1).map((c) => c.id);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const day = today();
  const rank = profile.stats ? rankIndex(profile.stats) : 0;

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name]);

  const update = (fn: (p: Profile) => Profile) => setProfile(fn);

  /** Remember your stats when you first enter a world, to show growth when you clear it. */
  const enter = (w: WorldId) =>
    update((p) =>
      p.worlds[w].startStats || !p.stats ? p : { ...p, worlds: { ...p.worlds, [w]: { ...p.worlds[w], startStats: p.stats } } },
    );

  const race = (w: WorldId) => {
    enter(w);
    setScreen({ name: 'race', world: w, key: Date.now() });
  };
  const boss = (w: WorldId) => {
    enter(w);
    setScreen({ name: 'boss', world: w, key: Date.now() });
  };

  return <PlayerContext.Provider value={profile.player ?? 'hero'}>{render()}</PlayerContext.Provider>;

  function render() {
    switch (screen.name) {
      case 'title':
        return (
          <Title
            coins={profile.coins}
            sound={profile.sound}
            bangla={profile.bangla}
            onPlay={() =>
              setScreen(!profile.player ? { name: 'pick', then: 'play' } : profile.stats ? { name: 'map' } : { name: 'firstday' })
            }
            onToggle={(k) => update((p) => ({ ...p, [k]: !p[k] }))}
            onChangePlayer={() => setScreen({ name: 'pick', then: 'title' })}
          />
        );

      case 'pick':
        return (
          <PickPlayer
            current={profile.player}
            name={profile.name}
            bangla={profile.bangla}
            onDone={(player, name) => {
              update((p) => ({ ...p, player, name }));
              setScreen(screen.then === 'title' ? { name: 'title' } : profile.stats ? { name: 'map' } : { name: 'firstday' });
            }}
            onBack={() => setScreen({ name: 'title' })}
          />
        );

      case 'firstday':
        return (
          <FirstDay
            sound={profile.sound}
            bangla={profile.bangla}
            onDone={(results) => {
              update((p) => ({ ...p, stats: scoreFirstDay(results), firstDayDate: day }));
              setScreen({ name: 'card', mode: 'result' });
            }}
            onExit={() => setScreen(profile.stats ? { name: 'map' } : { name: 'title' })}
          />
        );

      case 'card':
        return (
          <CharacterCard
            stats={profile.stats!}
            name={profile.name}
            mode={screen.mode}
            bangla={profile.bangla}
            outfits={profile.outfits}
            onStart={() => setScreen({ name: 'map' })}
            onRetake={screen.mode === 'view' ? () => setScreen({ name: 'firstday' }) : undefined}
          />
        );

      case 'map':
        return (
          <MapScreen
            profile={profile}
            rank={rank}
            current={currentWorld(profile, rank)}
            day={day}
            onRace={race}
            onBoss={boss}
            onCard={() => setScreen({ name: 'card', mode: 'view' })}
            onReview={() => setScreen({ name: 'review', ids: dueItems(profile.review, day).map((i) => i.cardId) })}
            onMissionDone={() => update((p) => ({ ...p, mission: null, missionsDone: p.missionsDone + 1, coins: p.coins + 20 }))}
            onTitle={() => setScreen({ name: 'title' })}
          />
        );

      case 'race': {
        const w = screen.world;
        return (
          <Game
            key={screen.key}
            world={w}
            stats={profile.stats}
            sound={profile.sound}
            bangla={profile.bangla}
            bossBeaten={profile.worlds[w].stars > 0}
            onCard={(card, right, firstTry) =>
              update((p) => ({
                ...p,
                attempts: p.attempts + 1,
                firstTry: p.firstTry + (firstTry ? 1 : 0),
                stats: right && p.stats ? grow(p.stats, STAT_FOR[card.type], firstTry) : p.stats,
                review: right ? p.review : addMistake(p.review, card.id, day),
              }))
            }
            onFinish={(s: RaceSummary) =>
              update((p) => ({
                ...p,
                coins: p.coins + s.coins,
                xp: p.xp + s.xp,
                mission: { cardId: pickMission(w, s.saidRight), given: day },
                worlds: s.won ? { ...p.worlds, [w]: { ...p.worlds[w], raceWins: p.worlds[w].raceWins + 1 } } : p.worlds,
              }))
            }
            onBoss={() => boss(w)}
            onRematch={() => race(w)}
            onExit={() => setScreen({ name: 'map' })}
          />
        );
      }

      case 'boss': {
        const w = screen.world;
        return (
          <BossBattle
            key={screen.key}
            world={w}
            sound={profile.sound}
            bangla={profile.bangla}
            onAnswer={(right, fast) =>
              update((p) => {
                if (!p.stats || !right) return p;
                let s = grow(p.stats, 'words', true);
                if (fast) s = grow(s, 'speed', true);
                return { ...p, stats: s };
              })
            }
            onWin={(b: BattleState) => {
              const stars = starsFor(b);
              const firstClear = profile.worlds[w].stars === 0;
              const reward = WORLDS[w - 1].reward!;
              const before = profile.worlds[w].startStats;
              const after = profile.stats;
              update((p) => ({
                ...p,
                coins: p.coins + (firstClear ? reward.coins : 0),
                xp: p.xp + (firstClear ? reward.xp : 50),
                outfits: firstClear && !p.outfits.includes(reward.outfit) ? [...p.outfits, reward.outfit] : p.outfits,
                worlds: { ...p.worlds, [w]: { ...p.worlds[w], stars: Math.max(p.worlds[w].stars, stars) } },
              }));
              setScreen({ name: 'victory', world: w, stars, firstClear, before, after });
            }}
            onExit={() => setScreen({ name: 'map' })}
          />
        );
      }

      case 'victory': {
        const w = screen.world;
        const next = (w + 1) as WorldId;
        return (
          <Victory
            world={w}
            stars={screen.stars}
            firstClear={screen.firstClear}
            before={screen.before}
            after={screen.after}
            missionCardId={profile.mission?.cardId ?? null}
            bangla={profile.bangla}
            onNext={() => race(next)}
            onHome={() => setScreen({ name: 'map' })}
          />
        );
      }

      case 'review':
        return (
          <Review
            ids={screen.ids}
            sound={profile.sound}
            bangla={profile.bangla}
            onResult={(id, right) => update((p) => ({ ...p, review: reviewed(p.review, id, right, day) }))}
            onExit={() => setScreen({ name: 'map' })}
          />
        );
    }
  }
}
