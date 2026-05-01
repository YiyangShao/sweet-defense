import {
  PATH_ENDLESS,
  PATH_ZIGZAG,
  PATH_MEANDER,
  PATH_RIGHTANGLE,
  PATH_DESCEND,
} from './levels/paths.js';
import { mulberry32, pickFrom, dailySeed } from './rng.js';

// Procedural enemy mix per "tier" — index roughly = wave count.
const TIER_TABLE = [
  // tier 0 — first endless wave is gentle
  [{ type: 'mouse', count: 12, interval: 0.45 }],
  [{ type: 'mouse', count: 8, interval: 0.4 }, { type: 'rabbit', count: 6, interval: 0.7, delay: 4 }],
  [{ type: 'rabbit', count: 8, interval: 0.5 }, { type: 'hedgehog', count: 4, interval: 1.6, delay: 4 }],
  [{ type: 'mouse', count: 10, interval: 0.35 }, { type: 'fox', count: 6, interval: 1.0, delay: 4 }, { type: 'squirrel', count: 4, interval: 1.2, delay: 9 }],
  [{ type: 'rabbit', count: 10, interval: 0.4 }, { type: 'hedgehog', count: 5, interval: 1.4, delay: 5 }, { type: 'splitter', count: 3, interval: 2.5, delay: 10 }],
  [{ type: 'fox', count: 8, interval: 0.8 }, { type: 'shielded', count: 4, interval: 1.8, delay: 5 }, { type: 'healer', count: 2, interval: 3, delay: 10 }],
  [{ type: 'mouse', count: 14, interval: 0.3 }, { type: 'splitter', count: 4, interval: 2, delay: 5 }, { type: 'pigeon', count: 6, interval: 0.7, delay: 8 }],
  [{ type: 'shielded', count: 5, interval: 1.5 }, { type: 'fox', count: 8, interval: 0.7, delay: 4 }, { type: 'bear', count: 1, interval: 1, delay: 12 }],
];

const ENEMY_POOL_BY_DIFFICULTY = [
  ['mouse', 'rabbit'],
  ['mouse', 'rabbit', 'hedgehog'],
  ['mouse', 'rabbit', 'hedgehog', 'fox'],
  ['rabbit', 'fox', 'hedgehog', 'squirrel'],
  ['fox', 'shielded', 'splitter', 'pigeon'],
  ['shielded', 'splitter', 'healer', 'fox', 'hedgehog'],
];

function genEndlessWave(rng, waveIdx) {
  // First N waves use scripted tiers; after that, scale procedurally.
  if (waveIdx < TIER_TABLE.length) {
    return TIER_TABLE[waveIdx];
  }
  const scale = 1 + (waveIdx - TIER_TABLE.length) * 0.2;
  const pool = ENEMY_POOL_BY_DIFFICULTY[Math.min(ENEMY_POOL_BY_DIFFICULTY.length - 1,
    Math.floor((waveIdx - TIER_TABLE.length) / 2))];
  const groups = 2 + Math.floor(rng() * 3); // 2-4 groups
  const out = [];
  let delay = 0;
  for (let i = 0; i < groups; i++) {
    const type = pickFrom(rng, pool);
    const baseCount = type === 'bear' ? 1 : (3 + Math.floor(rng() * 6));
    out.push({
      type,
      count: Math.min(20, Math.round(baseCount * scale)),
      interval: type === 'bear' ? 1 : (0.3 + rng() * 0.6),
      delay,
    });
    delay += 3 + Math.floor(rng() * 4);
  }
  // Boss every 5 waves after tier table
  if ((waveIdx - TIER_TABLE.length) % 5 === 4) {
    out.push({ type: 'bear', count: 1, interval: 1, delay: delay + 4 });
  }
  return out;
}

// Pre-generate the first batch of endless waves (rest are added lazily by update.js).
function initialEndlessWaves(rng) {
  const out = [];
  for (let i = 0; i < TIER_TABLE.length; i++) {
    out.push(genEndlessWave(rng, i));
  }
  return out;
}

export function makeEndlessLevel() {
  // Endless has a fixed star-themed path but procedurally generated waves.
  const seed = (Date.now() & 0xffffffff) >>> 0;
  const rng = mulberry32(seed);
  return {
    id: 'endless', name: '星空糖国 · 无尽',
    themeKey: 'cosmic',
    accent: 'var(--lavender)', accentDeep: 'var(--lavender-deep)',
    startSugar: 320, startHp: 25,
    bgPrimary: '#3D3756', bgSecondary: '#4A4365',
    pathGrid: PATH_ENDLESS,
    pathStyle: { outer: '#7A6B9C', inner: '#B79CD1', sprinkles: ['white','#F8E060','#FFB5C5','#A8D9C0','#B79CD1'], stars: true },
    availableTowers: ['cookie','cupcake','macaron','donut','icecream','cake','wall'],
    decorations: [
      { type: 'starTwinkle', gx: 0, gy: 0 }, { type: 'starTwinkle', gx: 4, gy: 0 },
      { type: 'starTwinkle', gx: 14, gy: 0 }, { type: 'starTwinkle', gx: 7, gy: 7 },
      { type: 'starTwinkle', gx: 0, gy: 7 }, { type: 'starTwinkle', gx: 14, gy: 7 },
      { type: 'starTwinkle', gx: 4, gy: 8 }, { type: 'starTwinkle', gx: 11, gy: 0 },
    ],
    obstacles: [[0, 6], [3, 7], [8, 8], [14, 5]],
    waves: initialEndlessWaves(rng),
    endless: true,
    rngState: seed,
    _rng: rng,
  };
}

// Lazily called by update.js when endless wants the next wave.
export function appendEndlessWave(level) {
  if (!level.endless || !level._rng) return;
  level.waves.push(genEndlessWave(level._rng, level.waves.length));
}

// === Daily challenge ===
//
// Same path everyday (zigzag-style rotation), seeded by today's date so every
// player faces the same "puzzle" each day.
export function makeDailyLevel(d = new Date()) {
  const seed = dailySeed(d);
  const rng = mulberry32(seed);
  const paths = [PATH_ZIGZAG, PATH_MEANDER, PATH_RIGHTANGLE, PATH_DESCEND];
  const path = paths[seed % paths.length];

  // Generate 3-5 obstacle positions on grass cells.
  const obstacles = [];
  const used = new Set(path.map(([x, y]) => `${x},${y}`));
  const obsCount = 3 + Math.floor(rng() * 3);
  let safety = 50;
  while (obstacles.length < obsCount && safety-- > 0) {
    const gx = Math.floor(rng() * 16);
    const gy = Math.floor(rng() * 9);
    const k = `${gx},${gy}`;
    if (used.has(k)) continue;
    used.add(k);
    obstacles.push([gx, gy]);
  }

  // 6 waves of escalating difficulty, seed-randomized composition.
  const waves = [];
  for (let i = 0; i < 6; i++) {
    waves.push(genEndlessWave(rng, i + 1));
  }

  return {
    id: `daily-${seed}`, name: `每日挑战 · ${seed}`,
    themeKey: 'daily',
    accent: 'var(--berry)', accentDeep: 'var(--berry)',
    startSugar: 300, startHp: 20,
    bgPrimary: '#E8D5E0', bgSecondary: '#F0DDE8',
    pathGrid: path,
    pathStyle: { outer: '#B79CD1', inner: '#D9C5E8', sprinkles: ['#F8E060','#FFB5C5','#A8D9C0','#B79CD1','#F5B872'] },
    availableTowers: ['cookie','cupcake','macaron','donut','icecream','cake','wall'],
    decorations: [
      { type: 'starTwinkle', gx: 0, gy: 0 }, { type: 'starTwinkle', gx: 14, gy: 0 },
      { type: 'lollipopFlower', gx: 4, gy: 8 }, { type: 'lollipopFlower', gx: 11, gy: 8 },
    ],
    obstacles,
    waves,
    daily: true,
    seed,
  };
}
