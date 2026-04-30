import { memo } from 'react';

// Decorative SVGs that sit on grass cells. They're purely visual, never block
// placement, never receive clicks. Each is ~80x80 viewBox to align with tile.

export const MacaronTree = memo(({ size = 60 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="22" ry="4" fill="rgba(90,62,54,0.16)" />
    <rect x="46" y="60" width="8" height="22" fill="#A98467" />
    <ellipse cx="50" cy="62" rx="26" ry="9" fill="#FFB5C5" />
    <ellipse cx="50" cy="48" rx="22" ry="8" fill="#A8D9C0" />
    <ellipse cx="50" cy="36" rx="18" ry="7" fill="#F8E060" />
    <ellipse cx="50" cy="26" rx="14" ry="6" fill="#D9C5E8" />
    <circle cx="44" cy="22" r="1.5" fill="white" opacity="0.7" />
  </svg>
));

export const LollipopFlower = memo(({ size = 50 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="14" ry="3" fill="rgba(90,62,54,0.16)" />
    <rect x="48" y="50" width="4" height="42" rx="2" fill="#7BB89A" />
    <circle cx="50" cy="36" r="20" fill="#FFB5C5" />
    <path d="M 50 36 m -14 0 a 14 14 0 1 1 28 0 a 9 9 0 1 1 -18 0 a 5 5 0 1 1 10 0"
          fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="42" cy="28" rx="5" ry="3" fill="white" opacity="0.6" />
  </svg>
));

export const CookieBush = memo(({ size = 60 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="32" ry="5" fill="rgba(90,62,54,0.20)" />
    <circle cx="34" cy="68" r="22" fill="#D9B47C" />
    <circle cx="66" cy="68" r="22" fill="#D9B47C" />
    <circle cx="50" cy="50" r="22" fill="#E0BC8C" />
    <ellipse cx="34" cy="58" rx="3" ry="2.5" fill="#5A3E36" />
    <ellipse cx="60" cy="44" rx="3" ry="2.5" fill="#5A3E36" />
    <ellipse cx="44" cy="62" rx="3" ry="2.5" fill="#5A3E36" />
    <ellipse cx="62" cy="62" rx="3" ry="2.5" fill="#5A3E36" />
    <ellipse cx="40" cy="74" rx="3" ry="2.5" fill="#5A3E36" />
  </svg>
));

export const JellyCube = memo(({ size = 60 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="26" ry="4" fill="rgba(90,62,54,0.16)" />
    <rect x="22" y="34" width="56" height="56" rx="8" fill="#8FCFAE" opacity="0.85" />
    <rect x="24" y="32" width="56" height="56" rx="8" fill="#A8D9C0" opacity="0.7" />
    <rect x="28" y="36" width="14" height="14" rx="3" fill="white" opacity="0.55" />
    <circle cx="38" cy="64" r="3" fill="#7BB89A" opacity="0.6" />
    <circle cx="60" cy="58" r="3" fill="#7BB89A" opacity="0.6" />
    <circle cx="52" cy="76" r="3" fill="#7BB89A" opacity="0.6" />
    {/* Wobble animation */}
    <animateTransform attributeName="transform" type="scale" values="1 1; 1.04 0.98; 1 1" dur="3s" repeatCount="indefinite" additive="sum" />
  </svg>
));

export const MarshmallowCloud = memo(({ size = 70 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="30" ry="4" fill="rgba(180,160,180,0.20)" />
    <ellipse cx="34" cy="56" rx="20" ry="14" fill="white" />
    <ellipse cx="66" cy="56" rx="20" ry="14" fill="white" />
    <ellipse cx="50" cy="44" rx="22" ry="14" fill="white" />
    <ellipse cx="40" cy="58" rx="18" ry="10" fill="#FFEFF3" />
    <ellipse cx="60" cy="58" rx="18" ry="10" fill="#FFEFF3" />
    <circle cx="42" cy="50" r="2" fill="#FFB5C5" opacity="0.55" />
    <circle cx="58" cy="50" r="2" fill="#FFB5C5" opacity="0.55" />
  </svg>
));

export const GearCookie = memo(({ size = 60 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="28" ry="4" fill="rgba(90,62,54,0.22)" />
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 50 56" to="360 50 56" dur="14s" repeatCount="indefinite" />
      <path d="M 50 16 L 56 22 L 64 18 L 66 28 L 76 28 L 74 38 L 84 42 L 78 50 L 84 58 L 74 62 L 76 72 L 66 72 L 64 82 L 56 78 L 50 84 L 44 78 L 36 82 L 34 72 L 24 72 L 26 62 L 16 58 L 22 50 L 16 42 L 26 38 L 24 28 L 34 28 L 36 18 L 44 22 Z" fill="#8B6F5C" />
      <circle cx="50" cy="50" r="22" fill="#A98467" />
      <circle cx="50" cy="50" r="22" fill="#D9B47C" />
      <circle cx="50" cy="50" r="10" fill="#5A3E36" />
      <ellipse cx="46" cy="44" rx="2.5" ry="2" fill="#3A2A26" />
      <ellipse cx="58" cy="48" rx="3" ry="2.5" fill="#3A2A26" />
      <ellipse cx="48" cy="56" rx="2.5" ry="2" fill="#3A2A26" />
    </g>
  </svg>
));

export const IcePine = memo(({ size = 70 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="26" ry="4" fill="rgba(120,150,170,0.22)" />
    <rect x="46" y="74" width="8" height="14" fill="#7A4F3F" />
    {/* Ice cream scoops as snowy pine layers */}
    <path d="M 28 72 L 50 50 L 72 72 Z" fill="#D8E8E8" />
    <path d="M 28 72 L 50 52 L 72 72 Z" fill="white" opacity="0.6" />
    <path d="M 32 56 L 50 36 L 68 56 Z" fill="#E5F0F0" />
    <path d="M 36 42 L 50 22 L 64 42 Z" fill="white" />
    <ellipse cx="50" cy="20" rx="3" ry="2.5" fill="#FFB5C5" />
    {/* Snow dots */}
    <circle cx="40" cy="64" r="1.5" fill="white" />
    <circle cx="60" cy="68" r="1.5" fill="white" />
    <circle cx="50" cy="46" r="1" fill="white" />
  </svg>
));

export const StarTwinkle = memo(({ size = 40 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <g>
      <animateTransform attributeName="transform" type="scale" values="1; 1.3; 1" dur="2.6s" repeatCount="indefinite" additive="sum" />
      <path d="M 50 18 L 56 44 L 82 50 L 56 56 L 50 82 L 44 56 L 18 50 L 44 44 Z" fill="#F8E060" />
      <circle cx="50" cy="50" r="6" fill="white" />
    </g>
  </svg>
));

export const ChocoPot = memo(({ size = 60 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="28" ry="4" fill="rgba(90,62,54,0.22)" />
    <ellipse cx="50" cy="84" rx="28" ry="6" fill="#7A4F3F" />
    <rect x="22" y="50" width="56" height="34" rx="6" fill="#8B6F5C" />
    <ellipse cx="50" cy="50" rx="28" ry="8" fill="#5A3E36" />
    <ellipse cx="50" cy="48" rx="28" ry="8" fill="#7A4F3F" />
    <ellipse cx="42" cy="46" rx="10" ry="3" fill="white" opacity="0.4" />
    {/* Steam */}
    <path d="M 38 38 Q 36 30 40 24 Q 38 18 42 14" stroke="#E0F0FF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M 56 36 Q 60 28 56 22 Q 60 16 56 12" stroke="#E0F0FF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
));
