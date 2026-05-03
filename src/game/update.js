import { T, ENEMY_DEFS, PREP_DURATION, ENGAGE_DIST, TOWER_DEFS } from './constants.js';
import { towerStats, COMBO_TIMEOUT } from './world.js';
import { play, shootSoundFor } from './sfx.js';
import { appendEndlessWave } from './modes.js';

function emit(w, type, payload = {}) {
  w.events.push({ type, ...payload });
}

// === Difficulty curve =====================================================
// Per-run multiplier applied to enemy HP / shield / wallDps / reward.
// T1-1 W1 = 1.00, T6-10 W7 ≈ 2.85.
export function difficultyScale(level, waveIdx) {
  const idx = Math.max(0, waveIdx);
  if (level.endless) return 1.10 * (1 + Math.sqrt(idx) * 0.35);
  if (level.daily) return 1.20 * (1 + idx * 0.06);
  const THEME_MUL = { 1: 1.00, 2: 1.12, 3: 1.25, 4: 1.40, 5: 1.55, 6: 1.75 };
  const themeId = level.themeId || (typeof level.id === 'number' ? level.id : null);
  const base = (themeId && THEME_MUL[themeId]) || 1;
  const sub = 1 + ((level.subLevel || 1) - 1) * 0.03;
  return base * sub * (1 + idx * 0.05);
}

// === Path helpers =========================================================
export function pathOf(w, e) { return w.paths[e.pathIdx || 0]; }
export function posOf(w, e) { return pathOf(w, e).posAt(e.dist); }

// === Enemy spawn ==========================================================
function spawnEnemy(w, type, dist, pathIdx = 0) {
  const def = ENEMY_DEFS[type];
  if (!def) return;
  const scale = difficultyScale(w.level, w.waveIdx);
  const rewardScale = 1 + (scale - 1) * 0.5;
  const hp = Math.max(1, Math.round(def.hp * scale));
  const shield = def.shield ? Math.max(1, Math.round(def.shield * scale)) : 0;
  w.enemies.push({
    id: w.nextId++,
    type,
    dist,
    pathIdx,
    hp,
    maxHp: hp,
    baseSpeed: def.speed,
    reward: Math.max(1, Math.round(def.reward * rewardScale)),
    wallDps: def.wallDps * scale,
    slowUntil: 0, slowFactor: 1,
    stunUntil: 0,
    frozenUntil: 0,
    iceTime: 0,                    // aggregate seconds spent inside icecream range
    flash: 0,
    dead: false,
    shield,
    maxShield: shield,
    shieldBroken: false,
    lastHealAt: 0,
    debuffs: {},                   // { frosting: untilT, acid: untilT } + amount cache
    dotStacks: [],                 // [{ until, dps }]
    dotTickAccum: 0,               // seconds accumulator since last DOT tick
  });
}

// === Wave start ===========================================================
function startWave(w, idx) {
  const wave = w.level.waves[idx];
  const queue = [];
  const numPaths = w.paths.length;
  let groupIdx = 0;
  for (const group of wave) {
    const pathIdx = numPaths > 1 ? (groupIdx % numPaths) : 0;
    for (let i = 0; i < group.count; i++) {
      queue.push({ type: group.type, t: (group.delay || 0) + i * group.interval, pathIdx });
    }
    groupIdx += 1;
  }
  queue.sort((a, b) => a.t - b.t);
  w.spawnQueue = queue;
  w.waveState = 'spawning';
  w.waveTimer = 0;
  emit(w, 'wave_start', { wave: idx + 1 });
  play('wave');
}

// === Visual helpers ========================================================
function spawnFlash(w, x, y, color) {
  w.flashes.push({ id: w.nextId++, x, y, color, t: 0, dur: 0.14 });
}
function spawnBurst(w, x, y, color, count = 6, big = false) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = (big ? 70 : 45) + Math.random() * 30;
    const colors = [color, '#FFE5EC', '#FFF1C4'];
    particles.push({ angle, speed, color: colors[i % colors.length], r: big ? 4 : 3 });
  }
  w.bursts.push({ id: w.nextId++, x, y, t: 0, dur: 0.40, particles });
}

// === Damage application ===================================================
// `opts` may carry: dmg, slow, stun, knockback, debuff, dot, critChance, critMul,
// executeBonus, executeThreshold, extraStunChance, dotBonus.
function applyDamage(w, enemy, baseDmg, opts) {
  const def = ENEMY_DEFS[enemy.type];
  const ep = posOf(w, enemy);
  if (def.dodge && Math.random() < def.dodge) {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 22, text: '闪避', color: '#B79CD1', t: 0 });
    emit(w, 'enemy_dodged', { enemy_type: enemy.type });
    return false;
  }

  let dmg = baseDmg;
  let isCrit = false;
  // Critical hit
  if (opts && opts.critChance && Math.random() < opts.critChance) {
    dmg *= (opts.critMul || 2.0);
    isCrit = true;
  }
  // Execute bonus when target is at or below threshold
  if (opts && opts.executeBonus) {
    const hpFrac = enemy.hp / enemy.maxHp;
    if (hpFrac <= (opts.executeThreshold || 0.30)) dmg *= 1 + opts.executeBonus;
  }
  // Debuff damage amplification (frosting / acid)
  let debuffMul = 1;
  if (enemy.debuffs?.frosting && enemy.debuffs.frosting > w.elapsed) {
    debuffMul += enemy._frostingAmount || 0;
  }
  if (enemy.debuffs?.acid && enemy.debuffs.acid > w.elapsed) {
    debuffMul += enemy._acidAmount || 0;
  }
  dmg *= debuffMul;

  // Shield first
  if (enemy.shield > 0) {
    const absorbed = Math.min(enemy.shield, dmg);
    enemy.shield -= absorbed;
    dmg -= absorbed;
    enemy.flash = 0.13;
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 24, text: `盾-${Math.round(absorbed)}`, color: '#7BB6E0', t: 0 });
    if (enemy.shield <= 0 && enemy.maxShield > 0 && !enemy.shieldBroken) {
      enemy.shieldBroken = true;
      spawnBurst(w, ep.x, ep.y, '#A8D9C0', 9, false);
      emit(w, 'shield_broken', { enemy_type: enemy.type });
    }
    if (dmg <= 0) return true;
  }

  enemy.hp -= dmg;
  enemy.flash = 0.13;
  if (isCrit) {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 28, text: `暴击 ${Math.round(dmg)}`, color: '#F8E060', t: 0 });
  } else {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 24, text: `-${Math.round(dmg)}`, color: '#E85A7A', t: 0 });
  }

  // Status effects
  if (opts && opts.slow && !def.boss) {
    enemy.slowUntil = w.elapsed + opts.slow.duration;
    enemy.slowFactor = opts.slow.factor;
  }
  if (opts && opts.stun && !def.boss) {
    enemy.stunUntil = w.elapsed + opts.stun;
  }
  if (opts && opts.extraStunChance && !def.boss && Math.random() < opts.extraStunChance) {
    enemy.stunUntil = Math.max(enemy.stunUntil, w.elapsed + 0.5);
  }
  if (opts && opts.knockback && !def.boss) {
    enemy.dist = Math.max(0, enemy.dist - opts.knockback);
  }
  // Frosting / acid debuff (defensive cap on duration)
  if (opts && opts.debuff && !def.boss) {
    enemy.debuffs = enemy.debuffs || {};
    enemy.debuffs[opts.debuff.kind] = w.elapsed + opts.debuff.duration;
    enemy[`_${opts.debuff.kind}Amount`] = opts.debuff.amount;
  }
  // Damage-over-time stacks
  if (opts && opts.dot && !def.boss) {
    enemy.dotStacks = enemy.dotStacks || [];
    const dps = opts.dot.dps * (1 + (opts.dotBonus || 0));
    enemy.dotStacks.push({ until: w.elapsed + opts.dot.duration, dps });
    while (enemy.dotStacks.length > (opts.dot.maxStacks || 5)) enemy.dotStacks.shift();
  }
  return true;
}

// === Tower attack helpers (one per attackKind) ============================
function pickFrontTarget(w, tw, rangePx, focusTarget, focusKind, focusPos) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  if (focusTarget && focusPos) {
    const d = Math.hypot(focusPos.x - tx, focusPos.y - ty);
    if (d <= rangePx) return { chosen: focusTarget, kind: focusKind, pos: focusPos };
  }
  let best = null, bestProgress = -1;
  for (const e of w.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const ep = posOf(w, e);
    const d = Math.hypot(ep.x - tx, ep.y - ty);
    if (d <= rangePx && e.dist > bestProgress) { best = e; bestProgress = e.dist; }
  }
  if (best) return { chosen: best, kind: 'enemy', pos: posOf(w, best) };
  return null;
}

// Build the opts payload that applyDamage understands from a tower's stats.
function damageOpts(tw, stats) {
  const def = TOWER_DEFS[tw.type];
  return {
    slow: stats.slow,
    stun: stats.stun,
    knockback: stats.knockback,
    debuff: def.debuff,
    dot: def.dot,
    critChance: stats.critChance,
    critMul: stats.critMul,
    executeBonus: stats.executeBonus,
    executeThreshold: stats.executeThreshold,
    extraStunChance: stats.extraStunChance,
    dotBonus: stats.dotBonus,
  };
}

function firePoint(w, tw, stats, target) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  w.projectiles.push({
    id: w.nextId++,
    fromX: tx, fromY: ty, toX: target.pos.x, toY: target.pos.y,
    targetId: target.chosen.id, targetKind: target.kind,
    t: 0, duration: tw.type === 'cake' ? 0.20 : 0.16,
    color: stats.proj, size: tw.type === 'cake' ? 9 : 6,
    dmg: stats.dmg, splash: stats.splash || undefined,
    onKillSplash: TOWER_DEFS[tw.type].onKillSplash,
    opts: damageOpts(tw, stats),
    towerType: tw.type,
  });
  spawnFlash(w, tx, ty, stats.proj);
}

function fireSplash(w, tw, stats, target) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  w.projectiles.push({
    id: w.nextId++,
    fromX: tx, fromY: ty, toX: target.pos.x, toY: target.pos.y,
    targetId: target.chosen.id, targetKind: target.kind,
    t: 0, duration: 0.18, color: stats.proj, size: 8,
    dmg: stats.dmg, splash: stats.splash,
    opts: damageOpts(tw, stats),
    towerType: tw.type,
  });
  spawnFlash(w, tx, ty, stats.proj);
}

function fireMultiSplash(w, tw, stats, target) {
  const def = TOWER_DEFS[tw.type];
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  const count = def.splashCount || 3;
  const spreadPx = (def.splashSpread || 1.0) * T;
  const angle0 = Math.atan2(target.pos.y - ty, target.pos.x - tx);
  for (let i = 0; i < count; i++) {
    const offsetAngle = angle0 + (i - (count - 1) / 2) * 0.45;
    const r = Math.hypot(target.pos.x - tx, target.pos.y - ty);
    const ax = tx + Math.cos(offsetAngle) * r + (Math.random() - 0.5) * spreadPx;
    const ay = ty + Math.sin(offsetAngle) * r + (Math.random() - 0.5) * spreadPx;
    w.projectiles.push({
      id: w.nextId++,
      fromX: tx, fromY: ty, toX: ax, toY: ay,
      targetId: -1, targetKind: 'aoe',          // aoe = no primary, splash on land
      t: 0, duration: 0.18, color: stats.proj, size: 5,
      dmg: stats.dmg, splash: stats.splash,
      opts: damageOpts(tw, stats),
      towerType: tw.type,
    });
  }
  spawnFlash(w, tx, ty, stats.proj);
}

function fireChainBounce(w, tw, stats, target) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  w.projectiles.push({
    id: w.nextId++,
    fromX: tx, fromY: ty, toX: target.pos.x, toY: target.pos.y,
    targetId: target.chosen.id, targetKind: target.kind,
    t: 0, duration: 0.16, color: stats.proj, size: 6,
    dmg: stats.dmg,
    chainBounce: stats.chainBounce,
    doubleTapChance: TOWER_DEFS[tw.type].doubleTapChance,
    opts: damageOpts(tw, stats),
    towerType: tw.type,
  });
  spawnFlash(w, tx, ty, stats.proj);
}

// Pierce: a real, traveling projectile that flies in a straight line from the
// tower in the chosen direction, hitting each enemy it touches once along the
// way (with damage falloff per pierce). NOT instant — the player sees the
// macaron physically fly across the board.
function fireBeam(w, tw, stats, target) {
  const def = TOWER_DEFS[tw.type];
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  const dx = target.pos.x - tx, dy = target.pos.y - ty;
  const len = Math.hypot(dx, dy);
  if (len === 0) return;
  const ux = dx / len, uy = dy / len;
  const rangePx = stats.range * T;
  w.projectiles.push({
    id: w.nextId++,
    pierce: true,                              // marker for tick-based hit logic
    fromX: tx, fromY: ty,
    angle: Math.atan2(dy, dx),
    travelPx: rangePx,                         // total distance to fly
    speedPx: 760,                              // px / sec — fast but visible
    dmg: stats.dmg,
    pierceCount: def.pierce || 4,
    pierceFalloff: def.pierceFalloff || 0.7,
    pierceLeft: def.pierce || 4,
    color: stats.proj, size: 8,
    opts: damageOpts(tw, stats),
    towerType: tw.type,
    hitIds: new Set(),
    travelled: 0,
    x: tx, y: ty,
    ux, uy,
  });
  spawnFlash(w, tx, ty, stats.proj);
}

// Chain lightning: instant, hits up to (level) enemies in range, applies DOT.
function fireChain(w, tw, stats, target) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  const rangePx = stats.range * T;
  const maxTargets = tw.level;          // level controls chain length
  // Start from chosen (front-most) target, then chain to nearest others.
  const visited = new Set();
  const chain = [];
  let prevX = tx, prevY = ty;
  let prev = target;
  while (chain.length < maxTargets && prev) {
    visited.add(prev.chosen.id);
    chain.push(prev);
    // Next nearest enemy in tower range
    let next = null, bestD = Infinity;
    for (const e of w.enemies) {
      if (e.dead || e.hp <= 0 || visited.has(e.id)) continue;
      const ep = posOf(w, e);
      const d = Math.hypot(ep.x - tx, ep.y - ty);
      if (d > rangePx) continue;
      const dPrev = Math.hypot(ep.x - prev.pos.x, ep.y - prev.pos.y);
      if (dPrev < bestD) { bestD = dPrev; next = { chosen: e, kind: 'enemy', pos: ep }; }
    }
    prev = next;
  }
  // Apply damage + DOT to each, draw lightning links visually.
  const opts = damageOpts(tw, stats);
  w.beams = w.beams || [];
  for (let i = 0; i < chain.length; i++) {
    const c = chain[i];
    if (c.kind === 'enemy') applyDamage(w, c.chosen, stats.dmg, opts);
    spawnBurst(w, c.pos.x, c.pos.y, stats.proj, 4, false);
    w.beams.push({
      id: w.nextId++,
      fromX: prevX, fromY: prevY, toX: c.pos.x, toY: c.pos.y,
      color: stats.proj, t: 0, dur: 0.16, jagged: true,
    });
    prevX = c.pos.x; prevY = c.pos.y;
  }
  spawnFlash(w, tx, ty, stats.proj);
}

// Boomerang: spawns a circling projectile that orbits the tower in a full
// 360° loop. Hits any enemy crossing the orbit ring, each enemy at most once.
// Better than an arc — guarantees coverage in every direction.
function fireBoomerang(w, tw, stats, target) {
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  // Orbit radius scales with effective range (clamped) — bigger tower → bigger circle.
  const orbitR = Math.min(stats.range * T * 0.85, T * 2.6);
  const dx = target.pos.x - tx, dy = target.pos.y - ty;
  const startAng = Math.atan2(dy, dx);
  w.projectiles.push({
    id: w.nextId++,
    boomerang: true,
    centerX: tx, centerY: ty,
    orbitR,
    startAng,
    t: 0, duration: 1.4,                // full circle in 1.4s
    color: stats.proj, size: 9,
    dmg: stats.dmg,
    opts: damageOpts(tw, stats),
    towerType: tw.type,
    hitIds: new Set(),
    fromX: tx, fromY: ty,                // legacy fields for renderer fallback
  });
  spawnFlash(w, tx, ty, stats.proj);
}

// Wave: periodic expanding shockwave from tower; damages + slows enemies in
// range. Long stays inside icecream's range trigger freeze (handled in tick).
function fireWave(w, tw, stats) {
  const def = TOWER_DEFS[tw.type];
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  w.shockwaves = w.shockwaves || [];
  w.shockwaves.push({
    id: w.nextId++,
    x: tx, y: ty,
    maxR: stats.range * T,
    t: 0, dur: 0.50,
    color: stats.proj,
    dmg: def.waveDamage || 4,
    slow: stats.slow || def.waveSlow,
    hitIds: new Set(),
    opts: damageOpts(tw, stats),
  });
  spawnFlash(w, tx, ty, stats.proj);
}

// Melee: each cd, hit closest enemy in 1-tile radius and bank a charge.
// At chargeNeeded charges, release a circular AOE.
function fireMelee(w, tw, stats, target) {
  const def = TOWER_DEFS[tw.type];
  const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
  const opts = damageOpts(tw, stats);
  // Apply damage to chosen target
  if (target.kind === 'enemy') applyDamage(w, target.chosen, stats.dmg, opts);
  spawnBurst(w, target.pos.x, target.pos.y, stats.proj, 5, false);
  tw.charge = (tw.charge || 0) + 1;
  // When charged, release AOE around the tower
  if (tw.charge >= (def.chargeNeeded || 5)) {
    tw.charge = 0;
    const radius = (def.chargeRadius || 1.5) * T;
    for (const e of w.enemies) {
      if (e.dead || e.hp <= 0) continue;
      const ep = posOf(w, e);
      const d = Math.hypot(ep.x - tx, ep.y - ty);
      if (d <= radius) {
        applyDamage(w, e, def.chargeDamage || 32, { ...opts, knockback: stats.knockback });
      }
    }
    spawnBurst(w, tx, ty, '#FFE066', 14, true);
    w.shockwaves = w.shockwaves || [];
    w.shockwaves.push({
      id: w.nextId++, x: tx, y: ty, maxR: radius,
      t: 0, dur: 0.35, color: '#FFE066',
      dmg: 0, hitIds: new Set(), opts,                   // visual-only ring
    });
    play('splash');
  }
}

// === Main update tick =====================================================
export function update(w, rawDt) {
  if (w.events.length > 256) w.events.splice(0, w.events.length - 256);
  if (w.finished) return;
  if (w.speed === 0) return;
  const dt = rawDt * w.speed;
  w.elapsed += dt;
  w.waveTimer += dt;

  if (w.waveState === 'preparing' && w.waveTimer >= 0) startWave(w, w.waveIdx);

  if (w.waveState === 'spawning') {
    while (w.spawnQueue.length && w.spawnQueue[0].t <= w.waveTimer) {
      const spawn = w.spawnQueue.shift();
      spawnEnemy(w, spawn.type, 0, spawn.pathIdx || 0);
    }
    if (!w.spawnQueue.length) w.waveState = 'active';
  }

  // T3 tidal mini-waves
  const tidal = w.level.tidal;
  if (tidal && w.waveState !== 'preparing' && !w.finished) {
    if (w.tidalNextAt == null) w.tidalNextAt = w.elapsed + tidal.period;
    if (w.elapsed >= w.tidalNextAt) {
      w.tidalNextAt = w.elapsed + tidal.period;
      const numPaths = w.paths.length;
      for (let i = 0; i < tidal.count; i++) {
        spawnEnemy(w, tidal.type, -i * 25, i % numPaths);
      }
      const entry = w.paths[0].points[0];
      w.floats.push({ id: w.nextId++, x: entry.x + 30, y: entry.y - 30, text: '潮汐!', color: '#7BB6E0', t: 0 });
      emit(w, 'tidal_pulse', { type: tidal.type, count: tidal.count });
    }
  }

  // === Wall collision per-path ============================================
  const wallsByPath = w.walls.length ? w.paths.map((_, pi) =>
    w.walls
      .map(wl => {
        const slot = wl.pathDists && wl.pathDists.find(p => p.pathIdx === pi);
        return slot ? { wall: wl, dist: slot.dist } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.dist - b.dist)
  ) : null;

  // === Enemy update =======================================================
  for (const e of w.enemies) {
    if (e.dead || e.hp <= 0) continue;
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
    const def = ENEMY_DEFS[e.type];
    const ePath = pathOf(w, e);

    // Healer pulse
    if (def.heal && (e.lastHealAt || 0) + def.heal.rate <= w.elapsed) {
      const ep0 = posOf(w, e);
      const radPx = def.heal.radius * T;
      let healed = false;
      for (const other of w.enemies) {
        if (other.dead || other === e) continue;
        if (other.hp >= other.maxHp) continue;
        const op = posOf(w, other);
        const d = Math.hypot(ep0.x - op.x, ep0.y - op.y);
        if (d <= radPx) {
          other.hp = Math.min(other.maxHp, other.hp + def.heal.amount);
          w.floats.push({ id: w.nextId++, x: op.x, y: op.y - 28, text: `+${def.heal.amount}`, color: '#7BC4A0', t: 0 });
          healed = true;
        }
      }
      if (healed) spawnBurst(w, ep0.x, ep0.y, '#7BC4A0', 5, false);
      e.lastHealAt = w.elapsed;
    }

    // DOT: apply pending stack damage in 0.5s ticks
    if (e.dotStacks && e.dotStacks.length) {
      e.dotStacks = e.dotStacks.filter(s => s.until > w.elapsed);
      e.dotTickAccum = (e.dotTickAccum || 0) + dt;
      while (e.dotTickAccum >= 0.5 && e.dotStacks.length) {
        e.dotTickAccum -= 0.5;
        const totalDps = e.dotStacks.reduce((a, s) => a + s.dps, 0);
        const tickDmg = totalDps * 0.5;
        e.hp -= tickDmg;
        const ep = posOf(w, e);
        w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 18, text: `🔥${Math.round(tickDmg)}`, color: '#FF7A4D', t: 0 });
      }
    }

    // Frozen / stunned blocks movement (frozen is just stronger stun)
    const stunned = w.elapsed < e.stunUntil || w.elapsed < e.frozenUntil;
    if (stunned) continue;

    const slow = w.elapsed < e.slowUntil ? e.slowFactor : 1;
    const conveyor = w.level.conveyor;
    let speedMul = 1;
    if (conveyor && ePath.total > 0) {
      const frac = e.dist / ePath.total;
      if (frac >= conveyor.start && frac <= conveyor.end) speedMul = conveyor.mul;
    }
    let newDist = e.dist + def.speed * T * slow * speedMul * dt;

    // Walls
    if (wallsByPath) {
      const lane = wallsByPath[e.pathIdx || 0];
      const nextItem = lane && lane.find(item => !item.wall.dead && item.dist > e.dist - 4);
      if (nextItem) {
        const stopDist = nextItem.dist - ENGAGE_DIST;
        if (newDist >= stopDist) {
          newDist = Math.min(newDist, stopDist);
          nextItem.wall.hp -= e.wallDps * dt;
          nextItem.wall.flash = 0.12;
          if (nextItem.wall.hp <= 0) {
            nextItem.wall.dead = true;
            const wp = ePath.posAt(nextItem.dist);
            spawnBurst(w, wp.x, wp.y, '#F5DEB3', 12, true);
            emit(w, 'wall_destroyed', { gx: nextItem.wall.gx, gy: nextItem.wall.gy });
            play('splash');
          }
        }
      }
    }

    e.dist = newDist;

    if (e.dist >= ePath.total) {
      w.hp -= def.damage;
      w.damageByType[e.type] = (w.damageByType[e.type] || 0) + def.damage;
      if (def.steal) w.sugar = Math.max(0, w.sugar - def.steal);
      e.dead = true;
      e.reachedCastle = true;
      w.combo = 0;
      emit(w, 'enemy_reached_castle', { enemy_type: e.type });
      if (w.hp <= 0) {
        w.hp = 0;
        w.finished = 'lose';
        emit(w, 'level_lost');
        play('lose');
      }
    }
  }

  for (const wl of w.walls) {
    if (wl.flash > 0) wl.flash = Math.max(0, wl.flash - dt);
  }
  w.walls = w.walls.filter(wl => !wl.dead);

  // === Icecream aura: track per-enemy time inside any wave-tower's range, freeze if exceeded
  const iceTowers = w.towers.filter(t => TOWER_DEFS[t.type].attackKind === 'wave');
  if (iceTowers.length) {
    for (const e of w.enemies) {
      if (e.dead || e.hp <= 0) continue;
      const ep = posOf(w, e);
      let inside = false;
      for (const tw of iceTowers) {
        const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
        const stats = towerStats(tw, w);
        if (Math.hypot(ep.x - tx, ep.y - ty) <= stats.range * T) { inside = true; break; }
      }
      if (inside) {
        e.iceTime = (e.iceTime || 0) + dt;
        const def = ENEMY_DEFS[e.type];
        if (!def.boss && e.iceTime >= 3.0) {
          e.frozenUntil = Math.max(e.frozenUntil || 0, w.elapsed + 1.5);
          e.iceTime = 0;
          w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 24, text: '冻结', color: '#7BB6E0', t: 0 });
          spawnBurst(w, ep.x, ep.y, '#A8D9C0', 8, false);
        }
      } else {
        e.iceTime = Math.max(0, (e.iceTime || 0) - dt * 0.5);    // decay when out
      }
    }
  }

  // Resolve focus target
  let focusTarget = null, focusKind = null, focusPos = null;
  if (w.focus) {
    if (w.focus.kind === 'enemy') {
      const ent = w.enemies.find(e => e.id === w.focus.id && !e.dead && e.hp > 0);
      if (ent) { focusTarget = ent; focusKind = 'enemy'; focusPos = posOf(w, ent); }
    } else if (w.focus.kind === 'obstacle') {
      const ob = w.obstacles.find(o => o.id === w.focus.id);
      if (ob) { focusTarget = ob; focusKind = 'obstacle'; focusPos = { x: ob.gx * T + T / 2, y: ob.gy * T + T / 2 }; }
    }
    if (!focusTarget) w.focus = null;
  }

  // === Tower fire dispatch ================================================
  for (const tw of w.towers) {
    const stats = towerStats(tw, w);
    tw.cooldown = Math.max(0, (tw.cooldown || 0) - dt);
    if (tw.shootPulse > 0) tw.shootPulse = Math.max(0, tw.shootPulse - dt);
    if (tw.cooldown > 0) continue;

    const rangePx = stats.range * T;

    // Wave attack (icecream): fires regardless of target
    if (stats.attackKind === 'wave') {
      fireWave(w, tw, stats);
      tw.cooldown = stats.cd;
      tw.shootPulse = 0.20;
      continue;
    }

    // All other kinds need a target
    const target = pickFrontTarget(w, tw, rangePx, focusTarget, focusKind, focusPos);
    if (!target) continue;

    switch (stats.attackKind) {
      case 'beam':         fireBeam(w, tw, stats, target); break;
      case 'boomerang':    fireBoomerang(w, tw, stats, target); break;
      case 'chain':        fireChain(w, tw, stats, target); break;
      case 'melee':        fireMelee(w, tw, stats, target); break;
      case 'splash':       fireSplash(w, tw, stats, target); break;
      case 'multiSplash':  fireMultiSplash(w, tw, stats, target); break;
      case 'chainBounce':  fireChainBounce(w, tw, stats, target); break;
      default:             firePoint(w, tw, stats, target);
    }

    tw.cooldown = stats.cd;
    tw.shootPulse = 0.20;
    if (Math.random() < (tw.type === 'choco' ? 0.35 : tw.type === 'cupcake' ? 0.7 : 1)) {
      play(shootSoundFor(tw.type));
    }
  }

  // === Projectile resolution ==============================================
  for (const p of w.projectiles) {
    // Pierce projectile: physical line traveller that hits each enemy once
    // along the way until pierce budget runs out or it exits range.
    if (p.pierce) {
      const step = p.speedPx * dt;
      p.travelled += step;
      p.x += p.ux * step;
      p.y += p.uy * step;
      const HIT_R = 26;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (p.hitIds.has(e.id)) continue;
        const ep = posOf(w, e);
        if (Math.hypot(ep.x - p.x, ep.y - p.y) <= HIT_R) {
          p.hitIds.add(e.id);
          applyDamage(w, e, p.dmg, p.opts);
          spawnBurst(w, ep.x, ep.y, p.color, 4, false);
          p.dmg *= p.pierceFalloff;
          p.pierceLeft -= 1;
          if (p.pierceLeft <= 0) { p.dead = true; break; }
        }
      }
      if (p.travelled >= p.travelPx) p.dead = true;
      continue;
    }

    p.t += dt / p.duration;

    // Boomerang: orbits the tower in a full 360° circle, hits enemies the
    // ring crosses (each enemy once). Guarantees coverage of every direction.
    if (p.boomerang) {
      const ang = p.startAng + p.t * Math.PI * 2;
      const fx = p.centerX + Math.cos(ang) * p.orbitR;
      const fy = p.centerY + Math.sin(ang) * p.orbitR;
      p.x = fx; p.y = fy;
      const HIT_R = 24;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (p.hitIds.has(e.id)) continue;
        const ep = posOf(w, e);
        if (Math.hypot(ep.x - fx, ep.y - fy) <= HIT_R) {
          p.hitIds.add(e.id);
          applyDamage(w, e, p.dmg, p.opts);
          spawnBurst(w, ep.x, ep.y, p.color, 4, false);
        }
      }
      if (p.t >= 1) p.dead = true;
      continue;
    }

    if (p.t < 1) continue;

    let hitX = p.toX, hitY = p.toY;
    let landed = false;
    let primaryEnemyId = null;
    let primaryWasKilled = false;

    if (p.targetKind === 'enemy') {
      const target = w.enemies.find(e => e.id === p.targetId);
      if (target && !target.dead) {
        const ep = posOf(w, target);
        hitX = ep.x; hitY = ep.y;
        const hpBefore = target.hp;
        landed = applyDamage(w, target, p.dmg, p.opts);
        primaryEnemyId = target.id;
        if (target.hp <= 0 && hpBefore > 0) primaryWasKilled = true;
      }
    } else if (p.targetKind === 'obstacle') {
      const ob = w.obstacles.find(o => o.id === p.targetId);
      if (ob) {
        hitX = ob.gx * T + T / 2; hitY = ob.gy * T + T / 2;
        ob.hp -= p.dmg;
        ob.flash = 0.13;
        w.floats.push({ id: w.nextId++, x: hitX, y: hitY - 24, text: `-${Math.round(p.dmg)}`, color: '#E85A7A', t: 0 });
        landed = true;
        if (ob.hp <= 0) {
          w.sugar += ob.reward;
          w.sugarEarned += ob.reward;
          w.obstacles = w.obstacles.filter(o => o.id !== ob.id);
          spawnBurst(w, hitX, hitY, '#A98467', 14, true);
          w.floats.push({ id: w.nextId++, x: hitX, y: hitY - 48, text: `+${ob.reward}`, color: '#F8E060', t: 0 });
          if (w.focus && w.focus.kind === 'obstacle' && w.focus.id === ob.id) w.focus = null;
          emit(w, 'obstacle_destroyed', { gx: ob.gx, gy: ob.gy, reward: ob.reward });
          play('coin');
        }
      }
    }
    // 'aoe' means no primary target — splash only on land position
    if (p.targetKind === 'aoe') landed = true;

    // Splash
    if (p.splash) {
      const r = p.splash * T;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (primaryEnemyId != null && e.id === primaryEnemyId) continue;
        const ep = posOf(w, e);
        const d = Math.hypot(ep.x - hitX, ep.y - hitY);
        if (d <= r) applyDamage(w, e, p.dmg * 0.55, p.opts);
      }
      spawnBurst(w, hitX, hitY, p.color, 10, true);
      play('splash');
    } else if (p.targetKind !== 'aoe') {
      spawnBurst(w, hitX, hitY, p.color, 5, false);
      if (landed) play('hit');
    }

    // Cake's onKillSplash — fire a splash AOE if we just killed the target
    if (p.onKillSplash && primaryWasKilled) {
      const r = p.onKillSplash * T;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0 || e.id === primaryEnemyId) continue;
        const ep = posOf(w, e);
        if (Math.hypot(ep.x - hitX, ep.y - hitY) <= r) applyDamage(w, e, p.dmg * 0.5, p.opts);
      }
      spawnBurst(w, hitX, hitY, '#F8E060', 16, true);
      play('splash');
    }

    // Strawberry chain bounce
    if (p.chainBounce && primaryEnemyId != null) {
      const chainRangePx = 2.5 * T;
      const candidates = [];
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0 || e.id === primaryEnemyId) continue;
        const ep = posOf(w, e);
        const d = Math.hypot(ep.x - hitX, ep.y - hitY);
        if (d <= chainRangePx) candidates.push({ e, d });
      }
      candidates.sort((a, b) => a.d - b.d);
      let chainDmg = p.dmg * 0.65;
      let prevX = hitX, prevY = hitY;
      for (let i = 0; i < Math.min(p.chainBounce, candidates.length); i++) {
        const { e } = candidates[i];
        const tp = posOf(w, e);
        w.projectiles.push({
          id: w.nextId++,
          fromX: prevX, fromY: prevY, toX: tp.x, toY: tp.y,
          targetId: -1, targetKind: 'visual',
          t: 0, duration: 0.10, color: p.color, size: 5, dmg: 0,
        });
        applyDamage(w, e, chainDmg, p.opts || {});
        // Double tap on the same target
        if (p.doubleTapChance && Math.random() < p.doubleTapChance) {
          applyDamage(w, e, chainDmg * 0.6, p.opts || {});
        }
        chainDmg *= 0.7;
        prevX = tp.x; prevY = tp.y;
      }
    }
    p.dead = true;
  }
  w.projectiles = w.projectiles.filter(p => !p.dead);

  // === Beam visuals ========================================================
  if (w.beams && w.beams.length) {
    for (const b of w.beams) b.t += dt;
    w.beams = w.beams.filter(b => b.t < b.dur);
  }

  // === Shockwaves (icecream wave + banana charge release) ==================
  if (w.shockwaves && w.shockwaves.length) {
    for (const sw of w.shockwaves) {
      sw.t += dt;
      // Damage phase: while ring is expanding, hit any enemies the leading edge
      // crosses (only once per wave per enemy).
      if (sw.t < sw.dur && sw.dmg > 0) {
        const r = sw.maxR * (sw.t / sw.dur);
        for (const e of w.enemies) {
          if (e.dead || e.hp <= 0) continue;
          if (sw.hitIds.has(e.id)) continue;
          const ep = posOf(w, e);
          if (Math.hypot(ep.x - sw.x, ep.y - sw.y) <= r) {
            sw.hitIds.add(e.id);
            applyDamage(w, e, sw.dmg, { ...sw.opts, slow: sw.slow });
          }
        }
      }
    }
    w.shockwaves = w.shockwaves.filter(sw => sw.t < sw.dur);
  }

  // === Kills, combos, splitter children ====================================
  for (const e of w.enemies) {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      if (!e.reachedCastle) {
        const def = ENEMY_DEFS[e.type];
        const reward = e.reward || def.reward;
        w.sugar += reward;
        w.sugarEarned += reward;
        w.enemiesKilled += 1;
        if (w.elapsed - w.lastKillAt <= COMBO_TIMEOUT) w.combo += 1;
        else w.combo = 1;
        w.lastKillAt = w.elapsed;
        if (w.combo > w.bestCombo) w.bestCombo = w.combo;
        const scoreGain = Math.round(reward * w.combo * (def.boss ? 5 : 1));
        w.score += scoreGain;
        const ep = posOf(w, e);
        spawnBurst(w, ep.x, ep.y, '#F8E060', def.boss ? 16 : 7, def.boss);
        if (w.combo >= 3) {
          w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 56, text: `×${w.combo}`, color: '#F8E060', t: 0 });
        }
        emit(w, 'enemy_killed', { enemy_type: e.type, boss: !!def.boss, reward, combo: w.combo });
        play(def.boss ? 'killBoss' : 'kill');
        if (def.splitter) {
          for (let i = 0; i < def.splitter.count; i++) {
            const offset = (i - (def.splitter.count - 1) / 2) * 12;
            spawnEnemy(w, def.splitter.childType, Math.max(0, e.dist + offset), e.pathIdx || 0);
          }
        }
      }
    }
  }
  w.enemies = w.enemies.filter(e => !e.dead);

  // === Decoration ticking ==================================================
  for (const ob of w.obstacles) if (ob.flash > 0) ob.flash = Math.max(0, ob.flash - dt);
  for (const f of w.floats) f.t += dt;
  w.floats = w.floats.filter(f => f.t < 0.7);
  for (const fl of w.flashes) fl.t += dt;
  w.flashes = w.flashes.filter(fl => fl.t < fl.dur);
  for (const b of w.bursts) b.t += dt;
  w.bursts = w.bursts.filter(b => b.t < b.dur);

  // === Wave transition =====================================================
  if (w.waveState === 'active' && w.spawnQueue.length === 0 && w.enemies.length === 0) {
    emit(w, 'wave_cleared', { wave: w.waveIdx + 1 });
    if (w.level.endless && w.waveIdx + 1 >= w.level.waves.length) {
      appendEndlessWave(w.level);
    }
    if (w.waveIdx + 1 >= w.level.waves.length) {
      w.finished = 'win';
      emit(w, 'level_won');
      play('win');
    } else {
      w.waveIdx += 1;
      w.waveState = 'preparing';
      w.waveTimer = -PREP_DURATION;
      const bonus = 25 + (w.level.endless ? Math.floor(w.waveIdx * 4) : 0);
      w.sugar += bonus;
      w.sugarEarned += bonus;
      play('coin');
    }
  }

  if (w.combo > 0 && w.elapsed - w.lastKillAt > COMBO_TIMEOUT) w.combo = 0;
}
