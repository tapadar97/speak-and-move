import { useEffect, useState } from 'react';
import type { BattleState } from '../game/bosses';
import { starsFor } from '../game/bosses';
import { CARDS, type Card, type Level, type WorldId } from '../game/cards';
import { MODE_STAT, afterAnswer, type Mode } from '../game/mastery';
import { scoreFirstDay } from '../game/firstday';
import { countGood, currentWorld, loadProfile, saveProfile, type Profile } from '../game/profile';
import { addMistake, dueItems, reviewed, today } from '../game/review';
import { grow, rankIndex, type Stats } from '../game/stats';
import { WORLDS } from '../game/worlds';
import { BossBattle } from './BossBattle';
import { CharacterCard } from './CharacterCard';
import { FirstDay } from './FirstDay';
import { Game, type RaceSummary } from './Game';
import { PlayerContext } from './kit';
import { MapScreen } from './MapScreen';
import { PhrasePack } from './PhrasePack';
import { Phrasebook } from './Phrasebook';
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
  | { name: 'review'; ids: string[]; title?: string; why?: string }
  | { name: 'pack'; world: WorldId }
  | { name: 'book' };

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

  /** A good (first-try) answer counts toward the daily goal; meeting it pays 30 coins. */
  const goodAnswer = (p: Profile): Profile => {
    const g = countGood(p, day);
    return { ...p, daily: g.daily, streak: g.streak, coins: p.coins + (g.goalJustMet ? 30 : 0) };
  };

  /** One answered card anywhere: mastery, stats, review deck and daily goal. */
  const answered = (p: Profile, card: Card, mode: Mode, right: boolean, firstTry: boolean): Profile => {
    let next: Profile = {
      ...p,
      mastery: afterAnswer(p.mastery, card.id, right, firstTry),
      stats: right && p.stats ? grow(p.stats, MODE_STAT[mode], firstTry) : p.stats,
      review: right ? p.review : addMistake(p.review, card.id, day),
    };
    if (firstTry) next = goodAnswer(next);
    return next;
  };

  /** The card level matched to your rank, marked "Your level" in races. */
  const yourLevel: Level = rank <= 0 ? 1 : rank <= 2 ? 2 : 3;

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
              update((p) => ({ ...p, prevStats: p.stats ?? p.prevStats, stats: scoreFirstDay(results), firstDayDate: day }));
              setScreen({ name: 'card', mode: 'result' });
            }}
            onExit={() => setScreen(profile.stats ? { name: 'map' } : { name: 'title' })}
          />
        );

      case 'card':
        return (
          <CharacterCard
            stats={profile.stats!}
            before={profile.prevStats}
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
            onBook={() => setScreen({ name: 'book' })}
            onLearn={(w) => setScreen({ name: 'pack', world: w })}
            onRecheck={() => setScreen({ name: 'firstday' })}
            onMission={(how) =>
              update((p) => {
                const id = p.mission!.cardId;
                const worked = how === 'worked';
                return {
                  ...p,
                  mission: null,
                  missionsDone: p.missionsDone + 1,
                  missionLog: { ...p.missionLog, [how]: p.missionLog[how] + 1 },
                  coins: p.coins + (worked ? 20 : 10),
                  // Real-life success counts as mastery; a hard time sends it back to practice.
                  mastery: afterAnswer(p.mastery, id, worked, worked),
                  review: worked ? p.review : addMistake(p.review, id, day),
                };
              })
            }
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
            mastery={profile.mastery}
            yourLevel={yourLevel}
            sound={profile.sound}
            bangla={profile.bangla}
            bossBeaten={profile.worlds[w].stars > 0}
            onCard={(card, mode, right, firstTry) =>
              update((p) => ({
                ...answered(p, card, mode, right, firstTry),
                attempts: p.attempts + 1,
                firstTry: p.firstTry + (firstTry ? 1 : 0),
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
                return goodAnswer({ ...p, stats: s });
              })
            }
            onWin={(b: BattleState, hintsUsed: number) => {
              const stars = starsFor(b, hintsUsed);
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
            onNext={() => (profile.packDone[next] ? race(next) : setScreen({ name: 'pack', world: next }))}
            onHome={() => setScreen({ name: 'map' })}
          />
        );
      }

      case 'review':
        return (
          <Review
            ids={screen.ids}
            mastery={profile.mastery}
            sound={profile.sound}
            bangla={profile.bangla}
            title={screen.title}
            why={screen.why}
            onResult={(card, mode, right, firstTry) =>
              update((p) => {
                const next = answered(p, card, mode, right, firstTry);
                // A phrase already in the review deck moves along its 1/3/7-day schedule.
                return p.review[card.id] ? { ...next, review: reviewed(p.review, card.id, firstTry, day) } : next;
              })
            }
            onExit={() => setScreen(screen.title === 'Practice' ? { name: 'book' } : { name: 'map' })}
          />
        );

      case 'pack':
        return (
          <PhrasePack
            key={screen.world}
            world={screen.world}
            sound={profile.sound}
            bangla={profile.bangla}
            onPhrase={(id, right) =>
              update((p) => {
                // Learning a phrase moves it to "Seen"; never lowers mastery you already have.
                const mastery = right ? { ...p.mastery, [id]: Math.max(p.mastery[id] ?? 0, 1) } : p.mastery;
                return right ? goodAnswer({ ...p, mastery }) : p;
              })
            }
            onDone={() => {
              const w = screen.world;
              update((p) => ({ ...p, packDone: { ...p.packDone, [w]: true } }));
              race(w);
            }}
            onExit={() => setScreen({ name: 'map' })}
          />
        );

      case 'book':
        return (
          <Phrasebook
            mastery={profile.mastery}
            bangla={profile.bangla}
            startWorld={currentWorld(profile, rank)}
            onPractise={(ids) =>
              setScreen({ name: 'review', ids, title: 'Practice', why: 'Get it right first time to move it up a star.' })
            }
            onExit={() => setScreen({ name: 'map' })}
          />
        );
    }
  }
}
