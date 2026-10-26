export type Tab = 'journey' | 'phrases' | 'progress' | 'missions';

interface Props {
  active: Tab;
  /** Missions waiting, shown as a badge. */
  missionBadge?: boolean;
  onTab: (t: Tab) => void;
  onPlay: () => void;
}

function Icon({ name }: { name: Tab }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'journey':
      return (
        <svg {...common}>
          <path d="M5 21V4" />
          <path d="M5 4h12l-2.5 4L17 12H5" fill="currentColor" />
        </svg>
      );
    case 'phrases':
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
          <path d="M8 7h6M8 11h6" />
        </svg>
      );
    case 'progress':
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <rect x="6" y="11" width="3" height="6" rx="1" />
          <rect x="11" y="7" width="3" height="10" rx="1" />
          <rect x="16" y="4" width="3" height="13" rx="1" />
        </svg>
      );
    case 'missions':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.5" fill="currentColor" />
        </svg>
      );
  }
}

const LABEL: Record<Tab, string> = { journey: 'Journey', phrases: 'Phrases', progress: 'Progress', missions: 'Missions' };

/** The app's bottom navigation, with the big round Play button in the middle. */
export function TabBar({ active, missionBadge = false, onTab, onPlay }: Props) {
  const tab = (t: Tab) => (
    <button
      key={t}
      type="button"
      className={`tabbar__item ${active === t ? 'is-on' : ''}`}
      onClick={() => onTab(t)}
      aria-current={active === t ? 'page' : undefined}
    >
      <span className="tabbar__icon">
        <Icon name={t} />
        {t === 'missions' && missionBadge && <span className="tabbar__badge" aria-label="1 mission" />}
      </span>
      <span className="tabbar__label">{LABEL[t]}</span>
    </button>
  );
  return (
    <nav className="tabbar" aria-label="Main">
      {tab('journey')}
      {tab('phrases')}
      <button type="button" className="tabbar__play" onClick={onPlay} aria-label="Play the next step">
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </button>
      {tab('progress')}
      {tab('missions')}
    </nav>
  );
}
