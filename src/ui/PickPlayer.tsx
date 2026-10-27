import { useState } from 'react';
import type { PlayerChoice } from '../game/profile';
import { PLAYERS, PlayerArt } from './kit';

interface Props {
  current: PlayerChoice | null;
  name: string;
  bangla: boolean;
  onDone: (player: PlayerChoice, name: string) => void;
  onBack: () => void;
}

const CHOICES: PlayerChoice[] = ['hero', 'girl'];

/** Pick who you play as, and what the game calls you. */
export function PickPlayer({ current, name: initialName, bangla, onDone, onBack }: Props) {
  const [picked, setPicked] = useState<PlayerChoice | null>(current);
  const [name, setName] = useState(initialName);

  return (
    <div className="screen pick-screen">
      <div className="sky-scene" aria-hidden="true">
        <div className="skyline" />
        <div className="street" />
      </div>

      <header className="pick-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div>
          <h1 className="display">Pick your player</h1>
          {bangla && (
            <p className="bn-line" lang="bn">
              আপনার খেলোয়াড় বেছে নিন
            </p>
          )}
        </div>
      </header>

      <div className="pick-grid" role="radiogroup" aria-label="Your character">
        {CHOICES.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={picked === p}
            aria-label={PLAYERS[p].label}
            className={`pick-card ${picked === p ? 'is-on' : ''}`}
            onClick={() => setPicked(p)}
          >
            <PlayerArt pose="wave" who={p} className="pick-card__art" />
            <span className="pick-card__label">{PLAYERS[p].label}</span>
            {picked === p && (
              <span className="pick-card__check" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      <label className="name-field" htmlFor="player-name">
        <span>Your name (optional)</span>
        <input
          id="player-name"
          value={name}
          maxLength={14}
          onChange={(e) => setName(e.target.value)}
          placeholder="YOU"
          autoComplete="given-name"
        />
      </label>

      <button
        type="button"
        className="btn btn--go btn--big"
        disabled={!picked}
        onClick={() => picked && onDone(picked, name.trim().slice(0, 14))}
      >
        {picked ? "Let's go" : 'Tap a player first'}
      </button>
    </div>
  );
}
