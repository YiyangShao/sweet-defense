import { memo } from 'react';

// Nougat / candy wall — defensive blocker placed on path
export const NougatWall = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="34" ry="5" fill="rgba(90,62,54,0.22)" />
    {/* Block body */}
    <rect x="14" y="34" width="72" height="56" rx="14" fill="#E0BC8C" />
    <rect x="14" y="32" width="72" height="56" rx="14" fill="#F5DEB3" />
    {/* Top crust highlight */}
    <ellipse cx="50" cy="38" rx="32" ry="6" fill="white" opacity="0.45" />
    {/* Cocoa stripes */}
    <rect x="20" y="44" width="60" height="3" rx="1.5" fill="#B68A6E" opacity="0.45" />
    <rect x="20" y="52" width="60" height="3" rx="1.5" fill="#B68A6E" opacity="0.45" />
    {/* Embedded fruit/nut bits */}
    <circle cx="32" cy="62" r="3" fill="#F58CA6" />
    <circle cx="50" cy="68" r="3" fill="#F8E060" />
    <circle cx="68" cy="62" r="3" fill="#A8D9C0" />
    <circle cx="38" cy="80" r="2.5" fill="#B79CD1" />
    <circle cx="62" cy="80" r="2.5" fill="#F58CA6" />
    {/* Cute face */}
    <ellipse cx="42" cy="56" rx="1.6" ry="2.2" fill="#3A2A26" />
    <ellipse cx="58" cy="56" rx="1.6" ry="2.2" fill="#3A2A26" />
    <circle cx="42.5" cy="55" r="0.6" fill="white" />
    <circle cx="58.5" cy="55" r="0.6" fill="white" />
    <circle cx="36" cy="60" r="3" fill="#FFB5C5" opacity="0.5" />
    <circle cx="64" cy="60" r="3" fill="#FFB5C5" opacity="0.5" />
    <path d="M 42 64 Q 50 68 58 64" stroke="#5A3E36" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
));

// Chocolate boulder — clearable obstacle
export const Boulder = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="36" ry="6" fill="rgba(90,62,54,0.32)" />
    <ellipse cx="50" cy="62" rx="36" ry="22" fill="#7A4F3F" />
    <ellipse cx="50" cy="56" rx="36" ry="22" fill="#8B6F5C" />
    <ellipse cx="50" cy="40" rx="28" ry="14" fill="#A98467" />
    <ellipse cx="42" cy="34" rx="14" ry="5" fill="white" opacity="0.45" />
    <path d="M 30 46 Q 38 50 36 60" stroke="#5A3E36" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M 60 56 Q 66 62 70 70" stroke="#5A3E36" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.55" />
    {/* Sprinkles of choco bits */}
    <circle cx="38" cy="44" r="2" fill="#5A3E36" opacity="0.7" />
    <circle cx="58" cy="48" r="2.5" fill="#5A3E36" opacity="0.7" />
    <circle cx="48" cy="62" r="2" fill="#5A3E36" opacity="0.7" />
  </svg>
));
