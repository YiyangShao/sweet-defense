import { memo } from 'react';

export const Cupcake = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="28" ry="5" fill="rgba(90,62,54,0.18)" />
    <path d="M 26 60 L 30 88 Q 30 92 34 92 L 66 92 Q 70 92 70 88 L 74 60 Z" fill="#F5B872"/>
    <rect x="36" y="62" width="3" height="28" rx="1.5" fill="#E89A4D" opacity="0.6"/>
    <rect x="48" y="62" width="3" height="28" rx="1.5" fill="#E89A4D" opacity="0.6"/>
    <rect x="60" y="62" width="3" height="28" rx="1.5" fill="#E89A4D" opacity="0.6"/>
    <ellipse cx="50" cy="58" rx="26" ry="10" fill="#FFB5C5"/>
    <ellipse cx="50" cy="48" rx="20" ry="9" fill="#FFC8D4"/>
    <ellipse cx="50" cy="38" rx="14" ry="7" fill="#FFD9E0"/>
    <circle cx="50" cy="30" r="6" fill="#FFE5EC"/>
    <circle cx="50" cy="22" r="5" fill="#E85A7A"/>
    <ellipse cx="48" cy="20" rx="1.5" ry="1" fill="#FFB5C5"/>
    <rect x="38" y="50" width="4" height="2" rx="1" fill="#7BC4A0" transform="rotate(30 40 51)"/>
    <rect x="58" y="44" width="4" height="2" rx="1" fill="#F8E060" transform="rotate(-20 60 45)"/>
    <rect x="46" y="56" width="4" height="2" rx="1" fill="#B79CD1" transform="rotate(50 48 57)"/>
  </svg>
));

export const Donut = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="32" ry="5" fill="rgba(90,62,54,0.18)"/>
    <ellipse cx="50" cy="60" rx="38" ry="28" fill="#D4A373"/>
    <ellipse cx="50" cy="58" rx="38" ry="28" fill="#E0B589"/>
    <path d="M 14 55 Q 12 38 30 32 Q 50 26 70 32 Q 88 38 86 55 Q 86 50 80 50 Q 70 48 50 50 Q 30 48 20 50 Q 14 50 14 55 Z" fill="#F58CA6"/>
    <ellipse cx="50" cy="58" rx="14" ry="10" fill="#E0B589"/>
    <ellipse cx="50" cy="56" rx="14" ry="10" fill="#FFEAD0"/>
    <rect x="28" y="40" width="5" height="2.5" rx="1.2" fill="#7BC4A0" transform="rotate(-30 30 41)"/>
    <rect x="42" y="36" width="5" height="2.5" rx="1.2" fill="#F8E060" transform="rotate(20 44 37)"/>
    <rect x="58" y="38" width="5" height="2.5" rx="1.2" fill="#B79CD1" transform="rotate(-40 60 39)"/>
    <rect x="70" y="46" width="5" height="2.5" rx="1.2" fill="#7BC4F0" transform="rotate(60 72 47)"/>
    <rect x="22" y="50" width="5" height="2.5" rx="1.2" fill="#F8E060" transform="rotate(15 24 51)"/>
    <rect x="74" y="60" width="5" height="2.5" rx="1.2" fill="#7BC4A0" transform="rotate(-60 76 61)"/>
  </svg>
));

export const Macaron = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="92" rx="28" ry="4" fill="rgba(90,62,54,0.18)"/>
    <ellipse cx="50" cy="72" rx="32" ry="11" fill="#C4E4D4"/>
    <ellipse cx="50" cy="70" rx="32" ry="11" fill="#A8D9C0"/>
    <circle cx="22" cy="70" r="3" fill="#A8D9C0"/>
    <circle cx="30" cy="74" r="3" fill="#A8D9C0"/>
    <circle cx="40" cy="76" r="3" fill="#A8D9C0"/>
    <circle cx="50" cy="77" r="3" fill="#A8D9C0"/>
    <circle cx="60" cy="76" r="3" fill="#A8D9C0"/>
    <circle cx="70" cy="74" r="3" fill="#A8D9C0"/>
    <circle cx="78" cy="70" r="3" fill="#A8D9C0"/>
    <ellipse cx="50" cy="58" rx="30" ry="6" fill="#FFB5C5"/>
    <ellipse cx="50" cy="46" rx="32" ry="11" fill="#C4E4D4"/>
    <ellipse cx="50" cy="44" rx="32" ry="11" fill="#D4ECDD"/>
    <circle cx="22" cy="48" r="3" fill="#A8D9C0"/>
    <circle cx="30" cy="51" r="3" fill="#A8D9C0"/>
    <circle cx="40" cy="53" r="3" fill="#A8D9C0"/>
    <circle cx="50" cy="54" r="3" fill="#A8D9C0"/>
    <circle cx="60" cy="53" r="3" fill="#A8D9C0"/>
    <circle cx="70" cy="51" r="3" fill="#A8D9C0"/>
    <circle cx="78" cy="48" r="3" fill="#A8D9C0"/>
    <ellipse cx="40" cy="38" rx="6" ry="2" fill="white" opacity="0.6"/>
  </svg>
));

export const IceCream = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="93" rx="22" ry="4" fill="rgba(90,62,54,0.18)"/>
    <path d="M 35 60 L 50 92 L 65 60 Z" fill="#E0B589"/>
    <line x1="40" y1="64" x2="46" y2="80" stroke="#B68A6E" strokeWidth="1.5"/>
    <line x1="50" y1="64" x2="50" y2="86" stroke="#B68A6E" strokeWidth="1.5"/>
    <line x1="60" y1="64" x2="54" y2="80" stroke="#B68A6E" strokeWidth="1.5"/>
    <line x1="38" y1="68" x2="62" y2="68" stroke="#B68A6E" strokeWidth="1.2"/>
    <line x1="42" y1="76" x2="58" y2="76" stroke="#B68A6E" strokeWidth="1.2"/>
    <circle cx="50" cy="55" r="22" fill="#A8D9C0"/>
    <circle cx="42" cy="50" r="2" fill="#7BB89A"/>
    <circle cx="55" cy="58" r="2" fill="#7BB89A"/>
    <circle cx="60" cy="48" r="2" fill="#7BB89A"/>
    <circle cx="50" cy="33" r="18" fill="#E5D5F0"/>
    <ellipse cx="42" cy="25" rx="6" ry="3" fill="white" opacity="0.6"/>
    <rect x="44" y="20" width="4" height="2" rx="1" fill="#F58CA6"/>
    <rect x="52" y="18" width="4" height="2" rx="1" fill="#F8E060"/>
  </svg>
));

export const Lollipop = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="93" rx="14" ry="3" fill="rgba(90,62,54,0.18)"/>
    <rect x="48" y="48" width="4" height="44" rx="2" fill="white" stroke="#E0CFB7" strokeWidth="1"/>
    <circle cx="50" cy="38" r="28" fill="#FFB5C5"/>
    <path d="M 50 38 m -20 0 a 20 20 0 1 1 40 0 a 14 14 0 1 1 -28 0 a 8 8 0 1 1 16 0 a 4 4 0 1 1 -8 0"
          fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="40" cy="28" rx="6" ry="3" fill="white" opacity="0.7"/>
    <ellipse cx="50" cy="62" rx="6" ry="3" fill="#FFE5EC"/>
  </svg>
));

export const Cookie = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="88" rx="28" ry="5" fill="rgba(90,62,54,0.18)"/>
    <circle cx="50" cy="53" r="32" fill="#D9B47C"/>
    <circle cx="22" cy="50" r="4" fill="#D9B47C"/>
    <circle cx="78" cy="50" r="4" fill="#D9B47C"/>
    <circle cx="30" cy="78" r="4" fill="#D9B47C"/>
    <circle cx="70" cy="78" r="4" fill="#D9B47C"/>
    <circle cx="35" cy="26" r="4" fill="#D9B47C"/>
    <circle cx="68" cy="26" r="4" fill="#D9B47C"/>
    <ellipse cx="40" cy="42" rx="5" ry="4" fill="#5A3E36"/>
    <ellipse cx="58" cy="48" rx="6" ry="5" fill="#5A3E36"/>
    <ellipse cx="38" cy="60" rx="4" ry="3.5" fill="#5A3E36"/>
    <ellipse cx="60" cy="66" rx="5" ry="4" fill="#5A3E36"/>
    <ellipse cx="50" cy="72" rx="3.5" ry="3" fill="#5A3E36"/>
    <ellipse cx="32" cy="50" rx="3" ry="2.5" fill="#5A3E36"/>
    <ellipse cx="68" cy="58" rx="3" ry="2.5" fill="#5A3E36"/>
    <ellipse cx="38" cy="36" rx="6" ry="2" fill="white" opacity="0.4"/>
  </svg>
));

export const Cake = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="93" rx="34" ry="5" fill="rgba(90,62,54,0.18)"/>
    <rect x="14" y="58" width="72" height="28" rx="6" fill="#FFE5EC"/>
    <path d="M 14 66 Q 22 70 30 66 Q 38 72 46 66 Q 54 72 62 66 Q 70 70 78 66 Q 86 72 86 66 L 86 60 L 14 60 Z" fill="#F58CA6"/>
    <rect x="22" y="40" width="56" height="22" rx="6" fill="#D4ECDD"/>
    <path d="M 22 46 Q 30 50 38 46 Q 46 52 54 46 Q 62 52 70 46 Q 78 50 78 46 L 78 42 L 22 42 Z" fill="#8FCFAE"/>
    <rect x="32" y="26" width="36" height="18" rx="5" fill="#FFF1C4"/>
    <rect x="48" y="14" width="4" height="14" rx="1" fill="#F58CA6"/>
    <rect x="48" y="14" width="4" height="14" rx="1" fill="white" opacity="0.3"/>
    <ellipse cx="50" cy="10" rx="2.5" ry="4" fill="#FFB857"/>
    <ellipse cx="50" cy="9" rx="1.5" ry="2.5" fill="#FFE066"/>
  </svg>
));

export const ChocoFountain = memo(({ size = 80 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <ellipse cx="50" cy="93" rx="32" ry="5" fill="rgba(90,62,54,0.18)"/>
    <ellipse cx="50" cy="80" rx="32" ry="8" fill="#7A4F3F"/>
    <path d="M 18 80 Q 18 88 50 90 Q 82 88 82 80 L 80 70 Q 50 76 20 70 Z" fill="#8B6F5C"/>
    <ellipse cx="50" cy="70" rx="30" ry="6" fill="#7A4F3F"/>
    <rect x="44" y="36" width="12" height="36" rx="2" fill="#8B6F5C"/>
    <ellipse cx="50" cy="34" rx="14" ry="4" fill="#7A4F3F"/>
    <path d="M 36 36 Q 32 44 36 52 Q 30 50 34 60" stroke="#5A3E36" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M 64 36 Q 68 44 64 52 Q 70 50 66 60" stroke="#5A3E36" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="50" cy="20" r="8" fill="#7A4F3F"/>
    <circle cx="50" cy="14" r="3" fill="#E85A7A"/>
  </svg>
));
