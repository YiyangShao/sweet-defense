import { memo } from 'react';

export const Heart = memo(({ size = 24, fill = '#F58CA6' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M12 21 C 6 16 2 12 2 8 A 5 5 0 0 1 12 6 A 5 5 0 0 1 22 8 C 22 12 18 16 12 21 Z" fill={fill}/>
    <ellipse cx="8" cy="8" rx="2" ry="1.2" fill="white" opacity="0.5"/>
  </svg>
));

export const Sugar = memo(({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="12" cy="11" r="10" fill="#FFD9A0"/>
    <circle cx="12" cy="12" r="6" fill="#F5B872" opacity="0.4"/>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="#8B5E3C" fontFamily="Fredoka, sans-serif">糖</text>
  </svg>
));

export const Star = memo(({ size = 24, filled = true }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M 12 2 L 14.5 9 L 22 9 L 16 13.5 L 18.5 21 L 12 16.5 L 5.5 21 L 8 13.5 L 2 9 L 9.5 9 Z"
          fill={filled ? '#F8E060' : '#E5DCC5'}
          stroke={filled ? '#E8CE6E' : '#C9BFA5'}
          strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
));
