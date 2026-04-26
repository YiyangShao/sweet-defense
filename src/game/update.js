import { T, ENEMY_DEFS } from './constants.js';
import { PATH, posAt } from './path.js';
import { towerStats } from './world.js';
import { PREP_DURATION } from './constants.js';

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
}

function applyDamage(w, enemy, dmg, opts) {
  const def = ENEMY_DEFS[enemy.type];
  const ep = posAt(enemy.dist);
  if (def.dodge && Math.random() < def.dodge) {
    w.floats.push({ id: w.nextId++, x: ep.x, y: ep.y - 22, text: '闪避', color: '#B79CD1', t: 0 });
    return;
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
}

export function update(w, rawDt) {
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

  for (const e of w.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const slow = w.elapsed < e.slowUntil ? e.slowFactor : 1;
    const stunned = w.elapsed < e.stunUntil;
    if (!stunned) {
      e.dist += e.baseSpeed * T * slow * dt;
    }
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
    if (e.dist >= PATH.total) {
      const def = ENEMY_DEFS[e.type];
      w.hp -= def.damage;
      if (def.steal) w.sugar = Math.max(0, w.sugar - def.steal);
      e.dead = true; e.reachedCastle = true;
      if (w.hp <= 0) { w.hp = 0; w.finished = 'lose'; }
    }
  }

  for (const tw of w.towers) {
    const stats = towerStats(tw);
    tw.cooldown = Math.max(0, (tw.cooldown || 0) - dt);
    if (tw.shootPulse > 0) tw.shootPulse = Math.max(0, tw.shootPulse - dt);
    if (tw.cooldown > 0) continue;

    const tx = tw.gx * T + T / 2, ty = tw.gy * T + T / 2;
    const rangePx = stats.range * T;
    let best = null, bestProgress = -1;
    for (const e of w.enemies) {
      if (e.dead || e.hp <= 0) continue;
      const ep = posAt(e.dist);
      const d = Math.hypot(ep.x - tx, ep.y - ty);
      if (d <= rangePx && e.dist > bestProgress) {
        best = e;
        bestProgress = e.dist;
      }
    }
    if (best) {
      const ep = posAt(best.dist);
      w.projectiles.push({
        id: w.nextId++,
        fromX: tx, fromY: ty,
        toX: ep.x, toY: ep.y,
        targetId: best.id,
        t: 0,
        duration: tw.type === 'macaron' ? 0.14 : tw.type === 'cake' ? 0.20 : 0.16,
        color: stats.proj,
        size: tw.type === 'cake' ? 9 : tw.type === 'donut' ? 8 : 6,
        dmg: stats.dmg,
        splash: stats.splash,
        slow: stats.slow,
        stun: stats.stun,
      });
      tw.cooldown = stats.cd;
      tw.shootPulse = 0.18;
    }
  }

  for (const p of w.projectiles) {
    p.t += dt / p.duration;
    if (p.t >= 1) {
      const target = w.enemies.find(e => e.id === p.targetId);
      let hitX = p.toX, hitY = p.toY;
      if (target && !target.dead) {
        const ep = posAt(target.dist);
        hitX = ep.x; hitY = ep.y;
        applyDamage(w, target, p.dmg, p);
      }
      if (p.splash) {
        const r = p.splash * T;
        for (const e of w.enemies) {
          if (e.dead || e.hp <= 0) continue;
          if (target && e.id === target.id) continue;
          const ep = posAt(e.dist);
          const d = Math.hypot(ep.x - hitX, ep.y - hitY);
          if (d <= r) applyDamage(w, e, p.dmg * 0.55, p);
        }
      }
      p.dead = true;
    }
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
      }
    }
  }
  w.enemies = w.enemies.filter(e => !e.dead);

  for (const f of w.floats) f.t += dt;
  w.floats = w.floats.filter(f => f.t < 0.7);

  if (w.waveState === 'active' && w.spawnQueue.length === 0 && w.enemies.length === 0) {
    if (w.waveIdx + 1 >= w.level.waves.length) {
      w.finished = 'win';
    } else {
      w.waveIdx += 1;
      w.waveState = 'preparing';
      w.waveTimer = -PREP_DURATION;
      w.sugar += 25;
      w.sugarEarned += 25;
    }
  }
}
