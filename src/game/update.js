import { T, ENEMY_DEFS, PREP_DURATION, ENGAGE_DIST } from './constants.js';
import { towerStats } from './world.js';
import { play, shootSoundFor } from './sfx.js';

function emit(w, type, payload = {}) {
  w.events.push({ type, ...payload });
}

function startWave(w, idx) {
  const wave = w.level.waves[idx];
  const queue = [];
  for (const group of wave) {
    for (let i = 0; i < group.count; i++) {
      queue.push({ type: group.type, t: (group.delay || 0) + i * group.interval });
    }
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
  const ep = w.path.posAt(enemy.dist);
  if (def.dodge && Math.random() < def.dodge) {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 22, text: '闪避', color: '#B79CD1', t: 0 });
    emit(w, 'enemy_dodged', { enemy_type: enemy.type });
    return false;
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
      const def = ENEMY_DEFS[spawn.type];
      w.enemies.push({
        id: w.nextId++,
        type: spawn.type,
        dist: 0,
        hp: def.hp,
        maxHp: def.hp,
        baseSpeed: def.speed,
        slowUntil: 0, slowFactor: 1,
        stunUntil: 0,
        flash: 0,
        dead: false,
      });
    }
    if (!w.spawnQueue.length) w.waveState = 'active';
  }

  // Wall collision: enemies stop in front of the next wall, attack it.
  const sortedWalls = w.walls.length
    ? w.walls.slice().sort((a, b) => a.dist - b.dist)
    : null;

  for (const e of w.enemies) {
    if (e.dead || e.hp <= 0) continue;
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
    const stunned = w.elapsed < e.stunUntil;
    if (stunned) continue;

    const def = ENEMY_DEFS[e.type];
    const slow = w.elapsed < e.slowUntil ? e.slowFactor : 1;
    let newDist = e.dist + def.speed * T * slow * dt;

    if (sortedWalls) {
      const nextWall = sortedWalls.find(wl => !wl.dead && wl.dist > e.dist - 4);
      if (nextWall) {
        const stopDist = nextWall.dist - ENGAGE_DIST;
        if (newDist >= stopDist) {
          newDist = Math.min(newDist, stopDist);
          nextWall.hp -= def.wallDps * dt;
          nextWall.flash = 0.12;
          if (nextWall.hp <= 0) {
            nextWall.dead = true;
            const wp = w.path.posAt(nextWall.dist);
            spawnBurst(w, wp.x, wp.y, '#F5DEB3', 12, true);
            emit(w, 'wall_destroyed', { gx: nextWall.gx, gy: nextWall.gy });
            play('splash');
          }
        }
      }
    }

    e.dist = newDist;

    if (e.dist >= w.path.total) {
      w.hp -= def.damage;
      if (def.steal) w.sugar = Math.max(0, w.sugar - def.steal);
      e.dead = true;
      e.reachedCastle = true;
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
      if (ent) { focusTarget = ent; focusKind = 'enemy'; focusPos = w.path.posAt(ent.dist); }
    } else if (w.focus.kind === 'obstacle') {
      const ob = w.obstacles.find(o => o.id === w.focus.id);
      if (ob) { focusTarget = ob; focusKind = 'obstacle'; focusPos = { x: ob.gx * T + T / 2, y: ob.gy * T + T / 2 }; }
    }
    if (!focusTarget) w.focus = null;
  }

  for (const tw of w.towers) {
    const stats = towerStats(tw);
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
        const ep = w.path.posAt(e.dist);
        const d = Math.hypot(ep.x - tx, ep.y - ty);
        if (d <= rangePx && e.dist > bestProgress) {
          best = e; bestProgress = e.dist;
        }
      }
      if (best) { chosen = best; chosenKind = 'enemy'; chosenPos = w.path.posAt(best.dist); }
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
        const ep = w.path.posAt(target.dist);
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
        const ep = w.path.posAt(e.dist);
        const d = Math.hypot(ep.x - hitX, ep.y - hitY);
        if (d <= r) applyDamage(w, e, p.dmg * 0.55, p);
      }
      spawnBurst(w, hitX, hitY, p.color, 10, true);
      play('splash');
    } else {
      spawnBurst(w, hitX, hitY, p.color, 5, false);
      if (landed) play('hit');
    }
    p.dead = true;
  }
  w.projectiles = w.projectiles.filter(p => !p.dead);

  for (const e of w.enemies) {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      if (!e.reachedCastle) {
        const def = ENEMY_DEFS[e.type];
        w.sugar += def.reward;
        w.sugarEarned += def.reward;
        w.enemiesKilled += 1;
        const ep = w.path.posAt(e.dist);
        spawnBurst(w, ep.x, ep.y, '#F8E060', def.boss ? 16 : 7, def.boss);
        emit(w, 'enemy_killed', { enemy_type: e.type, boss: !!def.boss, reward: def.reward });
        play(def.boss ? 'killBoss' : 'kill');
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
    if (w.waveIdx + 1 >= w.level.waves.length) {
      w.finished = 'win';
      emit(w, 'level_won');
      play('win');
    } else {
      w.waveIdx += 1;
      w.waveState = 'preparing';
      w.waveTimer = -PREP_DURATION;
      w.sugar += 25;
      w.sugarEarned += 25;
      play('coin');
    }
  }
}
