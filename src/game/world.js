import { TOWER_DEFS, PREP_DURATION, OBSTACLE_HP, OBSTACLE_REWARD } from './constants.js';
import { distAtCell } from './path.js';

export function initWorld(level) {
  let id = 1;
  const obstacles = (level.obstacles || []).map(([gx, gy]) => ({
    id: id++, gx, gy,
    hp: OBSTACLE_HP, maxHp: OBSTACLE_HP,
    reward: OBSTACLE_REWARD,
    flash: 0,
  }));
  return {
    level,
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
    nextId: id,
    enemiesKilled: 0,
    sugarEarned: 0,
    elapsed: 0,
    finished: null,
  };
}

export function placeWall(w, def, gx, gy) {
  const dist = distAtCell(gx, gy);
  return {
    id: w.nextId++,
    gx, gy,
    dist,
    hp: def.hp,
    maxHp: def.hp,
    flash: 0,
  };
}

export function towerStats(tw) {
  const def = TOWER_DEFS[tw.type];
  const lvl = tw.level;
  const dmgMul = lvl === 1 ? 1 : lvl === 2 ? 1.5 : 2.25;
  const rangeMul = lvl === 1 ? 1 : lvl === 2 ? 1.12 : 1.25;
  const cdMul = lvl === 1 ? 1 : lvl === 2 ? 0.92 : 0.82;
  return {
    dmg: def.dmg * dmgMul,
    range: def.range * rangeMul,
    cd: def.cd * cdMul,
    splash: def.splash,
    slow: def.slow,
    stun: def.stun,
    proj: def.proj,
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
