import { T, ENEMY_DEFS, PREP_DURATION, ENGAGE_DIST } from './constants.js';
import { towerStats, COMBO_TIMEOUT } from './world.js';
import { play, shootSoundFor } from './sfx.js';
import { appendEndlessWave } from './modes.js';

function emit(w, type, payload = {}) {
  w.events.push({ type, ...payload });
}

// Per-run difficulty multiplier applied to enemy HP / shield / wallDps / reward.
// Scales by theme + sub-level + wave so 60-level progression feels graded.
// Tuned so T1-1 W1 = 1.0 (baseline) and T6-10 W7 ≈ 3.77; endless via sqrt.
export function difficultyScale(level, waveIdx) {
  const idx = Math.max(0, waveIdx);
  if (level.endless) {
    return 1.15 * (1 + Math.sqrt(idx) * 0.4);
  }
  if (level.daily) {
    return 1.25 * (1 + idx * 0.07);
  }
  const THEME_MUL = { 1: 1.00, 2: 1.15, 3: 1.30, 4: 1.50, 5: 1.70, 6: 1.95 };
  const themeId = level.themeId || (typeof level.id === 'number' ? level.id : null);
  const base = (themeId && THEME_MUL[themeId]) || 1;
  // Sub-level inside a theme adds a gentle bump so L*-10 isn't trivial.
  const sub = 1 + ((level.subLevel || 1) - 1) * 0.04;
  return base * sub * (1 + idx * 0.06);
}

// Path helper exports — used elsewhere too. Defaults to path 0 for safety.
export function pathOf(w, e) { return w.paths[e.pathIdx || 0]; }
export function posOf(w, e) { return pathOf(w, e).posAt(e.dist); }

function spawnEnemy(w, type, dist, pathIdx = 0) {
  const def = ENEMY_DEFS[type];
  if (!def) return;
  const scale = difficultyScale(w.level, w.waveIdx);
  // Reward grows sub-linearly so economy stays a meaningful constraint.
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
    flash: 0,
    dead: false,
    shield,
    maxShield: shield,
    shieldBroken: false,
    lastHealAt: 0,
  });
}

function startWave(w, idx) {
  const wave = w.level.waves[idx];
  const queue = [];
  const numPaths = w.paths.length;
  // Multi-path levels alternate group → path so each path sees varied threats.
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

function applyDamage(w, enemy, dmg, opts) {
  const def = ENEMY_DEFS[enemy.type];
  const ep = posOf(w, enemy);
  if (def.dodge && Math.random() < def.dodge) {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 22, text: '闪避', color: '#B79CD1', t: 0 });
    emit(w, 'enemy_dodged', { enemy_type: enemy.type });
    return false;
  }
  // Shield absorbs damage first.
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
  w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 24, text: `-${Math.round(dmg)}`, color: '#E85A7A', t: 0 });
  if (opts && opts.slow && !def.boss) {
    enemy.slowUntil = w.elapsed + opts.slow.duration;
    enemy.slowFactor = opts.slow.factor;
  }
  if (opts && opts.stun && !def.boss) {
    enemy.stunUntil = w.elapsed + opts.stun;
  }
  // Knockback (banana). Boss-immune.
  if (opts && opts.knockback && !def.boss) {
    enemy.dist = Math.max(0, enemy.dist - opts.knockback);
  }
  return true;
}

export function update(w, rawDt) {
  // w.events accumulates across ticks; the consumer (e.g. achievements in
  // Phase F) is responsible for draining it. Cap defensively to avoid
  // unbounded growth if no consumer is wired up yet.
  if (w.events.length > 256) w.events.splice(0, w.events.length - 256);
  if (w.finished) return;
  if (w.speed === 0) return;
  const dt = rawDt * w.speed;
  w.elapsed += dt;
  w.waveTimer += dt;

  if (w.waveState === 'preparing' && w.waveTimer >= 0) {
    startWave(w, w.waveIdx);
  }

  if (w.waveState === 'spawning') {
    while (w.spawnQueue.length && w.spawnQueue[0].t <= w.waveTimer) {
      const spawn = w.spawnQueue.shift();
      spawnEnemy(w, spawn.type, 0, spawn.pathIdx || 0);
    }
    if (!w.spawnQueue.length) w.waveState = 'active';
  }

  // T3 mechanic: tidal — periodic mini-wave spawns extra enemies during a wave.
  // level.tidal = { period, type, count } — uses w.tidalNextAt cursor on world.
  const tidal = w.level.tidal;
  if (tidal && w.waveState !== 'preparing' && !w.finished) {
    if (w.tidalNextAt == null) w.tidalNextAt = w.elapsed + tidal.period;
    if (w.elapsed >= w.tidalNextAt) {
      w.tidalNextAt = w.elapsed + tidal.period;
      const numPaths = w.paths.length;
      for (let i = 0; i < tidal.count; i++) {
        // Stagger 0.4s apart, alternate paths
        setTimeout(() => {}, 0); // no-op to keep linter happy
        spawnEnemy(w, tidal.type, -i * 25, i % numPaths);
      }
      // Visual cue: a brief float text near the entry
      const entry = w.paths[0].points[0];
      w.floats.push({ id: w.nextId++, x: entry.x + 30, y: entry.y - 30, text: '潮汐!', color: '#7BB6E0', t: 0 });
      emit(w, 'tidal_pulse', { type: tidal.type, count: tidal.count });
    }
  }

  // Wall collision per-path: each enemy on its own path consults its own wall set.
  // Pre-compute walls grouped by pathIdx (sorted by their per-path dist).
  const wallsByPath = w.walls.length ? w.paths.map((_, pi) =>
    w.walls
      .map(wl => {
        const slot = wl.pathDists && wl.pathDists.find(p => p.pathIdx === pi);
        return slot ? { wall: wl, dist: slot.dist } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.dist - b.dist)
  ) : null;

  for (const e of w.enemies) {
    if (e.dead || e.hp <= 0) continue;
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
    const def = ENEMY_DEFS[e.type];
    const ePath = pathOf(w, e);

    // Healer: periodic AOE heal of nearby allies (still ticks while stunned)
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

    const stunned = w.elapsed < e.stunUntil;
    if (stunned) continue;

    const slow = w.elapsed < e.slowUntil ? e.slowFactor : 1;
    // Conveyor mechanic: if level has a conveyor segment, boost speed there.
    const conveyor = w.level.conveyor;
    let speedMul = 1;
    if (conveyor && ePath.total > 0) {
      const frac = e.dist / ePath.total;
      if (frac >= conveyor.start && frac <= conveyor.end) speedMul = conveyor.mul;
    }
    let newDist = e.dist + def.speed * T * slow * speedMul * dt;

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
      // Castle leak resets combo (penalty for letting enemies through).
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

  // Resolve focus target (auto-clear if it no longer exists).
  let focusTarget = null;
  let focusKind = null;
  let focusPos = null;
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

  for (const tw of w.towers) {
    const stats = towerStats(tw, w);
    tw.cooldown = Math.max(0, (tw.cooldown || 0) - dt);
    if (tw.shootPulse > 0) tw.shootPulse = Math.max(0, tw.shootPulse - dt);
    if (tw.cooldown > 0) continue;

    const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
    const rangePx = stats.range * T;

    // Pick target: focus first if in range, else leading enemy.
    let chosen = null, chosenKind = null, chosenPos = null;
    if (focusTarget && focusPos) {
      const d = Math.hypot(focusPos.x - tx, focusPos.y - ty);
      if (d <= rangePx) {
        chosen = focusTarget;
        chosenKind = focusKind;
        chosenPos = focusPos;
      }
    }
    if (!chosen) {
      let best = null, bestProgress = -1;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0) continue;
        const ep = posOf(w, e);
        const d = Math.hypot(ep.x - tx, ep.y - ty);
        if (d <= rangePx && e.dist > bestProgress) {
          best = e; bestProgress = e.dist;
        }
      }
      if (best) { chosen = best; chosenKind = 'enemy'; chosenPos = posOf(w, best); }
    }

    if (chosen) {
      w.projectiles.push({
        id: w.nextId++,
        fromX: tx, fromY: ty,
        toX: chosenPos.x, toY: chosenPos.y,
        targetId: chosen.id,
        targetKind: chosenKind,
        t: 0,
        duration: tw.type === 'macaron' ? 0.14 : tw.type === 'cake' ? 0.20 : 0.16,
        color: stats.proj,
        size: tw.type === 'cake' ? 9 : tw.type === 'donut' ? 8 : 6,
        dmg: stats.dmg,
        splash: stats.splash,
        slow: stats.slow,
        stun: stats.stun,
        chainBounce: stats.chainBounce,
        knockback: stats.knockback,
        towerType: tw.type,
      });
      tw.cooldown = stats.cd;
      tw.shootPulse = 0.20;
      spawnFlash(w, tx, ty, stats.proj);
      if (Math.random() < (tw.type === 'choco' ? 0.35 : tw.type === 'cupcake' ? 0.7 : 1)) {
        play(shootSoundFor(tw.type));
      }
    }
  }

  for (const p of w.projectiles) {
    p.t += dt / p.duration;
    if (p.t < 1) continue;

    let hitX = p.toX, hitY = p.toY;
    let landed = false;
    let primaryEnemyId = null;

    if (p.targetKind === 'enemy') {
      const target = w.enemies.find(e => e.id === p.targetId);
      if (target && !target.dead) {
        const ep = posOf(w, target);
        hitX = ep.x; hitY = ep.y;
        landed = applyDamage(w, target, p.dmg, p);
        primaryEnemyId = target.id;
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
          // Destroy + reward
          w.sugar += ob.reward;
          w.sugarEarned += ob.reward;
          w.obstacles = w.obstacles.filter(o => o.id !== ob.id);
          spawnBurst(w, hitX, hitY, '#A98467', 14, true);
          w.floats.push({ id: w.nextId++, x: hitX, y: hitY - 48, text: `+${ob.reward}`, color: '#F8E060', t: 0 });
          if (w.focus && w.focus.kind === 'obstacle' && w.focus.id === ob.id) {
            w.focus = null;
          }
          emit(w, 'obstacle_destroyed', { gx: ob.gx, gy: ob.gy, reward: ob.reward });
          play('coin');
        }
      }
    }

    if (p.splash) {
      const r = p.splash * T;
      for (const e of w.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (primaryEnemyId != null && e.id === primaryEnemyId) continue;
        const ep = posOf(w, e);
        const d = Math.hypot(ep.x - hitX, ep.y - hitY);
        if (d <= r) applyDamage(w, e, p.dmg * 0.55, p);
      }
      spawnBurst(w, hitX, hitY, p.color, 10, true);
      play('splash');
    } else {
      spawnBurst(w, hitX, hitY, p.color, 5, false);
      if (landed) play('hit');
    }

    // Strawberry chain bounce — damage 2 nearest unhit enemies in range
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
        // Visual-only chain trail (no targetKind so hit logic ignores it)
        w.projectiles.push({
          id: w.nextId++,
          fromX: prevX, fromY: prevY,
          toX: tp.x, toY: tp.y,
          targetId: -1, targetKind: 'visual',
          t: 0, duration: 0.10,
          color: p.color, size: 5, dmg: 0,
        });
        applyDamage(w, e, chainDmg, p);
        chainDmg *= 0.7;
        prevX = tp.x; prevY = tp.y;
      }
    }
    p.dead = true;
  }
  w.projectiles = w.projectiles.filter(p => !p.dead);

  for (const e of w.enemies) {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      if (!e.reachedCastle) {
        const def = ENEMY_DEFS[e.type];
        const reward = e.reward || def.reward;
        w.sugar += reward;
        w.sugarEarned += reward;
        w.enemiesKilled += 1;
        // Combo: chained kills inside COMBO_TIMEOUT bump multiplier; score uses it.
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
        // Splitter: spawn children at the same path position (and same path).
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

  for (const ob of w.obstacles) {
    if (ob.flash > 0) ob.flash = Math.max(0, ob.flash - dt);
  }
  for (const f of w.floats) f.t += dt;
  w.floats = w.floats.filter(f => f.t < 0.7);
  for (const fl of w.flashes) fl.t += dt;
  w.flashes = w.flashes.filter(fl => fl.t < fl.dur);
  for (const b of w.bursts) b.t += dt;
  w.bursts = w.bursts.filter(b => b.t < b.dur);

  if (w.waveState === 'active' && w.spawnQueue.length === 0 && w.enemies.length === 0) {
    emit(w, 'wave_cleared', { wave: w.waveIdx + 1 });
    // Endless: lazily generate the next wave so .waves never runs out.
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

  // Combo decays naturally when no kills for COMBO_TIMEOUT.
  if (w.combo > 0 && w.elapsed - w.lastKillAt > COMBO_TIMEOUT) {
    w.combo = 0;
  }
}
