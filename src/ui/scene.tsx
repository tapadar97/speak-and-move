/** The speech-bubble buddies and the small New York scenes of the v4 look, drawn as inline SVG. */

const NAVY = '#22305a';

export type Mood = 'calm' | 'happy' | 'wink' | 'dots';

interface BuddyProps {
  color?: string;
  mood?: Mood;
  cap?: string | null;
  /** A raised fist, for cheering. */
  fist?: boolean;
  /** Little "pop" lines by the head. */
  sparks?: boolean;
  /** Which way the bubble's tail points. */
  tail?: 'left' | 'right';
}

/** A buddy as an SVG group in a 120×120 box; place it with a transform. */
export function BuddyG({ color = '#ff7a1a', mood = 'calm', cap = NAVY, fist = false, sparks = false, tail = 'left' }: BuddyProps) {
  const face = {
    calm: (
      <>
        <path d="M44 66q6-6 12 0M66 66q6-6 12 0" stroke={NAVY} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M52 78q9 8 18 0" stroke={NAVY} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    ),
    happy: (
      <>
        <path d="M43 66q6-8 12 0M67 66q6-8 12 0" stroke={NAVY} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M49 76h24q-2 14-12 14t-12-14z" fill={NAVY} />
        <path d="M54 85q7-5 14 0q-3 5-7 5t-7-5z" fill="#ff5a5a" />
      </>
    ),
    wink: (
      <>
        <path d="M44 60l10 5-10 5" stroke={NAVY} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="74" cy="65" r="4.5" fill={NAVY} />
        <path d="M50 77h24q-2 12-12 12t-12-12z" fill={NAVY} />
      </>
    ),
    dots: (
      <>
        <circle cx="50" cy="66" r="4.5" fill={NAVY} />
        <circle cx="72" cy="66" r="4.5" fill={NAVY} />
        <path d="M54 78q7 6 14 0" stroke={NAVY} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    ),
  }[mood];
  return (
    <g>
      {fist && (
        <>
          <path d="M90 62Q108 46 104 22" stroke={color} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="104" cy="18" r="10" fill={color} />
          <path d="M98 14q6-3 12 0M98 20q6-3 12 0" stroke="rgba(0,0,0,.18)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      <path d={tail === 'left' ? 'M36 90L22 114L56 100Z' : 'M84 90L98 114L64 100Z'} fill={color} />
      <circle cx="61" cy="66" r="40" fill={color} />
      <ellipse cx="44" cy="48" rx="11" ry="6" fill="#fff" opacity="0.35" transform="rotate(-20 44 48)" />
      <circle cx="42" cy="77" r="5" fill="#ff8fa0" opacity="0.55" />
      <circle cx="80" cy="77" r="5" fill="#ff8fa0" opacity="0.55" />
      {face}
      {cap && (
        <>
          <path d="M23 52Q26 18 61 16Q96 18 99 52Z" fill={cap} />
          <path d="M60 50Q92 42 114 52Q96 60 60 56Z" fill={cap} />
          <path d="M61 25l3 7 7.5.5-5.8 4.8 1.9 7.3L61 40.5l-6.6 4.1 1.9-7.3-5.8-4.8 7.5-.5z" fill="#fff" />
        </>
      )}
      {sparks && <path d="M106 34l8-6M110 46l10-1M100 24l2-10" stroke={NAVY} strokeWidth="3.5" strokeLinecap="round" transform={fist ? 'translate(12 14)' : undefined} />}
    </g>
  );
}

export function Buddy({ className = '', ...p }: BuddyProps & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 124 124" aria-hidden="true">
      <BuddyG {...p} />
    </svg>
  );
}

/** The Empire State Building, about 40×150. */
function Esb({ x, y, fill = '#b9c2d8' }: { x: number; y: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={fill}>
      <rect x="19" y="0" width="2" height="22" />
      <rect x="16" y="20" width="8" height="14" rx="1" />
      <rect x="12" y="32" width="16" height="22" />
      <rect x="6" y="52" width="28" height="100" />
      <g fill="rgba(255,255,255,.45)">
        <rect x="11" y="62" width="2" height="80" />
        <rect x="19" y="62" width="2" height="80" />
        <rect x="27" y="62" width="2" height="80" />
      </g>
    </g>
  );
}

/** Journey header: the buddy on the block, a street sign, the deli and the Empire State Building. */
export function BlockScene() {
  return (
    <svg className="block-scene" viewBox="0 0 360 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <Esb x={258} y={8} />
      {/* street sign */}
      <rect x="186" y="44" width="5" height="112" fill={NAVY} />
      <circle cx="188.5" cy="44" r="7" fill="none" stroke={NAVY} strokeWidth="4" />
      <rect x="166" y="64" width="46" height="18" rx="3" fill="#2f8a4a" />
      <text x="189" y="77.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff" fontFamily="Nunito, sans-serif">
        NYC
      </text>
      <rect x="178" y="152" width="21" height="6" rx="2" fill={NAVY} />
      {/* deli */}
      <rect x="222" y="86" width="150" height="84" fill="#2d3a63" />
      <rect x="230" y="114" width="44" height="50" rx="3" fill="#cfe3ff" />
      <rect x="284" y="114" width="80" height="50" rx="3" fill="#ffe7a8" />
      <g fill="#f49a2a">
        <rect x="292" y="124" width="18" height="7" rx="3" />
        <rect x="316" y="124" width="18" height="7" rx="3" />
        <rect x="292" y="140" width="18" height="7" rx="3" />
        <rect x="316" y="140" width="18" height="7" rx="3" />
      </g>
      <rect x="216" y="64" width="160" height="30" rx="4" fill="#e8402f" />
      <text x="292" y="86" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily="Nunito, sans-serif">
        DELI
      </text>
      <g fill="#fff">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${222 + i * 19} 94h12v6a6 6 0 0 1-12 0z`} />
        ))}
      </g>
      {/* ground */}
      <path d="M0 150Q110 118 230 140T360 132V170H0Z" fill="#fff7ea" />
      <g transform="translate(20 34) scale(.95)">
        <BuddyG mood="calm" sparks />
      </g>
    </svg>
  );
}

/** Streak hero: the cheering buddy in front of the skyline. */
export function SkylineScene({ mood = 'happy' as Mood }) {
  return (
    <svg className="skyline-scene" viewBox="0 0 360 190" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M-10 190V128q30-30 62-6 26-34 62-8 30-26 60 2 30-30 62-4 30-26 64 0 30-20 70 14V190Z" fill="#cfe9ff" />
      <Esb x={30} y={30} fill="#8fc4f5" />
      <g fill="#a9d4fa">
        <rect x="270" y="96" width="34" height="94" />
        <rect x="308" y="118" width="28" height="72" />
        <rect x="236" y="130" width="28" height="60" />
      </g>
      <g transform="translate(96 28) scale(1.35)">
        <BuddyG mood={mood} cap={null} fist sparks />
      </g>
    </svg>
  );
}

/** Lesson preview hero: you and the deli clerk, under the striped awning. */
export function DeliScene() {
  return (
    <svg className="deli-scene" viewBox="0 0 360 230" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="360" height="230" fill="#bfe3ff" />
      <ellipse cx="300" cy="22" rx="34" ry="9" fill="#fff" />
      <ellipse cx="40" cy="40" rx="26" ry="8" fill="#fff" opacity=".8" />
      <g fill="#9ccdf6">
        <rect x="0" y="120" width="40" height="110" />
        <rect x="44" y="96" width="30" height="134" />
        <rect x="190" y="110" width="36" height="120" />
      </g>
      {/* awning and counter */}
      <path d="M272 0h88v66h-110z" fill="#fff" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${282 + i * 22} 0h11l-${10 - i} 66h-14z`} fill="#e8402f" />
      ))}
      <rect x="252" y="66" width="108" height="164" fill="#f3c27a" />
      <rect x="244" y="190" width="116" height="40" fill="#d99a4b" />
      <rect x="262" y="164" width="30" height="26" rx="4" fill="#2d3a63" />
      <rect x="266" y="156" width="22" height="10" rx="2" fill="#ffd84d" />
      <g transform="translate(270 92) scale(.95)">
        <BuddyG color="#3d7bf0" mood="dots" cap="#2fa84f" tail="right" />
      </g>
      <g transform="translate(-4 96) scale(1)">
        <BuddyG mood="dots" cap={null} />
      </g>
    </svg>
  );
}

/** A bushy strip for the bottom of the celebration screens. */
export function Bushes() {
  return (
    <svg className="bushes" viewBox="0 0 360 60" preserveAspectRatio="none" aria-hidden="true">
      <circle cx="10" cy="60" r="44" fill="#a5d86a" />
      <circle cx="80" cy="70" r="34" fill="#bfe58a" />
      <circle cx="290" cy="70" r="36" fill="#bfe58a" />
      <circle cx="352" cy="58" r="46" fill="#a5d86a" />
    </svg>
  );
}

export function Flame({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#ff5a1f" />
      <path d="M12 12c.5 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 0 1 .5 1.5 1 1.5 0-2-.5-2.5.5-4z" fill="#ffc23d" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Lock({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="11" rx="3" fill="currentColor" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}
