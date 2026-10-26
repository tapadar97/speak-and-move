import { PLACES, type Level, type WorldId } from '../game/cards';
import { HOME, START, cellOf, expressOf, placeAt, type Players } from '../game/board';
import { worldById } from '../game/worlds';
import { Art } from './kit';

interface Props {
  world: WorldId;
  players: Players;
  /** Squares to mark with the card level that lands there. */
  previews?: { square: number; level: Level }[];
  active: 'you' | 'bot';
}

const center = (sq: number) => {
  const { row, col } = cellOf(sq);
  return { x: col * (100 / 6) + 100 / 12, y: row * (100 / 6) + 100 / 12 };
};

export function BoardView({ world, players, previews = [], active }: Props) {
  const squares = Array.from({ length: HOME }, (_, i) => i + 1);
  const ex = expressOf(world);
  const w = worldById(world);
  const same = players.you === players.bot;

  return (
    <div
      className="board"
      role="img"
      aria-label={`${w.name} board. You are on square ${players.you}, Maya is on square ${players.bot}. Home is square ${HOME}.`}
    >
      <div className="board__center">
        <Art name={w.art} fallback={w.icon} className="board__city" />
      </div>

      {squares.map((sq) => {
        const { row, col } = cellOf(sq);
        const place = placeAt(world, sq);
        const kind = sq === START ? 'start' : sq === HOME ? 'home' : place!;
        const marks = previews.filter((p) => p.square === sq);
        return (
          <div key={sq} className={`sq sq--${kind} ${marks.length ? 'is-preview' : ''}`} style={{ left: `${col * (100 / 6)}%`, top: `${row * (100 / 6)}%` }}>
            <span className="sq__num">{sq}</span>
            <span className="sq__icon" aria-hidden="true">
              {sq === START ? '⭐' : sq === HOME ? '🏠' : PLACES[place!].icon}
            </span>
            <span className="sq__label">{sq === START ? 'START' : sq === HOME ? 'HOME' : PLACES[place!].name}</span>
            {marks.length > 0 && (
              <span className="sq__marks">
                {marks.map((m) => (
                  <span key={m.level} className={`dot dot--${m.level}`}>
                    {m.level}
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}

      {/* Express rides curve over the inner city */}
      <svg className="board__express" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#ffd23f" />
          </marker>
        </defs>
        {Object.entries(ex).map(([from, to]) => {
          const a = center(Number(from));
          const b = center(Number(to));
          const mx = (a.x + b.x) / 2 + (50 - (a.x + b.x) / 2) * 0.5;
          const my = (a.y + b.y) / 2 + (50 - (a.y + b.y) / 2) * 0.5;
          return (
            <g key={from}>
              <path d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke="#7a4b00" strokeWidth="2.6" strokeLinecap="round" opacity="0.35" />
              <path
                d={`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`}
                fill="none"
                stroke="#ffd23f"
                strokeWidth="1.6"
                strokeDasharray="3 2"
                strokeLinecap="round"
                markerEnd="url(#arrow)"
              />
              <text x={mx} y={my - 1.5} textAnchor="middle" className="express-label">
                EXPRESS
              </text>
            </g>
          );
        })}
      </svg>

      {(['bot', 'you'] as const).map((who) => {
        const { row, col } = cellOf(players[who]);
        const nudge = same ? (who === 'you' ? -16 : 16) : 0;
        return (
          <div
            key={who}
            className={`pawn pawn--${who} ${active === who ? 'is-active' : ''}`}
            style={{ left: `${col * (100 / 6)}%`, top: `${row * (100 / 6)}%`, transform: `translateX(${nudge}%)` }}
            aria-hidden="true"
          >
            <span className="pawn__head" />
            <span className="pawn__body" />
          </div>
        );
      })}
    </div>
  );
}
