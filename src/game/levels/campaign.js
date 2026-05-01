// 60-level campaign: 6 themes × 10 sub-levels.
// Each entry uses theme defaults + path id + wave list. Mechanic-specific
// fields (paths, conveyorBoost, frozenCells, tidal) opt-in per level.

import { rush, rushHeavy, mixed2, mixed3, mixed4, bossWave, bossFinaleWave, skyRush, armoredPush, splitterChaos, healerEscort } from './waveTemplates.js';

// Compact level spec: arrays of [pathId, [...waves], extras?]
// extras can carry obstacles, mechanic-specific data, optional sugar/hp overrides.

// === Theme 1: 糖霜花园 (basics, gentle ramp) ===
const T1 = [
  // L1-1 — first ever level (kept very gentle for new players)
  { path: 'gentle-s', startSugar: 250, waves: [
      rush('mouse', 0.7),
      mixed2('mouse', 'rabbit', 0.7),
      mixed3('mouse', 'rabbit', 'hedgehog', 0.7),
      mixed4('mouse', 'rabbit', 'fox', 'raccoon', 0.75),
      bossWave('mouse', 8, 1, 0.8),
    ], obstacles: [[1,3],[5,1],[10,3]] },
  // L1-2 — rabbit emphasis
  { path: 'gentle-s-flip', startSugar: 240, waves: [
      rush('mouse', 0.8), rush('rabbit', 0.8),
      mixed3('rabbit', 'hedgehog', 'fox', 0.8),
      mixed4('mouse','rabbit','fox','hedgehog', 0.85),
    ], obstacles: [[3,2],[8,4],[12,5]] },
  // L1-3 — stealth intro
  { path: 'winding', startSugar: 250, waves: [
      mixed2('mouse','rabbit', 0.85),
      mixed3('rabbit','squirrel','hedgehog', 0.9),
      mixed3('mouse','fox','raccoon', 0.95),
      bossWave('rabbit', 6, 1, 0.95),
    ], obstacles: [[2,4],[8,3],[13,5]] },
  // L1-4
  { path: 'meander', startSugar: 250, waves: [
      mixed3('mouse','rabbit','hedgehog', 1.0),
      mixed3('rabbit','squirrel','fox', 1.0),
      mixed4('mouse','rabbit','hedgehog','fox', 1.05),
      bossWave('rabbit', 8, 1, 1.05),
    ], obstacles: [[1,4],[6,2],[11,5]] },
  // L1-5
  { path: 'gentle-s', startSugar: 260, waves: [
      mixed3('mouse','rabbit','squirrel', 1.05),
      mixed4('mouse','rabbit','hedgehog','squirrel', 1.05),
      mixed4('rabbit','fox','raccoon','hedgehog', 1.1),
      mixed4('mouse','squirrel','fox','hedgehog', 1.15),
      bossWave('mouse', 10, 1, 1.15),
    ] },
  // L1-6
  { path: 'zigzag', startSugar: 260, waves: [
      mixed3('rabbit','fox','hedgehog', 1.15),
      armoredPush(1.0),
      mixed4('mouse','rabbit','fox','squirrel', 1.2),
      bossWave('hedgehog', 4, 1, 1.2),
    ] },
  // L1-7
  { path: 'rightangle', startSugar: 270, waves: [
      mixed4('mouse','rabbit','fox','raccoon', 1.2),
      mixed4('rabbit','hedgehog','squirrel','fox', 1.25),
      armoredPush(1.1),
      bossWave('fox', 6, 1, 1.25),
    ] },
  // L1-8
  { path: 'descend', startSugar: 280, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.3),
      mixed4('rabbit','squirrel','raccoon','fox', 1.3),
      armoredPush(1.2),
      mixed4('mouse','rabbit','hedgehog','fox', 1.35),
      bossWave('hedgehog', 5, 1, 1.35),
    ] },
  // L1-9 — pre-finale, with two minibosses
  { path: 'long-s', startSugar: 290, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.4),
      armoredPush(1.3),
      mixed4('rabbit','fox','raccoon','hedgehog', 1.4),
      bossWave('fox', 8, 1, 1.4),
      bossWave('rabbit', 6, 1, 1.4),
    ] },
  // L1-10 — theme finale (boss)
  { path: 'gentle-s-flip', startSugar: 300, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.4),
      mixed4('rabbit','squirrel','fox','raccoon', 1.4),
      armoredPush(1.4),
      mixed4('mouse','fox','hedgehog','squirrel', 1.45),
      bossFinaleWave([['mouse', 10], ['rabbit', 6], ['hedgehog', 4]], 1.4),
    ] },
];

// === Theme 2: 饼干森林 (multipath: dual entry) ===
const T2 = [
  { path: 'gentle-s', startSugar: 270, waves: [
      mixed3('mouse','rabbit','hedgehog', 1.0),
      mixed3('rabbit','squirrel','fox', 1.05),
      bossWave('rabbit', 6, 1, 1.0),
    ] },
  // First dual-path level
  { paths: 'dual-A', startSugar: 280, waves: [
      mixed2('mouse','rabbit', 1.0),
      mixed3('mouse','rabbit','hedgehog', 1.0),
      mixed3('rabbit','squirrel','fox', 1.05),
      bossWave('rabbit', 8, 1, 1.05),
    ] },
  { paths: 'dual-A', startSugar: 280, waves: [
      mixed3('mouse','rabbit','squirrel', 1.05),
      mixed3('rabbit','hedgehog','fox', 1.1),
      mixed4('mouse','rabbit','fox','squirrel', 1.1),
      bossWave('hedgehog', 5, 1, 1.1),
    ] },
  { paths: 'dual-B', startSugar: 290, waves: [
      mixed3('rabbit','fox','hedgehog', 1.15),
      armoredPush(1.0),
      mixed4('mouse','rabbit','fox','raccoon', 1.15),
      bossWave('fox', 6, 1, 1.15),
    ] },
  { path: 'winding-flip', startSugar: 280, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.15),
      mixed3('rabbit','hedgehog','fox', 1.2),
      armoredPush(1.15),
      bossWave('hedgehog', 5, 1, 1.2),
    ] },
  { paths: 'dual-B', startSugar: 300, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.2),
      mixed4('rabbit','squirrel','fox','raccoon', 1.25),
      armoredPush(1.2),
      bossWave('fox', 7, 1, 1.25),
    ] },
  { path: 'twisty', startSugar: 300, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.25),
      mixed4('rabbit','squirrel','raccoon','fox', 1.3),
      armoredPush(1.25),
      bossWave('hedgehog', 5, 1, 1.3),
    ] },
  { paths: 'dual-A', startSugar: 310, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.3),
      mixed4('rabbit','fox','hedgehog','raccoon', 1.35),
      armoredPush(1.3),
      mixed4('mouse','squirrel','fox','hedgehog', 1.35),
      bossWave('hedgehog', 6, 1, 1.35),
    ] },
  { path: 'long-s', startSugar: 320, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.4),
      armoredPush(1.4),
      mixed4('mouse','rabbit','fox','raccoon', 1.4),
      bossWave('fox', 8, 1, 1.4),
      bossWave('rabbit', 6, 1, 1.4),
    ] },
  // Theme 2 finale
  { paths: 'dual-B', startSugar: 320, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.4),
      armoredPush(1.4),
      mixed4('rabbit','fox','raccoon','hedgehog', 1.45),
      mixed4('mouse','squirrel','fox','hedgehog', 1.45),
      bossFinaleWave([['mouse', 10], ['rabbit', 8], ['fox', 5], ['hedgehog', 4]], 1.4),
    ] },
];

// === Theme 3: 果冻沼泽 (tidal: periodic mini-waves) ===
const T3 = [
  { path: 'zigzag', startSugar: 280, waves: [
      mixed3('mouse','rabbit','squirrel', 1.1),
      mixed3('rabbit','fox','hedgehog', 1.15),
      bossWave('rabbit', 6, 1, 1.15),
    ], tidal: { period: 18, type: 'mouse', count: 3 } },
  { path: 'meander-flip', startSugar: 290, waves: [
      mixed3('mouse','rabbit','hedgehog', 1.2),
      mixed4('rabbit','squirrel','fox','hedgehog', 1.2),
      bossWave('squirrel', 5, 1, 1.2),
    ], tidal: { period: 16, type: 'mouse', count: 4 } },
  { path: 'twisty', startSugar: 290, waves: [
      mixed3('rabbit','fox','hedgehog', 1.2),
      splitterChaos(1.0),
      mixed4('mouse','rabbit','fox','squirrel', 1.25),
      bossWave('fox', 6, 1, 1.25),
    ], tidal: { period: 16, type: 'rabbit', count: 3 } },
  { path: 'spiral', startSugar: 300, waves: [
      mixed3('rabbit','fox','squirrel', 1.25),
      armoredPush(1.2),
      splitterChaos(1.1),
      bossWave('fox', 7, 1, 1.3),
    ], tidal: { period: 14, type: 'rabbit', count: 4 } },
  { path: 'zigzag-flip', startSugar: 300, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.3),
      mixed3('rabbit','hedgehog','fox', 1.35),
      splitterChaos(1.2),
      bossWave('hedgehog', 5, 1, 1.35),
    ], tidal: { period: 14, type: 'fox', count: 2 } },
  { path: 'long-s', startSugar: 310, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.35),
      splitterChaos(1.3),
      armoredPush(1.3),
      bossWave('fox', 7, 1, 1.4),
    ], tidal: { period: 14, type: 'mouse', count: 5 } },
  { path: 'twisty-flip', startSugar: 320, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.4),
      splitterChaos(1.3),
      mixed4('rabbit','squirrel','fox','raccoon', 1.4),
      bossWave('hedgehog', 6, 1, 1.45),
    ], tidal: { period: 12, type: 'rabbit', count: 4 } },
  { path: 'descend-flip', startSugar: 320, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.45),
      armoredPush(1.45),
      splitterChaos(1.4),
      mixed4('rabbit','fox','raccoon','hedgehog', 1.5),
      bossWave('fox', 7, 1, 1.5),
    ], tidal: { period: 12, type: 'splitter', count: 1 } },
  { path: 'zed', startSugar: 330, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.5),
      splitterChaos(1.5),
      mixed4('mouse','rabbit','fox','raccoon', 1.5),
      bossWave('fox', 8, 1, 1.55),
      bossWave('hedgehog', 5, 1, 1.55),
    ], tidal: { period: 12, type: 'splitter', count: 1 } },
  // T3 finale
  { path: 'zigzag', startSugar: 340, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.55),
      splitterChaos(1.5),
      armoredPush(1.5),
      mixed4('rabbit','fox','hedgehog','raccoon', 1.55),
      bossFinaleWave([['mouse', 12], ['rabbit', 8], ['splitter', 3], ['hedgehog', 4]], 1.5),
    ], tidal: { period: 10, type: 'splitter', count: 1 } },
];

// === Theme 4: 棉花糖云海 (flying priority) ===
const T4 = [
  { path: 'gentle-s', startSugar: 290, waves: [
      skyRush(1.1),
      mixed3('rabbit','pigeon','fox', 1.2),
      bossWave('pigeon', 8, 1, 1.2),
    ] },
  { path: 'meander', startSugar: 300, waves: [
      skyRush(1.2),
      mixed3('rabbit','pigeon','hedgehog', 1.25),
      mixed4('mouse','rabbit','pigeon','fox', 1.25),
      bossWave('pigeon', 8, 1, 1.25),
    ] },
  { path: 'winding', startSugar: 300, waves: [
      mixed3('rabbit','pigeon','fox', 1.3),
      skyRush(1.3),
      mixed4('mouse','rabbit','pigeon','squirrel', 1.3),
      bossWave('pigeon', 10, 1, 1.3),
    ] },
  { path: 'rightangle', startSugar: 310, waves: [
      skyRush(1.35),
      mixed4('mouse','rabbit','pigeon','fox', 1.35),
      armoredPush(1.3),
      bossWave('pigeon', 10, 1, 1.35),
    ] },
  { path: 'descend', startSugar: 310, waves: [
      mixed4('rabbit','pigeon','fox','squirrel', 1.4),
      skyRush(1.4),
      mixed3('rabbit','pigeon','hedgehog', 1.4),
      bossWave('pigeon', 10, 1, 1.4),
    ] },
  { path: 'twisty', startSugar: 320, waves: [
      mixed4('mouse','rabbit','pigeon','fox', 1.45),
      skyRush(1.45),
      armoredPush(1.4),
      bossWave('pigeon', 12, 1, 1.45),
    ] },
  { path: 'zigzag', startSugar: 320, waves: [
      mixed4('rabbit','pigeon','fox','hedgehog', 1.5),
      skyRush(1.5),
      mixed4('mouse','rabbit','pigeon','squirrel', 1.5),
      bossWave('pigeon', 12, 1, 1.5),
    ] },
  { path: 'long-s', startSugar: 330, waves: [
      skyRush(1.55),
      mixed4('rabbit','pigeon','fox','raccoon', 1.55),
      armoredPush(1.5),
      bossWave('pigeon', 14, 1, 1.55),
    ] },
  { path: 'spiral', startSugar: 340, waves: [
      mixed4('mouse','rabbit','pigeon','fox', 1.6),
      skyRush(1.6),
      mixed4('rabbit','pigeon','hedgehog','squirrel', 1.6),
      bossWave('pigeon', 14, 2, 1.6),
    ] },
  // T4 finale
  { path: 'meander-flip', startSugar: 350, waves: [
      mixed4('rabbit','pigeon','fox','hedgehog', 1.65),
      skyRush(1.65),
      armoredPush(1.6),
      mixed4('mouse','rabbit','pigeon','squirrel', 1.65),
      bossFinaleWave([['pigeon', 14], ['rabbit', 8], ['fox', 5], ['hedgehog', 4]], 1.6),
    ] },
];

// === Theme 5: 巧克力工厂 (conveyor: speed-boost path segments) ===
// boost {start:0.4, end:0.7, mul:1.6} expressed as fraction-of-total-distance
const T5 = [
  { path: 'gentle-s', startSugar: 310, waves: [
      mixed3('mouse','rabbit','fox', 1.4),
      armoredPush(1.3),
      mixed4('rabbit','fox','squirrel','hedgehog', 1.4),
      bossWave('fox', 6, 1, 1.45),
    ], conveyor: { start: 0.35, end: 0.65, mul: 1.5 } },
  { path: 'rightangle', startSugar: 310, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.45),
      armoredPush(1.4),
      bossWave('hedgehog', 5, 1, 1.5),
    ], conveyor: { start: 0.4, end: 0.7, mul: 1.6 } },
  { path: 'meander', startSugar: 320, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.5),
      armoredPush(1.45),
      mixed4('mouse','rabbit','fox','raccoon', 1.5),
      bossWave('fox', 7, 1, 1.55),
    ], conveyor: { start: 0.3, end: 0.6, mul: 1.6 } },
  { path: 'twisty', startSugar: 320, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.55),
      armoredPush(1.5),
      bossWave('hedgehog', 5, 1, 1.6),
    ], conveyor: { start: 0.45, end: 0.75, mul: 1.7 } },
  { path: 'zigzag-flip', startSugar: 330, waves: [
      mixed4('rabbit','fox','squirrel','raccoon', 1.6),
      mixed4('mouse','rabbit','fox','hedgehog', 1.6),
      armoredPush(1.55),
      bossWave('fox', 7, 1, 1.65),
    ], conveyor: { start: 0.35, end: 0.65, mul: 1.7 } },
  { path: 'descend', startSugar: 340, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.65),
      armoredPush(1.6),
      mixed4('rabbit','fox','hedgehog','raccoon', 1.65),
      bossWave('hedgehog', 6, 1, 1.7),
    ], conveyor: { start: 0.4, end: 0.7, mul: 1.7 } },
  { path: 'long-s', startSugar: 350, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.7),
      armoredPush(1.65),
      mixed4('mouse','rabbit','fox','raccoon', 1.7),
      bossWave('fox', 8, 1, 1.75),
    ], conveyor: { start: 0.3, end: 0.7, mul: 1.7 } },
  { path: 'rightangle-flip', startSugar: 350, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.75),
      armoredPush(1.7),
      mixed4('rabbit','squirrel','fox','raccoon', 1.75),
      bossWave('hedgehog', 6, 1, 1.8),
    ], conveyor: { start: 0.35, end: 0.7, mul: 1.8 } },
  { path: 'spiral', startSugar: 360, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.8),
      armoredPush(1.75),
      mixed4('mouse','rabbit','fox','raccoon', 1.8),
      bossWave('fox', 8, 1, 1.85),
      bossWave('hedgehog', 5, 1, 1.85),
    ], conveyor: { start: 0.3, end: 0.7, mul: 1.8 } },
  // T5 finale
  { path: 'zed', startSugar: 370, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.85),
      armoredPush(1.85),
      mixed4('rabbit','fox','squirrel','raccoon', 1.85),
      mixed4('mouse','rabbit','fox','hedgehog', 1.9),
      bossFinaleWave([['rabbit', 10], ['fox', 8], ['hedgehog', 5], ['shielded', 4]], 1.8),
    ], conveyor: { start: 0.35, end: 0.75, mul: 1.8 } },
];

// === Theme 6: 冰淇淋雪山 (frozen terrain: some cells slow towers) ===
// frozenCells reduces tower fire rate by 40% when placed there.
const FROZEN_PATTERN_A = [[3,1],[5,3],[8,2],[11,1],[13,3],[2,7],[6,8],[10,7]];
const FROZEN_PATTERN_B = [[4,2],[7,1],[10,3],[13,1],[2,6],[5,7],[9,8],[12,6]];
const FROZEN_PATTERN_C = [[3,1],[6,2],[9,1],[12,3],[1,5],[5,7],[8,8],[11,6],[14,7]];

const T6 = [
  { path: 'gentle-s', startSugar: 330, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.6),
      armoredPush(1.55),
      bossWave('hedgehog', 5, 1, 1.65),
    ], frozenCells: FROZEN_PATTERN_A },
  { path: 'meander', startSugar: 340, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.65),
      armoredPush(1.6),
      mixed4('mouse','rabbit','fox','raccoon', 1.65),
      bossWave('fox', 6, 1, 1.7),
    ], frozenCells: FROZEN_PATTERN_A },
  { path: 'rightangle', startSugar: 340, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.7),
      healerEscort(1.0),
      armoredPush(1.65),
      bossWave('hedgehog', 6, 1, 1.75),
    ], frozenCells: FROZEN_PATTERN_B },
  { path: 'descend', startSugar: 350, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.75),
      healerEscort(1.1),
      armoredPush(1.7),
      bossWave('fox', 7, 1, 1.8),
    ], frozenCells: FROZEN_PATTERN_B },
  { path: 'twisty', startSugar: 350, waves: [
      mixed4('mouse','rabbit','fox','squirrel', 1.8),
      healerEscort(1.2),
      armoredPush(1.75),
      mixed4('rabbit','fox','hedgehog','raccoon', 1.8),
      bossWave('hedgehog', 6, 1, 1.85),
    ], frozenCells: FROZEN_PATTERN_C },
  { path: 'zigzag', startSugar: 360, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.85),
      healerEscort(1.3),
      armoredPush(1.8),
      bossWave('fox', 8, 1, 1.9),
    ], frozenCells: FROZEN_PATTERN_C },
  { path: 'long-s', startSugar: 370, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 1.9),
      armoredPush(1.85),
      healerEscort(1.4),
      mixed4('rabbit','fox','squirrel','raccoon', 1.9),
      bossWave('hedgehog', 7, 1, 1.95),
    ], frozenCells: FROZEN_PATTERN_A },
  { path: 'spiral', startSugar: 380, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 1.95),
      armoredPush(1.9),
      healerEscort(1.5),
      mixed4('mouse','rabbit','fox','raccoon', 1.95),
      bossWave('hedgehog', 7, 1, 2.0),
    ], frozenCells: FROZEN_PATTERN_B },
  { path: 'zed', startSugar: 400, waves: [
      mixed4('mouse','rabbit','fox','hedgehog', 2.0),
      armoredPush(2.0),
      healerEscort(1.6),
      mixed4('rabbit','fox','squirrel','raccoon', 2.0),
      bossWave('fox', 8, 1, 2.05),
      bossWave('hedgehog', 6, 1, 2.05),
    ], frozenCells: FROZEN_PATTERN_C },
  // T6 grand finale — final boss of the whole campaign
  { path: 'descend-flip', startSugar: 420, waves: [
      mixed4('rabbit','fox','squirrel','hedgehog', 2.0),
      healerEscort(1.7),
      armoredPush(2.0),
      mixed4('mouse','rabbit','fox','raccoon', 2.05),
      mixed4('rabbit','fox','hedgehog','squirrel', 2.05),
      bossFinaleWave([['mouse', 16], ['rabbit', 10], ['fox', 8], ['hedgehog', 6], ['shielded', 5], ['splitter', 3], ['healer', 3]], 2.0),
    ], frozenCells: FROZEN_PATTERN_C },
];

export const RAW_CAMPAIGN_BY_THEME = { 1: T1, 2: T2, 3: T3, 4: T4, 5: T5, 6: T6 };
