import { TOWER_DEFS, PREP_DURATION, OBSTACLE_HP, OBSTACLE_REWARD, T } from './constants.js';
import { buildPath } from './path.js';

export function initWorld(level) {
  let id = 1;
  const obstacles = (level.obstacles || []).map(([gx, gy]) => ({
    id: id++, gx, gy,
    hp: OBSTACLE_HP, maxHp: OBSTACLE_HP,
    reward: OBSTACLE_REWARD,
    flash: 0,
  }));
  // Multi-path support: level.paths (array) takes precedence; fall back to single pathGrid.
  const pathGrids = (level.paths && level.paths.length) ? level.paths : [level.pathGrid];
  const paths = pathGrids.map(g => buildPath(g, T));
  return {
    level,
    paths,              // array of path objects (length 1 for normal levels)
    path: paths[0],     // backward-compat alias for single-path consumers
    hp: level.startHp,
    sugar: level.startSugar,
    waveIdx: 0,
    waveState: 'preparing',
    waveTimer: -PREP_DURATION,
    spawnQueue: [],
    speed: 1,
    enemies: [],
    towers: [],
    walls: [],          // path-blocking nougat walls
    obstacles,          // chocolate boulders — destructible, reward when broken
    projectiles: [],
    floats: [],
    flashes: [],
    bursts: [],
    beams: [],          // beam / chain-lightning visuals (short-lived lines)
    shockwaves: [],     // icecream wave + banana charge-release rings
    selectedTowerType: null,
    selectedPlacedTower: null,
    focus: null,        // {kind: 'enemy'|'obstacle', id} — manual focus-fire target
    events: [],         // accumulated per-tick gameplay events for downstream consumers
    nextId: id,
    enemiesKilled: 0,
    sugarEarned: 0,
    elapsed: 0,
    finished: null,
    damageByType: {},   // enemy_type -> total castle damage dealt this run

    // Endless / daily run metadata
    score: 0,
    combo: 0,
    bestCombo: 0,
    lastKillAt: -10,
    // T3 tidal cursor — null means "compute first trigger time on first tick"
    tidalNextAt: null,
    // T6 frozen cells (gx,gy) reduce tower fire rate when placed there.
    frozenSet: level.frozenCells ? new Set(level.frozenCells.map(([x, y]) => `${x},${y}`)) : null,
  };
}

export const COMBO_TIMEOUT = 4.0;

// A wall might cover one or both paths (in multipath levels). Store dist
// per-path so each enemy on each path can find its own next wall.
export function placeWall(w, def, gx, gy) {
  const pathDists = [];
  for (let i = 0; i < w.paths.length; i++) {
    const d = w.paths[i].distAtCell(gx, gy);
    if (d >= 0) pathDists.push({ pathIdx: i, dist: d });
  }
  return {
    id: w.nextId++,
    gx, gy,
    pathDists,                                   // [{pathIdx, dist}, ...]
    dist: pathDists[0] ? pathDists[0].dist : 0,  // legacy alias
    hp: def.hp,
    maxHp: def.hp,
    flash: 0,
  };
}

export function isAnyPathCell(w, gx, gy) {
  return w.paths.some(p => p.isPathCell(gx, gy));
}

// Buff geometries — each tower's synergy declares which cells it reaches.
// Cells are returned as [dx, dy] offsets relative to the buffing tower.
const NEIGHBOR_8 = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1],
];
const ORTHOGONAL_4 = [
            [0, -1],
  [-1,  0],          [1,  0],
            [0,  1],
];
const DIAGONAL_4 = [
  [-1, -1],          [1, -1],
  [-1,  1],          [1,  1],
];
// Row / column / circle are computed dynamically from board dims.
function rowOffsets() {
  const out = [];
  for (let dx = -15; dx <= 15; dx++) if (dx !== 0) out.push([dx, 0]);
  return out;
}
function colOffsets() {
  const out = [];
  for (let dy = -8; dy <= 8; dy++) if (dy !== 0) out.push([0, dy]);
  return out;
}
function circle2Offsets() {
  const out = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      if (dx * dx + dy * dy <= 4) out.push([dx, dy]);  // r=2 disc
    }
  }
  return out;
}

// Each geometry: from tower at (gx, gy), the cells it BUFFS are tw + offset.
// To compute who buffs ME: I look at neighbours, ask whether their geometry
// would emit me. So we store the offset table and check inversely.
const GEOM_OFFSETS = {
  neighbor8:    NEIGHBOR_8,
  orthogonal4:  ORTHOGONAL_4,
  diagonal4:    DIAGONAL_4,
  row:          rowOffsets(),
  column:       colOffsets(),
  circle2:      circle2Offsets(),
};

function buffsFromGeometry(geom) {
  return GEOM_OFFSETS[geom] || NEIGHBOR_8;
}

// All synergy fields a tower may emit.  Anything not listed defaults to 0.
const SYNERGY_FIELDS = [
  'dmgMul', 'rangeMul', 'cdMul', 'splashMul',
  'critChance', 'multiShot', 'executeBonus',
  'stunChance', 'stunDuration',
  'statusDuration', 'slowFactor', 'dotDamage',
  'knockback',
];

// Compute additive synergy buffs from neighbouring towers, respecting each
// tower's `synergy.geometry` field (defaults to 8-neighbor).
export function neighborBuffs(tw, w) {
  const buff = SYNERGY_FIELDS.reduce((acc, k) => (acc[k] = 0, acc), {});
  buff.count = 0;
  if (!w || !w.towers) return buff;
  for (const nb of w.towers) {
    if (nb.id === tw.id) continue;
    const ndef = TOWER_DEFS[nb.type];
    const s = ndef && ndef.synergy;
    if (!s) continue;
    const offsets = buffsFromGeometry(s.geometry);
    const reaches = offsets.some(([dx, dy]) =>
      nb.gx + dx === tw.gx && nb.gy + dy === tw.gy);
    if (!reaches) continue;
    for (const k of SYNERGY_FIELDS) {
      if (s[k] != null) buff[k] += s[k];
    }
    buff.count += 1;
  }
  return buff;
}

export function isFrozenCell(w, gx, gy) {
  return w.frozenSet ? w.frozenSet.has(`${gx},${gy}`) : false;
}

export function towerStats(tw, w) {
  const def = TOWER_DEFS[tw.type];
  const lvl = tw.level;
  const lvlDmg = lvl === 1 ? 1 : lvl === 2 ? 1.5 : 2.25;
  const lvlRange = lvl === 1 ? 1 : lvl === 2 ? 1.12 : 1.25;
  const lvlCd = lvl === 1 ? 1 : lvl === 2 ? 0.92 : 0.82;
  const buff = neighborBuffs(tw, w);
  const isFrozen = isFrozenCell(w, tw.gx, tw.gy);
  const frozenCdMul = isFrozen ? 1.4 : 1;
  const frozenRangeMul = isFrozen ? 1.15 : 1;
  const frozenSplashMul = isFrozen ? 1.15 : 1;
  // Status durations get extended by both the tower's own duration buff and by
  // synergy-provided +duration / +stun-duration. Slow factor synergy LOWERS the
  // factor (0.5 → 0.45 means slower enemies). Knockback adds flat distance.
  const statusMul = 1 + (buff.statusDuration || 0);
  const slowOut = def.slow ? {
    factor: Math.max(0.05, def.slow.factor + (buff.slowFactor || 0)),
    duration: def.slow.duration * statusMul,
  } : undefined;
  const stunOut = def.stun ? def.stun * statusMul + (buff.stunDuration || 0) : undefined;
  return {
    dmg: def.dmg * lvlDmg * (1 + buff.dmgMul),
    range: def.range * lvlRange * (1 + buff.rangeMul) * frozenRangeMul,
    cd: def.cd * lvlCd * (1 + buff.cdMul) * frozenCdMul,
    splash: def.splash != null ? def.splash * (1 + buff.splashMul) * frozenSplashMul : undefined,
    slow: slowOut,
    stun: stunOut,
    chainBounce: def.chainBounce,
    knockback: def.knockback != null ? def.knockback + (buff.knockback || 0) : undefined,
    proj: def.proj,
    // New mechanic-driven fields. Each is summed: buff value + tower base.
    critChance: (def.critChance || 0) + (buff.critChance || 0),
    critMul: def.critMul || 2.0,
    multiShot: (def.multiShot || 0) + (buff.multiShot || 0),
    executeBonus: buff.executeBonus || 0,           // applied at hit time when target hp ≤ executeThreshold
    executeThreshold: 0.30,
    extraStunChance: buff.stunChance || 0,
    dotBonus: buff.dotDamage || 0,
    attackKind: def.attackKind || 'point',
    buff,
    frozen: isFrozen,
  };
}

export function upgradeCost(tw) {
  const base = TOWER_DEFS[tw.type].cost;
  if (tw.level === 1) return Math.round(base * 1.4);
  if (tw.level === 2) return Math.round(base * 2.2);
  return null;
}

export function sellRefund(tw) {
  return Math.round(tw.invested * 0.5);
}
