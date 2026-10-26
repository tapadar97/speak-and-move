import { useState } from 'react';
import { Art } from './kit';

interface Props {
  coins: number;
  sound: boolean;
  bangla: boolean;
  onPlay: () => void;
  onToggle: (k: 'sound' | 'bangla') => void;
}

export function Title({ coins, sound, bangla, onPlay, onToggle }: Props) {
  const [settings, setSettings] = useState(false);
  return (
    <div className="screen title-screen">
      <div className="sky-scene" aria-hidden="true">
        <div className="skyline" />
        <div className="street" />
      </div>

      <header className="topbar">
        <div className="coins" aria-label={`${coins} coins`}>
          <span className="coin" aria-hidden="true" />
          {coins}
        </div>
        <button type="button" className="icon-btn icon-btn--gold" onClick={() => setSettings(true)} aria-label="Settings">
          ⚙️
        </button>
      </header>

      <h1 className="logo" aria-label="Speak and Move">
        <span className="logo__speak">Speak</span>
        <span className="logo__move">
          <span className="logo__amp">&amp;</span>Move
        </span>
      </h1>

      <div className="title-hero">
        <Art name="hero-wave" fallback="🧔🏽‍♂️" className="title-hero__art" />
      </div>

      <div className="title-foot">
        <button type="button" className="btn btn--go btn--mega" onClick={onPlay}>
          PLAY
        </button>
        <p className="bn-line" lang="bn">
          চলো শুরু করি!
        </p>
      </div>

      {settings && (
        <div className="sheet-backdrop" onClick={() => setSettings(false)}>
          <div className="small-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="settings-title">Settings</h2>
            <button type="button" className={`setting ${sound ? 'is-on' : ''}`} onClick={() => onToggle('sound')} aria-pressed={sound}>
              <span>Voices and sound</span>
              <span className="setting__state">{sound ? 'On' : 'Off'}</span>
            </button>
            <button type="button" className={`setting ${bangla ? 'is-on' : ''}`} onClick={() => onToggle('bangla')} aria-pressed={bangla}>
              <span>
                Bangla hints <span lang="bn">(বাংলা)</span>
              </span>
              <span className="setting__state">{bangla ? 'On' : 'Off'}</span>
            </button>
            <button type="button" className="btn btn--blue" onClick={() => setSettings(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
