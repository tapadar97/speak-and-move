import { PLACES } from '../game/cards';
import { EXPRESS, HOME, cellOf, placeAt, type Players } from '../game/board';

interface Props {
  players: Players;
  /** Squares to glow: where each choice would land you. */
  previews?: { square: number; level: 1 | 2 | 3 }[];
  active: 'you' | 'bot';
}

const pct = (n: number) => `${n * 20}%`;

export function BoardView({ players, previews = [], active }: Props) {
  const squares = Array.from({ length: HOME + 1 }, (_, i) => i);
  const center = (sq: number) => {
    const { row, col } = cellOf(sq);
    return { x: col * 20 + 10, y: row * 20 + 10 };
  };
  const same = players.you === players.bot;

  return (
    <div className="board" role="img" aria-label={`Board. You are on square ${players.you}, Maya is on square ${players.bot}. Home is square ${HOME}.`}>
      {/* Path line behind the squares */}
      <svg className="board__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={squares.map((s) => `${center(s).x},${center(s).y}`).join(' ')}
          fill="none"
          stroke="rgba(28,35,64,0.18)"
          strokeWidth="3.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className="board__title" aria-hidden="true">
        <span className="board__level">Level 1</span>
        <span className="board__name">The Bodega Block</span>
        <span className="skyline" />
      </div>

      {squares.map((sq) => {
        const { row, col } = cellOf(sq);
        const place = placeAt(sq);
        const preview = previews.filter((p) => p.square === sq);
        const kind = sq === 0 ? 'start' : sq === HOME ? 'home' : place!;
        return (
          <div
            key={sq}
            className={`sq sq--${kind} ${preview.length ? 'is-preview' : ''}`}
            style={{ left: pct(col), top: pct(row) }}
          >
            <span className="sq__icon" aria-hidden="true">
              {sq === 0 ? '🏠' : sq === HOME ? '⭐' : PLACES[place!].icon}
            </span>
            <span className="sq__label">{sq === 0 ? 'Start' : sq === HOME ? 'Home' : PLACES[place!].name}</span>
            {EXPRESS[sq] !== undefined && <span className="sq__express">Express → {EXPRESS[sq]}</span>}
            {preview.length > 0 && (
              <span className="sq__preview">
                {preview.map((p) => (
                  <span key={p.level} className={`dot dot--${p.level}`}>
                    {p.level}
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}

      {(['bot', 'you'] as const).map((who) => {
        const { row, col } = cellOf(players[who]);
        const nudge = same ? (who === 'you' ? -14 : 14) : 0;
        return (
          <div
            key={who}
            className={`token token--${who} ${active === who ? 'is-active' : ''}`}
            style={{ left: pct(col), top: pct(row), transform: `translate(${nudge}%, 0)` }}
            aria-hidden="true"
          >
            <span className="token__body">{who === 'you' ? 'You' : 'M'}</span>
          </div>
        );
      })}
    </div>
  );
}
