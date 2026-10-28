export type Tab = 'journey' | 'phrases' | 'progress' | 'missions';

interface Props {
  active: Tab;
  /** Missions waiting, shown as a badge. */
  missionBadge?: boolean;
  onTab: (t: Tab) => void;
}

function Icon({ name }: { name: Tab }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'journey':
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2h-3v-6H9v6H6a2 2 0 0 1-2-2z" fill="currentColor" />
        </svg>
      );
    case 'missions':
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
        </svg>
      );
    case 'phrases':
      return (
        <svg {...common}>
          <path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z" />
          <path d="M12 6v13.5" />
        </svg>
      );
    case 'progress':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
  }
}

const LABEL: Record<Tab, string> = { journey: 'Learn', missions: 'Talk', phrases: 'Phrases', progress: 'Me' };

/** The app's bottom navigation: Learn, Talk (real-life missions), Phrases and Me. */
export function TabBar({ active, missionBadge = false, onTab }: Props) {
  return (
    <nav className="tabbar" aria-label="Main">
      {(['journey', 'missions', 'phrases', 'progress'] as Tab[]).map((t) => (
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
      ))}
    </nav>
  );
}
