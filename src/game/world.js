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

const NEIGHBOR_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1],
];

// Compute additive synergy buffs from 8-neighbor towers + walls (walls don't
// contribute synergy in Phase B but the lookup is shared).
export function neighborBuffs(tw, w) {
  let dmgMul = 0, rangeMul = 0, cdMul = 0, splashMul = 0;
  let count = 0;
  if (w && w.towers) {
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const nb = w.towers.find(t => t.id !== tw.id && t.gx === tw.gx + dx && t.gy === tw.gy + dy);
      if (!nb) continue;
      const ndef = TOWER_DEFS[nb.type];
      const s = ndef && ndef.synergy;
      if (!s) continue;
      dmgMul += s.dmgMul || 0;
      rangeMul += s.rangeMul || 0;
      cdMul += s.cdMul || 0;
      splashMul += s.splashMul || 0;
      count += 1;
    }
  }
  return { dmgMul, rangeMul, cdMul, splashMul, count };
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
  // T6 frozen terrain: tower placed on a frozen cell fires 40% slower.
  const frozenMul = isFrozenCell(w, tw.gx, tw.gy) ? 1.4 : 1;
  return {
    dmg: def.dmg * lvlDmg * (1 + buff.dmgMul),
    range: def.range * lvlRange * (1 + buff.rangeMul),
    cd: def.cd * lvlCd * (1 + buff.cdMul) * frozenMul,
    splash: def.splash != null ? def.splash * (1 + buff.splashMul) : undefined,
    slow: def.slow,
    stun: def.stun,
    chainBounce: def.chainBounce,
    knockback: def.knockback,
    proj: def.proj,
    buff,
    frozen: frozenMul > 1,
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
