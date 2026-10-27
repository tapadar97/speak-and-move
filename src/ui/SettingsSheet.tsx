interface Props {
  sound: boolean;
  bangla: boolean;
  onToggle: (k: 'sound' | 'bangla') => void;
  onChangePlayer: () => void;
  onClose: () => void;
}

/** Sound, Bangla hints and player choice, opened from the title screen or the Progress tab. */
export function SettingsSheet({ sound, bangla, onToggle, onChangePlayer, onClose }: Props) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
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
        <button type="button" className="setting" onClick={onChangePlayer}>
          <span>Change player or name</span>
          <span className="setting__state">›</span>
        </button>
        <button type="button" className="btn btn--blue" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
