import { memo } from 'react';

export const Mouse = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="22" ry="4" fill="rgba(90,62,54,0.2)"/>
    <ellipse cx="50" cy="62" rx="26" ry="22" fill="#C9C0D4"/>
    <circle cx="50" cy="40" r="20" fill="#D4CCDD"/>
    <circle cx="34" cy="26" r="9" fill="#D4CCDD"/>
    <circle cx="66" cy="26" r="9" fill="#D4CCDD"/>
    <circle cx="34" cy="26" r="5" fill="#FFB5C5"/>
    <circle cx="66" cy="26" r="5" fill="#FFB5C5"/>
    <circle cx="42" cy="40" r="2.5" fill="#3A2A26"/>
    <circle cx="58" cy="40" r="2.5" fill="#3A2A26"/>
    <circle cx="42.5" cy="39" r="0.8" fill="white"/>
    <circle cx="58.5" cy="39" r="0.8" fill="white"/>
    <circle cx="36" cy="46" r="3" fill="#FFB5C5" opacity="0.6"/>
    <circle cx="64" cy="46" r="3" fill="#FFB5C5" opacity="0.6"/>
    <ellipse cx="50" cy="46" rx="2" ry="1.5" fill="#F58CA6"/>
    <path d="M 47 50 Q 50 52 53 50" stroke="#5A3E36" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M 72 70 Q 88 64 84 50" stroke="#D4CCDD" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
  </svg>
));

export const Hedgehog = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="86" rx="26" ry="4" fill="rgba(90,62,54,0.2)"/>
    <ellipse cx="55" cy="58" rx="34" ry="26" fill="#8B6F5C"/>
    {[
      [38, 38, -45], [48, 32, -20], [60, 30, 0], [72, 34, 20], [82, 44, 40],
      [86, 58, 60], [40, 50, -55], [54, 44, -10], [68, 44, 15], [80, 56, 35],
      [44, 64, -70], [58, 60, -5], [72, 58, 20], [50, 74, -85], [64, 72, 5],
    ].map(([x, y, r], i) => (
      <path key={i} d={`M ${x} ${y} L ${x+4} ${y-12} L ${x+8} ${y}`} fill="#A98467" transform={`rotate(${r} ${x+4} ${y-6})`}/>
    ))}
    <ellipse cx="28" cy="58" rx="14" ry="13" fill="#F5DEB3"/>
    <circle cx="26" cy="56" r="2.5" fill="#3A2A26"/>
    <circle cx="26.5" cy="55" r="0.8" fill="white"/>
    <circle cx="22" cy="62" r="2.5" fill="#FFB5C5" opacity="0.7"/>
    <circle cx="16" cy="58" r="2.5" fill="#3A2A26"/>
    <ellipse cx="40" cy="80" rx="5" ry="3" fill="#8B6F5C"/>
    <ellipse cx="68" cy="82" rx="5" ry="3" fill="#8B6F5C"/>
  </svg>
));

export const Rabbit = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="90" rx="22" ry="4" fill="rgba(90,62,54,0.2)"/>
    <ellipse cx="50" cy="68" rx="22" ry="20" fill="#FFEAD0"/>
    <ellipse cx="38" cy="86" rx="8" ry="4" fill="#FFEAD0"/>
    <ellipse cx="62" cy="86" rx="8" ry="4" fill="#FFEAD0"/>
    <circle cx="38" cy="86" r="2" fill="#FFB5C5"/>
    <circle cx="62" cy="86" r="2" fill="#FFB5C5"/>
    <circle cx="50" cy="46" r="20" fill="#FFF1DC"/>
    <ellipse cx="40" cy="20" rx="6" ry="16" fill="#FFEAD0"/>
    <ellipse cx="60" cy="20" rx="6" ry="16" fill="#FFEAD0"/>
    <ellipse cx="40" cy="22" rx="3" ry="10" fill="#FFB5C5"/>
    <ellipse cx="60" cy="22" rx="3" ry="10" fill="#FFB5C5"/>
    <circle cx="42" cy="44" r="2.5" fill="#3A2A26"/>
    <circle cx="58" cy="44" r="2.5" fill="#3A2A26"/>
    <circle cx="42.5" cy="43" r="0.8" fill="white"/>
    <circle cx="58.5" cy="43" r="0.8" fill="white"/>
    <circle cx="36" cy="50" r="3" fill="#FFB5C5" opacity="0.7"/>
    <circle cx="64" cy="50" r="3" fill="#FFB5C5" opacity="0.7"/>
    <ellipse cx="50" cy="52" rx="2" ry="1.5" fill="#F58CA6"/>
    <path d="M 50 54 L 50 56 M 47 58 Q 50 60 53 58" stroke="#5A3E36" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <circle cx="74" cy="74" r="6" fill="white"/>
  </svg>
));

export const Squirrel = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="22" ry="4" fill="rgba(90,62,54,0.2)"/>
    <path d="M 70 70 Q 92 60 88 38 Q 86 22 72 22 Q 80 32 78 50 Q 76 64 70 70 Z" fill="#C9924D"/>
    <ellipse cx="50" cy="62" rx="20" ry="22" fill="#D4A373"/>
    <ellipse cx="48" cy="68" rx="10" ry="12" fill="#FFEAD0"/>
    <circle cx="48" cy="38" r="18" fill="#D4A373"/>
    <path d="M 36 24 L 32 14 L 42 22 Z" fill="#D4A373"/>
    <path d="M 60 24 L 64 14 L 54 22 Z" fill="#D4A373"/>
    <path d="M 36 24 L 34 18 L 40 22 Z" fill="#FFB5C5"/>
    <path d="M 60 24 L 62 18 L 56 22 Z" fill="#FFB5C5"/>
    <circle cx="40" cy="38" r="2.8" fill="#3A2A26"/>
    <circle cx="56" cy="38" r="2.8" fill="#3A2A26"/>
    <circle cx="40.5" cy="37" r="0.9" fill="white"/>
    <circle cx="56.5" cy="37" r="0.9" fill="white"/>
    <circle cx="34" cy="46" r="5" fill="#E89A4D" opacity="0.5"/>
    <circle cx="62" cy="46" r="5" fill="#E89A4D" opacity="0.5"/>
    <ellipse cx="48" cy="44" rx="2" ry="1.5" fill="#3A2A26"/>
    <rect x="46.5" y="46" width="1.5" height="3" fill="white"/>
    <rect x="48" y="46" width="1.5" height="3" fill="white"/>
  </svg>
));

export const Raccoon = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="24" ry="4" fill="rgba(90,62,54,0.2)"/>
    <ellipse cx="50" cy="64" rx="24" ry="22" fill="#9CA3B5"/>
    <circle cx="50" cy="40" r="22" fill="#B3B9C9"/>
    <circle cx="32" cy="22" r="8" fill="#9CA3B5"/>
    <circle cx="68" cy="22" r="8" fill="#9CA3B5"/>
    <circle cx="32" cy="22" r="4" fill="#7A8090"/>
    <circle cx="68" cy="22" r="4" fill="#7A8090"/>
    <ellipse cx="50" cy="40" rx="20" ry="8" fill="#5A3E36"/>
    <ellipse cx="40" cy="40" rx="3" ry="3" fill="white"/>
    <ellipse cx="60" cy="40" rx="3" ry="3" fill="white"/>
    <circle cx="40" cy="40" r="1.5" fill="#3A2A26"/>
    <circle cx="60" cy="40" r="1.5" fill="#3A2A26"/>
    <ellipse cx="50" cy="52" rx="2.5" ry="2" fill="#3A2A26"/>
    <circle cx="34" cy="54" r="3" fill="#FFB5C5" opacity="0.5"/>
    <circle cx="66" cy="54" r="3" fill="#FFB5C5" opacity="0.5"/>
    <ellipse cx="76" cy="68" rx="6" ry="14" fill="#9CA3B5" transform="rotate(30 76 68)"/>
    <ellipse cx="80" cy="60" rx="5" ry="3" fill="#5A3E36" transform="rotate(30 80 60)"/>
    <ellipse cx="76" cy="74" rx="5" ry="3" fill="#5A3E36" transform="rotate(30 76 74)"/>
  </svg>
));

export const Pigeon = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="90" rx="20" ry="3" fill="rgba(90,62,54,0.15)"/>
    <ellipse cx="50" cy="58" rx="22" ry="26" fill="#B3C5D9"/>
    <ellipse cx="48" cy="62" rx="12" ry="16" fill="#D4DEE8"/>
    <circle cx="50" cy="32" r="14" fill="#9CB0C9"/>
    <circle cx="56" cy="30" r="2.5" fill="#3A2A26"/>
    <circle cx="56.5" cy="29" r="0.8" fill="white"/>
    <path d="M 64 32 L 72 32 L 64 36 Z" fill="#F5B872"/>
    <ellipse cx="30" cy="50" rx="8" ry="20" fill="#9CB0C9" transform="rotate(-20 30 50)"/>
    <ellipse cx="70" cy="50" rx="8" ry="20" fill="#9CB0C9" transform="rotate(20 70 50)"/>
    <ellipse cx="28" cy="48" rx="5" ry="14" fill="#7A8FA8" transform="rotate(-20 28 48)"/>
    <ellipse cx="72" cy="48" rx="5" ry="14" fill="#7A8FA8" transform="rotate(20 72 48)"/>
    <ellipse cx="50" cy="42" rx="10" ry="4" fill="#B79CD1" opacity="0.6"/>
    <line x1="44" y1="80" x2="44" y2="86" stroke="#F58CA6" strokeWidth="2"/>
    <line x1="56" y1="80" x2="56" y2="86" stroke="#F58CA6" strokeWidth="2"/>
  </svg>
));

export const Fox = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="22" ry="4" fill="rgba(90,62,54,0.2)"/>
    <path d="M 72 68 Q 92 64 90 44 Q 86 32 76 36 Q 82 46 80 56 Q 78 64 72 68 Z" fill="#E8956D"/>
    <path d="M 86 44 Q 90 46 88 52" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="50" cy="62" rx="22" ry="20" fill="#E8956D"/>
    <ellipse cx="48" cy="68" rx="10" ry="10" fill="white"/>
    <circle cx="48" cy="38" r="20" fill="#E8956D"/>
    <ellipse cx="48" cy="46" rx="10" ry="6" fill="white"/>
    <path d="M 30 22 L 26 8 L 40 22 Z" fill="#E8956D"/>
    <path d="M 66 22 L 70 8 L 56 22 Z" fill="#E8956D"/>
    <path d="M 32 20 L 30 14 L 38 22 Z" fill="#3A2A26"/>
    <path d="M 64 20 L 66 14 L 58 22 Z" fill="#3A2A26"/>
    <ellipse cx="40" cy="36" rx="3" ry="2" fill="#3A2A26"/>
    <ellipse cx="56" cy="36" rx="3" ry="2" fill="#3A2A26"/>
    <circle cx="32" cy="44" r="3" fill="#FFB5C5" opacity="0.6"/>
    <circle cx="64" cy="44" r="3" fill="#FFB5C5" opacity="0.6"/>
    <ellipse cx="48" cy="44" rx="2.5" ry="2" fill="#3A2A26"/>
    <path d="M 48 48 Q 44 52 42 50 M 48 48 Q 52 52 54 50" stroke="#5A3E36" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </svg>
));

// === New enemies (Phase C) ===

// Healer — small white bear with halo + heart on chest
export const Healer = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="22" ry="4" fill="rgba(90,62,54,0.2)" />
    {/* Body */}
    <ellipse cx="50" cy="64" rx="22" ry="20" fill="#FFE5EC" />
    {/* Head */}
    <circle cx="50" cy="40" r="20" fill="#FFEFF3" />
    {/* Round ears */}
    <circle cx="32" cy="22" r="8" fill="#FFE5EC" />
    <circle cx="68" cy="22" r="8" fill="#FFE5EC" />
    <circle cx="32" cy="22" r="4" fill="#F58CA6" />
    <circle cx="68" cy="22" r="4" fill="#F58CA6" />
    {/* Eyes */}
    <circle cx="42" cy="42" r="2.5" fill="#3A2A26" />
    <circle cx="58" cy="42" r="2.5" fill="#3A2A26" />
    <circle cx="42.5" cy="41" r="0.8" fill="white" />
    <circle cx="58.5" cy="41" r="0.8" fill="white" />
    {/* Cheeks */}
    <circle cx="36" cy="48" r="3" fill="#F58CA6" opacity="0.7" />
    <circle cx="64" cy="48" r="3" fill="#F58CA6" opacity="0.7" />
    {/* Smile */}
    <path d="M 46 50 Q 50 53 54 50" stroke="#5A3E36" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Heart on chest */}
    <path d="M 50 76 C 44 70 38 66 42 62 A 4 4 0 0 1 50 64 A 4 4 0 0 1 58 62 C 62 66 56 70 50 76 Z" fill="#F58CA6" />
    {/* Halo */}
    <ellipse cx="50" cy="10" rx="14" ry="4" fill="none" stroke="#F8E060" strokeWidth="2.5" />
  </svg>
));

// Shielded — sugar tortoise with thick mint shell
export const Shielded = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="86" rx="32" ry="5" fill="rgba(90,62,54,0.22)" />
    {/* Shell */}
    <path d="M 18 56 Q 18 32 50 28 Q 82 32 82 56 Q 82 76 50 80 Q 18 76 18 56 Z" fill="#A8D9C0" />
    <path d="M 20 54 Q 20 32 50 30 Q 80 32 80 54 Q 80 72 50 76 Q 20 72 20 54 Z" fill="#C4E4D4" />
    {/* Shell hex pattern */}
    <circle cx="40" cy="46" r="5" fill="#7BB89A" opacity="0.5" />
    <circle cx="60" cy="46" r="5" fill="#7BB89A" opacity="0.5" />
    <circle cx="50" cy="58" r="6" fill="#7BB89A" opacity="0.5" />
    <circle cx="36" cy="64" r="4" fill="#7BB89A" opacity="0.5" />
    <circle cx="64" cy="64" r="4" fill="#7BB89A" opacity="0.5" />
    {/* Sugar dome highlight */}
    <ellipse cx="46" cy="38" rx="14" ry="6" fill="white" opacity="0.55" />
    {/* Head poking out */}
    <ellipse cx="22" cy="60" rx="11" ry="9" fill="#E8C9A8" />
    <ellipse cx="22" cy="58" rx="11" ry="9" fill="#F5DEB3" />
    <circle cx="14" cy="58" r="2" fill="#3A2A26" />
    <circle cx="14.5" cy="57" r="0.6" fill="white" />
    <circle cx="18" cy="64" r="2" fill="#FFB5C5" opacity="0.6" />
    {/* Legs */}
    <ellipse cx="30" cy="80" rx="6" ry="3" fill="#E8C9A8" />
    <ellipse cx="70" cy="80" rx="6" ry="3" fill="#E8C9A8" />
    {/* Tail */}
    <path d="M 80 64 L 88 62 L 84 70 Z" fill="#E8C9A8" />
  </svg>
));

// Splitter — bouncy gummy ball that splits on death.
// `tint` lets us reuse the same SVG for the smaller "mini" variant in green.
export const Splitter = memo(({ size = 64, tint = 'pink' }) => {
  const palette = tint === 'mint'
    ? { body: '#A8D9C0', highlight: '#C4E4D4', cheek: '#7BB89A' }
    : { body: '#FFB5C5', highlight: '#FFD9E0', cheek: '#F58CA6' };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <ellipse cx="50" cy="88" rx="22" ry="4" fill="rgba(90,62,54,0.2)" />
      <circle cx="50" cy="58" r="28" fill={palette.body} />
      <circle cx="50" cy="56" r="28" fill={palette.highlight} />
      {/* Big highlight */}
      <ellipse cx="40" cy="44" rx="12" ry="6" fill="white" opacity="0.6" />
      {/* Face */}
      <circle cx="42" cy="56" r="2.5" fill="#3A2A26" />
      <circle cx="58" cy="56" r="2.5" fill="#3A2A26" />
      <circle cx="42.5" cy="55" r="0.8" fill="white" />
      <circle cx="58.5" cy="55" r="0.8" fill="white" />
      <circle cx="36" cy="62" r="3" fill={palette.cheek} opacity="0.5" />
      <circle cx="64" cy="62" r="3" fill={palette.cheek} opacity="0.5" />
      <path d="M 42 66 Q 50 72 58 66" stroke="#5A3E36" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Sparkles around */}
      <text x="22" y="40" fontSize="10" fill="#F8E060">✦</text>
      <text x="74" y="48" fontSize="10" fill="#F8E060">✦</text>
      <text x="76" y="78" fontSize="9" fill="#F8E060">✦</text>
    </svg>
  );
});

export const Bear = memo(({ size = 64 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="32" ry="5" fill="rgba(90,62,54,0.22)"/>
    <ellipse cx="50" cy="66" rx="32" ry="26" fill="#A87553"/>
    <ellipse cx="48" cy="72" rx="16" ry="16" fill="#E8C9A8"/>
    <circle cx="50" cy="38" r="26" fill="#A87553"/>
    <circle cx="28" cy="20" r="9" fill="#A87553"/>
    <circle cx="72" cy="20" r="9" fill="#A87553"/>
    <circle cx="28" cy="20" r="5" fill="#E8C9A8"/>
    <circle cx="72" cy="20" r="5" fill="#E8C9A8"/>
    <ellipse cx="50" cy="46" rx="14" ry="10" fill="#E8C9A8"/>
    <circle cx="40" cy="36" r="3" fill="#3A2A26"/>
    <circle cx="60" cy="36" r="3" fill="#3A2A26"/>
    <circle cx="40.5" cy="35" r="1" fill="white"/>
    <circle cx="60.5" cy="35" r="1" fill="white"/>
    <ellipse cx="50" cy="42" rx="3.5" ry="2.5" fill="#3A2A26"/>
    <path d="M 50 46 L 50 50 M 46 52 Q 50 54 54 52" stroke="#5A3E36" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="32" cy="46" r="4" fill="#FFB5C5" opacity="0.5"/>
    <circle cx="68" cy="46" r="4" fill="#FFB5C5" opacity="0.5"/>
    <ellipse cx="32" cy="84" rx="8" ry="5" fill="#8B5E3C"/>
    <ellipse cx="68" cy="84" rx="8" ry="5" fill="#8B5E3C"/>
    <path d="M 36 14 L 40 4 L 44 12 L 50 2 L 56 12 L 60 4 L 64 14 Z" fill="#F8E060" stroke="#E8CE6E" strokeWidth="1"/>
    <circle cx="50" cy="10" r="2" fill="#F58CA6"/>
  </svg>
));
