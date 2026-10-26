import { useEffect, useRef, useState } from 'react';
import type { Level } from '../game/cards';
import {
  SCENES,
  exampleOf,
  nextLevel,
  talkCounts,
  type SceneResult,
} from '../game/firstday';
import { matchSpeech } from '../game/match';
import { sayPhrase, stopSpeaking } from '../speech';
import { Art, SpeakInput, SpeakerIcon, TalkInput, buzz, type TalkResult, PlayerArt } from './kit';

interface Props {
  sound: boolean;
  bangla: boolean;
  onDone: (results: SceneResult[]) => void;
  onExit: () => void;
}

type Phase = 'intro' | 'scene' | 'feedback';

export function FirstDay({ sound, bangla, onDone, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState<Level>(2);
  const [results, setResults] = useState<SceneResult[]>([]);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const questionEnded = useRef(0);

  const scene = SCENES[index];
  const variant = scene.task === 'talk' ? scene.variants[0] : scene.variants[level - 1];
  const audioId = `fd-${scene.id}-${scene.task === 'talk' ? 1 : level}`;

  const playLine = async (rate = 1) => {
    setSpeaking(true);
    if (sound) await sayPhrase(audioId, variant.line, 'card', rate);
    setSpeaking(false);
    questionEnded.current = Date.now();
  };

  // Each character speaks when their scene starts.
  useEffect(() => {
    if (phase !== 'scene') return;
    questionEnded.current = Date.now();
    playLine();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  const record = (r: SceneResult) => {
    const all = [...results, r];
    setResults(all);
    const good = r.pass;
    setFeedback({
      good,
      text: good ? ['Nice!', 'Great!', 'You got it!'][index % 3] : 'Good try! Moving on.',
    });
    buzz(good ? 30 : 15);
    setPhase('feedback');
    window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= SCENES.length) {
        onDone(all);
        return;
      }
      if (scene.task !== 'talk') setLevel((l) => nextLevel(l, r.pass));
      setIndex((i) => i + 1);
      setPhase('scene');
    }, 1300);
  };

  const answered = (alts: string[]) => {
    if (phase !== 'scene') return;
    const m = matchSpeech(variant.target!, variant.accept, alts, level, scene.task === 'fix');
    record({ sceneId: scene.id, level, pass: m.pass, score: m.score, ms: Date.now() - questionEnded.current });
  };

  const talked = (t: TalkResult) => {
    const { words, unique } = talkCounts(t.text);
    record({
      sceneId: scene.id,
      level: 1,
      pass: words >= 8,
      score: Math.min(1, words / 40),
      words,
      unique,
      wpm: t.seconds ? (words / t.seconds) * 60 : null,
    });
  };

  const skip = () => record({ sceneId: scene.id, level, pass: false, score: 0, ms: 20_000, words: 0, unique: 0, wpm: null });

  if (phase === 'intro') {
    return (
      <div className="screen firstday firstday--intro">
        <div className="sky-scene" aria-hidden="true">
          <div className="skyline" />
          <div className="street" />
        </div>
        <div className="intro-card">
          <p className="eyebrow">Welcome</p>
          <h1 className="display">Your First Day in New York</h1>
          <p>Six quick scenes. Just talk like you would in real life. The game finds your level and builds your player card.</p>
          <p className="bn-line" lang="bn">
            ছয়টা ছোট দৃশ্য। স্বাভাবিকভাবে কথা বলুন। গেম আপনার লেভেল খুঁজে নেবে।
          </p>
          <div className="scene-icons scene-icons--intro" aria-hidden="true">
            {SCENES.map((s) => (
              <span key={s.id}>{s.icon}</span>
            ))}
          </div>
          <button type="button" className="btn btn--go btn--big" onClick={() => setPhase('scene')}>
            Let's go
          </button>
          <button type="button" className="link-btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const showLineText = scene.task !== 'repeat';

  return (
    <div className={`screen firstday scene--${scene.id}`}>
      <div className="sky-scene" aria-hidden="true">
        <div className="skyline" />
        <div className="street" />
      </div>

      <div className="scene-bar">
        <p className="scene-bar__title">
          Scene {index + 1} of {SCENES.length}
        </p>
        <ol className="scene-icons" aria-label="Scenes">
          {SCENES.map((s, i) => (
            <li key={s.id} className={i === index ? 'is-now' : i < index ? 'is-done' : ''} aria-current={i === index ? 'step' : undefined}>
              <span aria-hidden="true">{s.icon}</span>
              <span className="sr-only">{s.who}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="stage">
        <Art name={scene.art} fallback={scene.icon} className="stage__char" />
        <div className="bubble">
          <p className="bubble__who">{scene.who}</p>
          <p className="bubble__line">{showLineText ? variant.line : speaking ? '🔊 …' : '🔊 Listen carefully'}</p>
        </div>
        <button type="button" className="pill-btn" onClick={() => playLine(1)} disabled={!sound}>
          <SpeakerIcon /> Hear again
        </button>
        {scene.task === 'repeat' && (
          <button type="button" className="pill-btn pill-btn--soft" onClick={() => playLine(0.65)} disabled={!sound}>
            Slow
          </button>
        )}
      </div>

      <section className="task-panel">
        <p className="task-panel__ask">{scene.ask}</p>
        {bangla && (
          <p className="task-panel__bn" lang="bn">
            {scene.askBn}
          </p>
        )}

        {scene.task === 'read' && (
          <div className="hint-card">
            <span className="hint-card__label">Say:</span> “{variant.target}”
          </div>
        )}
        {scene.task === 'reply' && (
          <div className="hint-card">
            <span className="hint-card__label">Hint:</span> try “{exampleOf(variant.target)}”
          </div>
        )}
        {scene.task === 'fix' && <p className="phrase phrase--wrong">{variant.prompt}</p>}
        {scene.task === 'recall' && (
          <p className="phrase phrase--bn" lang="bn">
            {variant.prompt}
          </p>
        )}

        {phase === 'feedback' && feedback ? (
          <div className={`feedback-chip ${feedback.good ? 'is-good' : ''}`} role="status">
            {feedback.good ? '✓ ' : ''}
            {feedback.text}
          </div>
        ) : scene.task === 'talk' ? (
          <TalkInput key={index} onDone={talked} />
        ) : (
          <SpeakInput key={`${index}-${level}`} onAnswer={answered} idleLabel="Tap and answer" />
        )}

        {phase === 'scene' && (
          <button type="button" className="link-btn link-btn--light skip" onClick={skip}>
            I can't answer this one
          </button>
        )}
      </section>

      <div className="me-avatar" aria-hidden="true">
        <PlayerArt pose="avatar" />
      </div>
    </div>
  );
}
