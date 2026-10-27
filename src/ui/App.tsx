import { useEffect, useRef, useState } from 'react';
import type { BattleState } from '../game/bosses';
import { starsFor } from '../game/bosses';
import { CARDS, WORLD_IDS, type Card, type Level, type WorldId } from '../game/cards';
import { EXPERT, LADDER, ladderRank } from '../game/ladder';
import { MODE_STAT, afterAnswer, type Mode } from '../game/mastery';
import { scoreFirstDay } from '../game/firstday';
import { countGood, currentWorld, isUnlocked, loadProfile, saveProfile, type Profile } from '../game/profile';
import { addMistake, dueItems, reviewed, today } from '../game/review';
import { grow, rankIndex, type Stats } from '../game/stats';
import { WORLDS } from '../game/worlds';
import { BossBattle } from './BossBattle';
import { CharacterCard } from './CharacterCard';
import { FirstDay } from './FirstDay';
import { Game, type RaceSummary } from './Game';
import { PlayerContext } from './kit';
import { Journey } from './Journey';
import { Missions } from './Missions';
import { TabBar, type Tab } from './TabBar';
import { PhrasePack } from './PhrasePack';
import { Phrasebook } from './Phrasebook';
import { PickPlayer } from './PickPlayer';
import { Review } from './Review';
import { SettingsSheet } from './SettingsSheet';
import { Title } from './Title';
import { Victory } from './Victory';

type Screen =
  | { name: 'title' }
  | { name: 'pick'; then: 'play' | 'title' | 'progress' }
  | { name: 'firstday' }
  | { name: 'card'; mode: 'result' | 'view' }
  | { name: 'tab'; tab: Tab }
  | { name: 'race'; world: WorldId; key: number }
  | { name: 'boss'; world: WorldId; key: number; native?: boolean }
  | {
      name: 'victory';
      world: WorldId;
      native: boolean;
      rankUp: number | null;
      stars: number;
      firstClear: boolean;
      before: Stats | null;
      after: Stats | null;
    }
  | { name: 'review'; ids: string[]; title?: string; why?: string }
  | { name: 'pack'; world: WorldId; native?: boolean };

/** A phrase you said right, to use in real life; any easy card of the world if none. */
function pickMission(world: WorldId, said: string[]): string {
  const pool = said.length ? said : CARDS.filter((c) => c.world === world && c.level === 1).map((c) => c.id);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  // Returning players open straight on their journey; new players see the title screen.
  const [screen, setScreen] = useState<Screen>(() => (profile.player && profile.stats ? { name: 'tab', tab: 'journey' } : { name: 'title' }));
  const [settings, setSettings] = useState(false);
  const [goalToast, setGoalToast] = useState(false);
  const day = today();
  const rank = profile.stats ? rankIndex(profile.stats) : 0;
  const home: Screen = profile.stats ? { name: 'tab', tab: 'journey' } : { name: 'title' };
  const isHome = screen.name === 'title' || (screen.name === 'tab' && screen.tab === 'journey');
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const homeRef = useRef(home);
  homeRef.current = home;

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name]);

  // Celebrate the moment today's goal is met (the 30 coins are added in goodAnswer).
  const goalMet = profile.goalDays.includes(day);
  const wasMet = useRef(goalMet);
  useEffect(() => {
    if (goalMet && !wasMet.current) {
      setGoalToast(true);
      const t = window.setTimeout(() => setGoalToast(false), 3500);
      wasMet.current = true;
      return () => window.clearTimeout(t);
    }
    wasMet.current = goalMet;
  }, [goalMet]);

  // The phone's back button: leave a screen instead of closing the game.
  // In a race or boss fight it asks first, like the in-game ← button.
  useEffect(() => {
    if (!isHome && history.state?.sm !== 1) history.pushState({ sm: 1 }, '');
  }, [isHome]);
  useEffect(() => {
    const onPop = () => {
      const s = screenRef.current;
      setSettings(false);
      if (s.name === 'race' || s.name === 'boss') {
        history.pushState({ sm: 1 }, '');
        window.dispatchEvent(new Event('sm-back'));
      } else {
        setScreen(homeRef.current);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = (fn: (p: Profile) => Profile) => setProfile(fn);

  /** A good (first-try) answer counts toward the daily goal; meeting it pays 30 coins. */
  const goodAnswer = (p: Profile): Profile => {
    const g = countGood(p, day);
    return { ...p, daily: g.daily, streak: g.streak, goalDays: g.goalDays, coins: p.coins + (g.goalJustMet ? 30 : 0) };
  };

  /** One answered card anywhere: mastery, stats, review deck and daily goal. Typing never grows Voice. */
  const answered = (p: Profile, card: Card, mode: Mode, right: boolean, firstTry: boolean, typed = false): Profile => {
    const stat = MODE_STAT[mode];
    let next: Profile = {
      ...p,
      mastery: afterAnswer(p.mastery, card.id, right, firstTry),
      stats: right && p.stats && !(typed && stat === 'voice') ? grow(p.stats, stat, firstTry) : p.stats,
      review: right ? p.review : addMistake(p.review, card.id, day),
    };
    if (firstTry) next = goodAnswer(next);
    return next;
  };

  /** The ▶ button, same as the Journey's "Up next": learn → race → boss, then review if due, else race again. */
  const playNext = () => {
    const w = currentWorld(profile, rank);
    const due = dueItems(profile.review, day);
    if (!profile.packDone[w]) setScreen({ name: 'pack', world: w });
    else if (profile.worlds[w].raceWins === 0) race(w);
    else if (profile.worlds[w].stars === 0) boss(w);
    else if (profile.worlds[w].nativeStars === 0) native(w);
    else if (due.length) setScreen({ name: 'review', ids: due.map((i) => i.cardId) });
    else race(w);
  };

  const withTabs = (tab: Tab, page: React.ReactNode) => (
    <>
      {page}
      <TabBar active={tab} missionBadge={!!profile.mission} onTab={(t) => setScreen({ name: 'tab', tab: t })} onPlay={playNext} />
    </>
  );

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
  /** The Native round: learn its slang pack once, then fight. */
  const native = (w: WorldId) =>
    setScreen(profile.nativePackDone[w] ? { name: 'boss', world: w, key: Date.now(), native: true } : { name: 'pack', world: w, native: true });

  return (
    <PlayerContext.Provider value={profile.player ?? 'hero'}>
      {render()}
      {settings && (
        <SettingsSheet
          sound={profile.sound}
          bangla={profile.bangla}
          onToggle={(k) => update((p) => ({ ...p, [k]: !p[k] }))}
          onChangePlayer={() => {
            setSettings(false);
            setScreen({ name: 'pick', then: 'progress' });
          }}
          onClose={() => setSettings(false)}
        />
      )}
      {goalToast && (
        <div className="goal-toast" role="status" onClick={() => setGoalToast(false)}>
          <span aria-hidden="true">🎉</span>
          <span>
            <b>Daily goal done!</b> +30 coins. Your streak is safe today.
          </span>
        </div>
      )}
    </PlayerContext.Provider>
  );

  function render() {
    switch (screen.name) {
      case 'title':
        return (
          <Title
            coins={profile.coins}
            sound={profile.sound}
            bangla={profile.bangla}
            onPlay={() =>
              setScreen(!profile.player ? { name: 'pick', then: 'play' } : profile.stats ? { name: 'tab', tab: 'journey' } : { name: 'firstday' })
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
              setScreen(
                screen.then === 'title'
                  ? { name: 'title' }
                  : screen.then === 'progress'
                    ? { name: 'tab', tab: 'progress' }
                    : profile.stats
                      ? { name: 'tab', tab: 'journey' }
                      : { name: 'firstday' },
              );
            }}
            onBack={() => setScreen(screen.then === 'progress' ? { name: 'tab', tab: 'progress' } : { name: 'title' })}
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
            onExit={() => setScreen(profile.stats ? { name: 'tab', tab: 'journey' } : { name: 'title' })}
          />
        );

      case 'card':
        return (
          <CharacterCard
            stats={profile.stats!}
            profile={profile}
            ladder={ladderRank(profile)}
            before={profile.prevStats}
            name={profile.name}
            mode={screen.mode}
            bangla={profile.bangla}
            outfits={profile.outfits}
            onStart={() => setScreen({ name: 'tab', tab: 'journey' })}
            onRetake={screen.mode === 'view' ? () => setScreen({ name: 'firstday' }) : undefined}
          />
        );

      case 'tab': {
        if (screen.tab === 'journey') {
          return withTabs(
            'journey',
            <Journey
              profile={profile}
              rank={rank}
              current={currentWorld(profile, rank)}
              day={day}
              onLearn={(w) => setScreen({ name: 'pack', world: w })}
              onRace={race}
              onBoss={boss}
              onNative={native}
              onReview={() => setScreen({ name: 'review', ids: dueItems(profile.review, day).map((i) => i.cardId) })}
              onRecheck={() => setScreen({ name: 'firstday' })}
              onProfile={() => setScreen({ name: 'tab', tab: 'progress' })}
            />,
          );
        }
        if (screen.tab === 'phrases') {
          return withTabs(
            'phrases',
            <Phrasebook
              mastery={profile.mastery}
              worlds={WORLD_IDS.filter((w) => isUnlocked(profile, w, rank))}
              bangla={profile.bangla}
              startWorld={currentWorld(profile, rank)}
              onPractise={(ids) => setScreen({ name: 'review', ids, title: 'Practice', why: 'Get it right first time to move it up a star.' })}
            />,
          );
        }
        if (screen.tab === 'progress') {
          return withTabs(
            'progress',
            <CharacterCard
              stats={profile.stats!}
              profile={profile}
              ladder={ladderRank(profile)}
              before={profile.prevStats}
              name={profile.name}
              mode="view"
              inTab
              bangla={profile.bangla}
              outfits={profile.outfits}
              onStart={() => setScreen({ name: 'tab', tab: 'journey' })}
              onRetake={() => setScreen({ name: 'firstday' })}
              onSettings={() => setSettings(true)}
            />,
          );
        }
        return withTabs(
          'missions',
          <Missions
            profile={profile}
            bangla={profile.bangla}
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
          />,
        );
      }

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
            onCard={(card, mode, right, firstTry, typed) =>
              update((p) => ({
                ...answered(p, card, mode, right, firstTry, typed),
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
            onExit={() => setScreen({ name: 'tab', tab: 'journey' })}
          />
        );
      }

      case 'boss': {
        const w = screen.world;
        const isNative = !!screen.native;
        return (
          <BossBattle
            key={screen.key}
            world={w}
            native={isNative}
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
              const key = isNative ? 'nativeStars' : 'stars';
              const firstClear = profile.worlds[w][key] === 0;
              const reward = isNative ? WORLDS[w - 1].nativeReward! : WORLDS[w - 1].reward!;
              const before = profile.worlds[w].startStats;
              const after = profile.stats;
              const won = (p: Profile): Profile => ({
                ...p,
                coins: p.coins + (firstClear ? reward.coins : 0),
                xp: p.xp + (firstClear ? reward.xp : 50),
                outfits: firstClear && !p.outfits.includes(reward.outfit) ? [...p.outfits, reward.outfit] : p.outfits,
                worlds: { ...p.worlds, [w]: { ...p.worlds[w], [key]: Math.max(p.worlds[w][key], stars) } },
              });
              const oldRank = ladderRank(profile);
              const newRank = ladderRank(won(profile));
              update(won);
              setScreen({ name: 'victory', world: w, native: isNative, rankUp: newRank > oldRank ? newRank : null, stars, firstClear, before, after });
            }}
            onExit={() => setScreen({ name: 'tab', tab: 'journey' })}
          />
        );
      }

      case 'victory': {
        const w = screen.world;
        const next = (w + 1) as WorldId;
        return (
          <Victory
            world={w}
            native={screen.native}
            rankUp={screen.rankUp === null ? null : LADDER[screen.rankUp]}
            expert={screen.rankUp === EXPERT}
            stars={screen.stars}
            firstClear={screen.firstClear}
            before={screen.before}
            after={screen.after}
            missionCardId={profile.mission?.cardId ?? null}
            bangla={profile.bangla}
            onNext={() => (profile.packDone[next] ? race(next) : setScreen({ name: 'pack', world: next }))}
            onNative={() => native(w)}
            onHome={() => setScreen({ name: 'tab', tab: 'journey' })}
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
            onResult={(card, mode, right, firstTry, typed) =>
              update((p) => {
                const next = answered(p, card, mode, right, firstTry, typed);
                // A phrase already in the review deck moves along its 1/3/7-day schedule.
                return p.review[card.id] ? { ...next, review: reviewed(p.review, card.id, firstTry, day) } : next;
              })
            }
            onExit={() => setScreen(screen.title === 'Practice' ? { name: 'tab', tab: 'phrases' } : { name: 'tab', tab: 'journey' })}
          />
        );

      case 'pack':
        return (
          <PhrasePack
            key={`${screen.world}-${screen.native ? 'n' : 'p'}`}
            world={screen.world}
            native={screen.native}
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
              if (screen.native) {
                update((p) => ({ ...p, nativePackDone: { ...p.nativePackDone, [w]: true } }));
                setScreen({ name: 'boss', world: w, key: Date.now(), native: true });
                return;
              }
              update((p) => ({ ...p, packDone: { ...p.packDone, [w]: true } }));
              race(w);
            }}
            onExit={() => setScreen({ name: 'tab', tab: 'journey' })}
          />
        );

    }
  }
}
