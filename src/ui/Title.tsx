import { useEffect, useState } from 'react';
import { loadManifest } from '../speech';
import { PlayerArt } from './kit';
import { SettingsSheet } from './SettingsSheet';

interface Props {
  coins: number;
  sound: boolean;
  bangla: boolean;
  onPlay: () => void;
  onToggle: (k: 'sound' | 'bangla') => void;
  onChangePlayer: () => void;
}

export function Title({ coins, sound, bangla, onPlay, onToggle, onChangePlayer }: Props) {
  const [settings, setSettings] = useState(false);
  const [voiced, setVoiced] = useState(false);

  useEffect(() => {
    loadManifest().then((m) => setVoiced(!!m));
  }, []);
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
        <PlayerArt pose="wave" className="title-hero__art" />
      </div>

      <div className="title-foot">
        <button type="button" className="btn btn--go btn--mega" onClick={onPlay}>
          PLAY
        </button>
        <p className="bn-line" lang="bn">
          চলো শুরু করি!
        </p>
        {voiced && (
          <p className="credit">
            Voices by{' '}
            <a href="https://elevenlabs.io" target="_blank" rel="noreferrer">
              ElevenLabs
            </a>
          </p>
        )}
      </div>

      {settings && (
        <SettingsSheet sound={sound} bangla={bangla} onToggle={onToggle} onChangePlayer={onChangePlayer} onClose={() => setSettings(false)} />
      )}
    </div>
  );
}
