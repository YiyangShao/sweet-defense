import { TOWER_DEFS, ENEMY_DEFS, WALL_DEFS, T, COLS, ROWS, W, H } from '../game/constants.js';
import { Boulder, NougatWall } from '../art/structures.jsx';
import {
  MacaronTree, LollipopFlower, CookieBush, JellyCube, MarshmallowCloud,
  GearCookie, IcePine, StarTwinkle, ChocoPot,
} from '../art/decorations.jsx';
import { towerStats, neighborBuffs, isFrozenCell } from '../game/world.js';
import TowerActionPopover from './TowerActionPopover.jsx';

const DECOR_COMPONENTS = {
  macaronTree: MacaronTree,
  lollipopFlower: LollipopFlower,
  cookieBush: CookieBush,
  jellyCube: JellyCube,
  marshmallowCloud: MarshmallowCloud,
  gearCookie: GearCookie,
  icePine: IcePine,
  starTwinkle: StarTwinkle,
  chocoPot: ChocoPot,
};

export default function GameBoard({
  world, ghost, theme, themeMastered,
  svgRef,
  onCellClick, onCellRightClick, onTowerClick, onObstacleClick, onEnemyClick,
  onMouseMove, onMouseLeave,
  onUpgrade, onSell,
}) {
  // Multi-path safe enemy position lookup.
  const ePathOf = (e) => world.paths[e.pathIdx || 0];
  // Theme-finale boss tint: rotate the bear's hue per theme so each L*-10 boss feels distinct.
  // Only applied to bosses on level.subLevel === 10 to keep mid-campaign bosses uniform.
  const BOSS_HUE = { 1: 0, 2: -25, 3: 100, 4: 240, 5: 30, 6: 180 };
  const themeBossHue = (def, isThemeFinale) =>
    def.boss && isThemeFinale ? (BOSS_HUE[world.level.themeId] || 0) : 0;

  const enemyEls = world.enemies.map(e => {
    const ep = ePathOf(e).posAt(e.dist);
    const def = ENEMY_DEFS[e.type];
    const Comp = def.Comp;
    const baseSize = def.boss ? T * 1.2 : T * 0.78;
    const size = baseSize * (def.sizeMul || 1);
    const hpPct = e.hp / e.maxHp;
    const hpW = def.boss ? 70 : Math.round(44 * (def.sizeMul || 1));
    const isFinale = world.level.subLevel === 10;
    const hue = themeBossHue(def, isFinale);
    const baseFilter = e.flash > 0
      ? 'brightness(1.6) saturate(0.5)'
      : `drop-shadow(0 ${def.boss ? 6 : 4}px ${def.boss ? 6 : 4}px rgba(60,40,32,0.45))`;
    const filter = hue !== 0 ? `${baseFilter} hue-rotate(${hue}deg) saturate(1.2)` : baseFilter;
    return (
      <g
        key={e.id}
        transform={`translate(${ep.x} ${ep.y})`}
        style={{ cursor: 'crosshair', filter }}
        onClick={(ev) => { ev.stopPropagation(); onEnemyClick && onEnemyClick(e.id); }}
      >
        <g transform={`translate(${-size / 2} ${-size / 2})`}>
          <Comp size={size} tint={def.tint} />
        </g>
        {/* Shield bubble */}
        {e.shield > 0 && (
          <g style={{ pointerEvents: 'none' }}>
            <circle r={size / 2 + 8} fill="rgba(168,217,232,0.18)" stroke="#7BB6E0" strokeWidth="2" strokeDasharray="4 3" />
            <text x="0" y={-size / 2 - 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#5A8FB8">{Math.round(e.shield)}</text>
          </g>
        )}
        <g transform={`translate(${-hpW / 2} ${-size / 2 - 12})`}>
          <rect x="0" y="0" width={hpW} height="7" rx="3.5" fill="white" stroke="#E5DCC5" strokeWidth="1" />
          <rect x="2" y="2" width={(hpW - 4) * hpPct} height="3" rx="1.5"
                fill={hpPct > 0.5 ? '#8FCFAE' : hpPct > 0.25 ? '#F8E060' : '#F58CA6'} />
        </g>
        {e.slowUntil > world.elapsed && (
          <circle cx="0" cy={size / 2 - 8} r={size / 2 - 4} fill="rgba(168,217,192,0.25)" stroke="#A8D9C0" strokeWidth="2" strokeDasharray="3 3" />
        )}
        {e.stunUntil > world.elapsed && (
          <text x="0" y={-size / 2 - 18} textAnchor="middle" fontSize="20">⭐</text>
        )}
        {e.frozenUntil > world.elapsed && (
          <g>
            <circle cx="0" cy="0" r={size / 2 + 4} fill="rgba(168,217,232,0.35)" stroke="#7BB6E0" strokeWidth="2" />
            <text x="0" y={-size / 2 - 8} textAnchor="middle" fontSize="18">❄</text>
          </g>
        )}
        {e.dotStacks && e.dotStacks.length > 0 && (
          <g transform={`translate(${size / 2 - 4} ${-size / 2 + 4})`}>
            <circle r="9" fill="#FF7A4D" stroke="white" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">🔥</text>
          </g>
        )}
        {e.debuffs && (e.debuffs.frosting > world.elapsed || e.debuffs.acid > world.elapsed) && (
          <g transform={`translate(${-size / 2 + 6} ${-size / 2 + 4})`}>
            <circle r="7" fill={e.debuffs.frosting > world.elapsed ? '#F58CA6' : '#F8E060'} stroke="white" strokeWidth="1.5" />
          </g>
        )}
      </g>
    );
  });

  const towerEls = world.towers.map(tw => {
    const def = TOWER_DEFS[tw.type];
    const Comp = def.Comp;
    const cx = tw.gx * T + T / 2, cy = tw.gy * T + T / 2;
    const lvl = tw.level;
    const lvlScale = 1 + (lvl - 1) * 0.06;
    const sz = T * (tw.shootPulse > 0 ? lvlScale * 1.10 : lvlScale * 1.0);
    const isSelected = world.selectedPlacedTower === tw.id;
    const buff = neighborBuffs(tw, world);
    const isBuffed = buff.count > 0;

    return (
      <g key={tw.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onTowerClick(tw.id); }}>
        {/* Soft ground contact shadow (extended for 3D depth) */}
        <ellipse cx={cx} cy={cy + 14} rx={T * 0.46} ry={T * 0.16} fill="rgba(60,40,32,0.30)" filter="url(#sd-blur)" />
        <ellipse cx={cx} cy={cy + 10} rx={T * 0.40} ry={T * 0.12} fill="rgba(60,40,32,0.18)" />

        {/* Theme-mastery golden skin: full pulsing ring around towers when this theme is mastered. */}
        {themeMastered && (
          <>
            <circle cx={cx} cy={cy} r={T * 0.52} fill="none" stroke="#F8E060" strokeWidth="3" opacity="0.9" strokeDasharray="6 3">
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r={T * 0.56} fill="none" stroke="#FFD45F" strokeWidth="1.5" opacity="0.45" />
          </>
        )}

        {/* Synergy halo for buffed towers */}
        {isBuffed && (
          <>
            <circle cx={cx} cy={cy} r={T * 0.50} fill="none" stroke="#F8E060" strokeWidth="2.5" opacity="0.85" strokeDasharray="3 2" />
            <circle cx={cx} cy={cy} r={T * 0.54} fill="none" stroke="#FFE066" strokeWidth="1.5" opacity="0.45" />
          </>
        )}

        {/* Base pad with radial gradient (dome look) */}
        <circle cx={cx} cy={cy} r={T * 0.42} fill="url(#sd-baseGrad)" />
        {/* Top highlight on base pad */}
        <ellipse cx={cx - 6} cy={cy - 10} rx={T * 0.22} ry={T * 0.08} fill="white" opacity="0.45" />

        {/* L2: silver ring */}
        {lvl === 2 && (
          <circle cx={cx} cy={cy} r={T * 0.46} fill="none" stroke="url(#sd-silver)" strokeWidth="3" />
        )}
        {/* L3: gold rainbow ring + 4 orbiting sparkles */}
        {lvl === 3 && (
          <>
            <circle cx={cx} cy={cy} r={T * 0.50} fill="none" stroke="url(#sd-rainbow)" strokeWidth="4" opacity="0.95" />
            <circle cx={cx} cy={cy} r={T * 0.54} fill="none" stroke="#FFE066" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 4" />
            <g transform={`translate(${cx} ${cy})`}>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" additive="sum" />
              <circle cx="0" cy={-T * 0.55} r="3.5" fill="#F8E060" />
              <circle cx={T * 0.55} cy="0" r="3.5" fill="#FFB5C5" />
              <circle cx="0" cy={T * 0.55} r="3.5" fill="#A8D9C0" />
              <circle cx={-T * 0.55} cy="0" r="3.5" fill="#B79CD1" />
            </g>
          </>
        )}

        {/* Selection ring */}
        {isSelected && (
          <circle cx={cx} cy={cy} r={T * 0.48} fill="none" stroke="var(--pink-deep)" strokeWidth="3" />
        )}

        {/* The dessert sprite */}
        <g
          transform={`translate(${cx - sz / 2} ${cy - sz / 2 - 4})`}
          style={{ filter: tw.shootPulse > 0 ? 'brightness(1.25)' : 'drop-shadow(0 5px 4px rgba(60,40,32,0.35))' }}
        >
          <Comp size={sz} />
        </g>

        {/* Level badge */}
        {lvl > 1 && (
          <g transform={`translate(${cx + T * 0.26} ${cy - T * 0.26})`}>
            <circle r="12" fill={lvl === 3 ? '#F8E060' : '#E8E0D0'} stroke="#F58CA6" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight="800" fill={lvl === 3 ? '#8B5E3C' : '#5A3E36'} fontFamily="Fredoka, sans-serif">{lvl}</text>
          </g>
        )}
        {/* Synergy buff badge */}
        {isBuffed && (
          <g transform={`translate(${cx - T * 0.30} ${cy - T * 0.30})`}>
            <circle r="10" fill="#F8E060" stroke="white" strokeWidth="2" />
            <text x="0" y="3" textAnchor="middle" fontSize="11" fontWeight="800" fill="#8B5E3C" fontFamily="Fredoka, sans-serif">✦</text>
          </g>
        )}
      </g>
    );
  });

  // All visual-only layers below are pointer-events: none so they never
  // intercept clicks intended for towers/enemies/obstacles underneath.
  const projectileEls = world.projectiles.map(p => {
    // Pierce projectile (macaron): physical line traveller. Render as a fast-
    // moving sprite with a trail behind it.
    if (p.pierce) {
      const x = p.x, y = p.y;
      const tailLen = 32;
      const tailX = x - p.ux * tailLen, tailY = y - p.uy * tailLen;
      return (
        <g key={p.id} style={{ pointerEvents: 'none' }}>
          <line x1={tailX} y1={tailY} x2={x} y2={y} stroke={p.color} strokeWidth="6" strokeLinecap="round" opacity="0.35" />
          <line x1={tailX} y1={tailY} x2={x} y2={y} stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <circle cx={x} cy={y} r={p.size + 3} fill={p.color} opacity="0.45" />
          <circle cx={x} cy={y} r={p.size} fill={p.color} />
          <circle cx={x - 1.5} cy={y - 1.5} r={p.size - 3} fill="white" opacity="0.8" />
        </g>
      );
    }
    // Boomerang has its own per-tick (x, y) computed in the engine.
    if (p.boomerang) {
      const x = p.x ?? p.fromX, y = p.y ?? p.fromY;
      return (
        <g key={p.id} style={{ pointerEvents: 'none' }}>
          <circle cx={x} cy={y} r={p.size + 4} fill={p.color} opacity="0.25" />
          <circle cx={x} cy={y} r={p.size} fill={p.color} />
          <g transform={`translate(${x} ${y})`}>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.4s" repeatCount="indefinite" additive="sum" />
            <line x1={-p.size - 2} y1="0" x2={p.size + 2} y2="0" stroke="white" strokeWidth="2" opacity="0.7" />
            <line x1="0" y1={-p.size - 2} x2="0" y2={p.size + 2} stroke="white" strokeWidth="2" opacity="0.7" />
          </g>
        </g>
      );
    }
    const x = p.fromX + (p.toX - p.fromX) * p.t;
    const y = p.fromY + (p.toY - p.fromY) * p.t;
    return (
      <g key={p.id} style={{ pointerEvents: 'none' }}>
        <line x1={p.fromX} y1={p.fromY} x2={x} y2={y} stroke={p.color} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.5" />
        <circle cx={x} cy={y} r={p.size + 3} fill={p.color} opacity="0.35" />
        <circle cx={x} cy={y} r={p.size} fill={p.color} />
        <circle cx={x - 1.5} cy={y - 1.5} r={p.size - 2.5} fill="white" opacity="0.55" />
      </g>
    );
  });

  // Beam visuals (macaron pierce, choco chain lightning)
  const beamEls = (world.beams || []).map(b => {
    const fade = 1 - (b.t / b.dur);
    if (b.jagged) {
      // Lightning bolt: zig-zag between (fromX,fromY) and (toX,toY)
      const dx = b.toX - b.fromX, dy = b.toY - b.fromY;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const segs = 5;
      const pts = [`${b.fromX},${b.fromY}`];
      for (let i = 1; i < segs; i++) {
        const fx = b.fromX + dx * (i / segs);
        const fy = b.fromY + dy * (i / segs);
        const j = (Math.sin(b.id + i * 1.7) * 0.5 + 0.5 - 0.5) * 12;
        pts.push(`${fx + (-uy) * j},${fy + ux * j}`);
      }
      pts.push(`${b.toX},${b.toY}`);
      return (
        <g key={`beam${b.id}`} style={{ pointerEvents: 'none', opacity: fade }}>
          <polyline points={pts.join(' ')} fill="none" stroke={b.color} strokeWidth="4" opacity="0.4" />
          <polyline points={pts.join(' ')} fill="none" stroke="white" strokeWidth="1.5" opacity="0.95" />
        </g>
      );
    }
    return (
      <g key={`beam${b.id}`} style={{ pointerEvents: 'none', opacity: fade }}>
        <line x1={b.fromX} y1={b.fromY} x2={b.toX} y2={b.toY}
              stroke={b.color} strokeWidth="10" strokeLinecap="round" opacity="0.30" />
        <line x1={b.fromX} y1={b.fromY} x2={b.toX} y2={b.toY}
              stroke={b.color} strokeWidth="5" strokeLinecap="round" opacity="0.65" />
        <line x1={b.fromX} y1={b.fromY} x2={b.toX} y2={b.toY}
              stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
      </g>
    );
  });

  // Shockwave / aura ring visuals (icecream wave + banana charge release)
  const shockwaveEls = (world.shockwaves || []).map(sw => {
    const pt = sw.t / sw.dur;
    const r = sw.maxR * pt;
    return (
      <g key={`sw${sw.id}`} style={{ pointerEvents: 'none' }}>
        <circle cx={sw.x} cy={sw.y} r={r} fill="none"
                stroke={sw.color} strokeWidth="6" opacity={(1 - pt) * 0.45} />
        <circle cx={sw.x} cy={sw.y} r={r} fill="none"
                stroke="white" strokeWidth="2" opacity={(1 - pt) * 0.7} />
      </g>
    );
  });

  // Muzzle flashes
  const flashEls = world.flashes.map(f => {
    const pt = f.t / f.dur;
    const r = 18 * (1 + pt * 1.3);
    return (
      <g key={f.id} style={{ pointerEvents: 'none' }}>
        <circle cx={f.x} cy={f.y} r={r} fill={f.color} opacity={(1 - pt) * 0.55} />
        <circle cx={f.x} cy={f.y} r={r * 0.55} fill="white" opacity={(1 - pt) * 0.85} />
      </g>
    );
  });

  // Hit-impact particle bursts
  const burstEls = world.bursts.map(b => {
    const pt = b.t / b.dur;
    return (
      <g key={b.id} style={{ pointerEvents: 'none' }}>
        {b.particles.map((p, i) => {
          const dx = Math.cos(p.angle) * p.speed * pt;
          const dy = Math.sin(p.angle) * p.speed * pt + 28 * pt * pt;
          return (
            <circle
              key={i}
              cx={b.x + dx}
              cy={b.y + dy}
              r={p.r * (1 - pt * 0.4)}
              fill={p.color}
              opacity={1 - pt}
            />
          );
        })}
      </g>
    );
  });

  // Focus-fire crosshair (red, pulsing/rotating ring + cardinal ticks)
  const focusEl = (() => {
    const f = world.focus;
    if (!f) return null;
    let pos = null;
    if (f.kind === 'enemy') {
      const ent = world.enemies.find(e => e.id === f.id && !e.dead);
      if (ent) pos = ePathOf(ent).posAt(ent.dist);
    } else if (f.kind === 'obstacle') {
      const ob = world.obstacles.find(o => o.id === f.id);
      if (ob) pos = { x: ob.gx * T + T / 2, y: ob.gy * T + T / 2 };
    }
    if (!pos) return null;
    return (
      <g transform={`translate(${pos.x} ${pos.y})`} style={{ pointerEvents: 'none' }}>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite" />
          <circle r="34" fill="none" stroke="#FF4D6D" strokeWidth="3" strokeDasharray="9 5" opacity="0.95" />
        </g>
        <line x1="-44" y1="0" x2="-26" y2="0" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="0" x2="44" y2="0" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-44" x2="0" y2="-26" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="26" x2="0" y2="44" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
        <circle r="4" fill="#FF4D6D" />
      </g>
    );
  })();

  const floatEls = world.floats.map(f => (
    <g key={f.id} transform={`translate(${f.x} ${f.y - f.t * 50})`} style={{ opacity: 1 - f.t / 0.7, pointerEvents: 'none' }}>
      <text textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize={f.text === '闪避' ? 16 : 22} fill={f.color}
            stroke="white" strokeWidth="3" paintOrder="stroke">
        {f.text}
      </text>
    </g>
  ));

  const selectedTw = world.selectedPlacedTower != null ? world.towers.find(t => t.id === world.selectedPlacedTower) : null;
  const selectedRange = selectedTw && (() => {
    const stats = towerStats(selectedTw, world);
    const cx = selectedTw.gx * T + T / 2, cy = selectedTw.gy * T + T / 2;
    return (
      <circle cx={cx} cy={cy} r={stats.range * T} fill="rgba(255,181,197,0.18)" stroke="#F58CA6" strokeWidth="3" strokeDasharray="8 6" />
    );
  })();

  // Compute the cells this tower's synergy would BUFF if placed at (gx, gy).
  // Mirrors the geometries declared in world.js neighborBuffs.
  const buffCellsForGhost = (geom, gx, gy) => {
    const cells = [];
    const inBounds = (x, y) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
    if (!geom) return cells;
    const push = (dx, dy) => {
      const x = gx + dx, y = gy + dy;
      if ((dx !== 0 || dy !== 0) && inBounds(x, y)) cells.push([x, y]);
    };
    if (geom === 'neighbor8') {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) push(dx, dy);
    } else if (geom === 'orthogonal4') {
      push(0, -1); push(-1, 0); push(1, 0); push(0, 1);
    } else if (geom === 'diagonal4') {
      push(-1, -1); push(1, -1); push(-1, 1); push(1, 1);
    } else if (geom === 'row') {
      for (let dx = -15; dx <= 15; dx++) push(dx, 0);
    } else if (geom === 'column') {
      for (let dy = -8; dy <= 8; dy++) push(0, dy);
    } else if (geom === 'circle2') {
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        if (dx * dx + dy * dy <= 4) push(dx, dy);
      }
    }
    return cells;
  };

  const ghostEl = ghost && (() => {
    const isWall = ghost.kind === 'wall';
    const def = isWall ? WALL_DEFS.wall : TOWER_DEFS[ghost.type];
    const Comp = def.Comp;
    const cx = ghost.gx * T + T / 2, cy = ghost.gy * T + T / 2;
    const valid = ghost.valid;
    // Buff highlight cells for this ghost (only for towers, not walls).
    const buffCells = !isWall && def.synergy ? buffCellsForGhost(def.synergy.geometry, ghost.gx, ghost.gy) : [];

    // Preview hints: frozen-cell trade-off + synergy buff from existing neighbours.
    const hints = [];
    if (!isWall && valid) {
      if (isFrozenCell(world, ghost.gx, ghost.gy)) {
        hints.push({ icon: '❄', text: '射程+15% · 射速-29%', color: '#5A8FB8' });
      }
      // Compute synergy by faking a tower at the hover cell and reading neighbour buffs.
      const fakeTower = { id: -1, type: ghost.type, gx: ghost.gx, gy: ghost.gy };
      const buff = neighborBuffs(fakeTower, world);
      if (buff.count > 0) {
        const parts = [];
        if (buff.dmgMul) parts.push(`攻+${(buff.dmgMul * 100).toFixed(0)}%`);
        if (buff.rangeMul) parts.push(`程+${(buff.rangeMul * 100).toFixed(0)}%`);
        if (buff.cdMul) parts.push(`速+${(-buff.cdMul * 100).toFixed(0)}%`);
        if (buff.splashMul) parts.push(`范+${(buff.splashMul * 100).toFixed(0)}%`);
        if (parts.length) hints.push({ icon: '✦', text: parts.join(' '), color: '#8B5E3C', bg: '#FFF1C4' });
      }
    }
    // Position hint pill above the cell, but flip to below if at the top edge.
    const aboveTop = ghost.gy <= 0;
    const hintBaseY = aboveTop ? ghost.gy * T + T + 8 : ghost.gy * T - 22;
    const hintLineH = 18;

    return (
      <g style={{ pointerEvents: 'none' }}>
        {!isWall && (
          <circle cx={cx} cy={cy} r={def.range * T} fill={valid ? 'rgba(143,207,174,0.18)' : 'rgba(245,140,166,0.18)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="8 6" />
        )}
        {/* Highlight cells this tower will buff via its synergy geometry */}
        {valid && buffCells.map(([bx, by]) => (
          <rect key={`bc-${bx}-${by}`}
            x={bx * T + 6} y={by * T + 6}
            width={T - 12} height={T - 12} rx="10"
            fill="rgba(248,224,96,0.18)" stroke="#F8E060" strokeWidth="2" strokeDasharray="4 3" />
        ))}
        <rect x={ghost.gx * T + 4} y={ghost.gy * T + 4} width={T - 8} height={T - 8} rx="14" fill={valid ? 'rgba(143,207,174,0.22)' : 'rgba(245,140,166,0.22)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="6 4" />
        <g transform={`translate(${cx - T / 2} ${cy - T / 2 - 4})`} opacity="0.7">
          <Comp size={T} />
        </g>
        {hints.map((h, i) => {
          const y = hintBaseY + (aboveTop ? i : -i) * hintLineH;
          return (
            <g key={`hint-${i}`}>
              <rect
                x={cx - 78} y={y - 13} width={156} height={18} rx="9"
                fill={h.bg || 'white'} stroke={h.color} strokeWidth="1.5"
                opacity="0.95"
              />
              <text x={cx} y={y} textAnchor="middle" fontSize="11" fontWeight="700"
                    fill={h.color} fontFamily="Fredoka, sans-serif">
                {h.icon} {h.text}
              </text>
            </g>
          );
        })}
      </g>
    );
  })();

  const wallEls = world.walls.map(wl => {
    const cx = wl.gx * T + T / 2, cy = wl.gy * T + T / 2;
    const sz = T * 0.85;
    const hpPct = wl.hp / wl.maxHp;
    const flashFilter = wl.flash > 0 ? 'brightness(1.5) saturate(0.5)' : 'drop-shadow(0 4px 4px rgba(60,40,32,0.4))';
    return (
      <g key={`wl${wl.id}`} style={{ filter: flashFilter }}>
        <g transform={`translate(${cx - sz / 2} ${cy - sz / 2 - 2})`}>
          <NougatWall size={sz} />
        </g>
        <g transform={`translate(${cx - 22} ${cy - sz / 2 - 10})`}>
          <rect x="0" y="0" width="44" height="6" rx="3" fill="white" stroke="#E5DCC5" strokeWidth="1" />
          <rect x="2" y="1.5" width={40 * hpPct} height="3" rx="1.5"
                fill={hpPct > 0.5 ? '#8FCFAE' : hpPct > 0.25 ? '#F8E060' : '#F58CA6'} />
        </g>
      </g>
    );
  });

  const obstacleEls = world.obstacles.map(ob => {
    const cx = ob.gx * T + T / 2, cy = ob.gy * T + T / 2;
    const sz = T * 0.92;
    const hpPct = ob.hp / ob.maxHp;
    const damaged = hpPct < 1;
    const flashFilter = ob.flash > 0
      ? 'brightness(1.5) saturate(0.5)'
      : 'drop-shadow(0 5px 4px rgba(60,40,32,0.45))';
    return (
      <g
        key={`ob${ob.id}`}
        style={{ cursor: 'crosshair', filter: flashFilter }}
        onClick={(e) => { e.stopPropagation(); onObstacleClick(ob.id); }}
      >
        <g transform={`translate(${cx - sz / 2} ${cy - sz / 2})`}>
          <Boulder size={sz} />
        </g>
        {damaged && (
          <g transform={`translate(${cx - 22} ${cy - sz / 2 - 10})`}>
            <rect x="0" y="0" width="44" height="6" rx="3" fill="white" stroke="#E5DCC5" strokeWidth="1" />
            <rect x="2" y="1.5" width={40 * hpPct} height="3" rx="1.5"
                  fill={hpPct > 0.5 ? '#8FCFAE' : hpPct > 0.25 ? '#F8E060' : '#F58CA6'} />
          </g>
        )}
        {/* Reward hint badge (sugar coin + amount) */}
        <g transform={`translate(${cx + T * 0.30} ${cy - T * 0.32})`}>
          <circle r="11" fill="#FFD9A0" stroke="#F5B872" strokeWidth="2" />
          <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="800" fill="#8B5E3C" fontFamily="Fredoka, sans-serif">+{ob.reward}</text>
        </g>
      </g>
    );
  });

  const bgPrimary = theme?.bgPrimary || '#C4E4D4';
  const bgSecondary = theme?.bgSecondary || '#D4ECDD';
  const pathStyle = theme?.pathStyle;
  const pathOuter = pathStyle?.outer || '#E0BC8C';
  const pathInner = pathStyle?.inner || '#F5DEB3';
  const pathInnerOpacity = pathStyle?.innerOpacity ?? 1;
  const sprinkleColors = pathStyle?.sprinkles || ['#FFB5C5', '#7BC4A0', '#F8E060', '#B79CD1', '#F5B872'];

  // Per-level grass decorations (rendered above tiles, below path).
  const decorationEls = (theme?.decorations || []).map((d, i) => {
    const Comp = DECOR_COMPONENTS[d.type];
    if (!Comp) return null;
    const cx = d.gx * T + T / 2, cy = d.gy * T + T / 2;
    const sz = d.size || T * 0.85;
    return (
      <g key={`decor-${i}`} style={{ pointerEvents: 'none' }} transform={`translate(${cx - sz / 2} ${cy - sz / 2})`}>
        <Comp size={sz} />
      </g>
    );
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%" height="100%"
      style={{ display: 'block', cursor: ghost ? 'crosshair' : 'default' }}
      onClick={onCellClick}
      onContextMenu={onCellRightClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <defs>
        <pattern id="grassPatA" x="0" y="0" width={T} height={T} patternUnits="userSpaceOnUse">
          <rect width={T} height={T} fill={bgPrimary} />
          <circle cx={T * 0.25} cy={T * 0.3} r="3" fill="#A8D9C0" opacity="0.55" />
          <circle cx={T * 0.7} cy={T * 0.6} r="2.5" fill="#A8D9C0" opacity="0.45" />
          <circle cx={T * 0.4} cy={T * 0.8} r="2" fill="#FFB5C5" opacity="0.45" />
        </pattern>
        <pattern id="grassPatB" x="0" y="0" width={T} height={T} patternUnits="userSpaceOnUse">
          <rect width={T} height={T} fill={bgSecondary} />
          <circle cx={T * 0.6} cy={T * 0.25} r="2.5" fill="#A8D9C0" opacity="0.45" />
          <circle cx={T * 0.2} cy={T * 0.6} r="2" fill="#F8E060" opacity="0.55" />
          <circle cx={T * 0.8} cy={T * 0.85} r="3" fill="#A8D9C0" opacity="0.45" />
        </pattern>
        {/* Tower base radial gradient — dome look */}
        <radialGradient id="sd-baseGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFF1DC" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#E8C9A8" stopOpacity="0.6" />
        </radialGradient>
        {/* Silver ring */}
        <linearGradient id="sd-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8E0D0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B89A87" />
        </linearGradient>
        {/* Rainbow ring (L3) */}
        <linearGradient id="sd-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#F58CA6" />
          <stop offset="25%"  stopColor="#F8E060" />
          <stop offset="50%"  stopColor="#8FCFAE" />
          <stop offset="75%"  stopColor="#B79CD1" />
          <stop offset="100%" stopColor="#F58CA6" />
        </linearGradient>
        {/* Pink → deep pink gradient for the upgrade pill */}
        <linearGradient id="sd-upgrade-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor="#FFB5C5" />
          <stop offset="100%" stopColor="#F58CA6" />
        </linearGradient>
        <filter id="sd-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {Array.from({ length: ROWS }, (_, gy) =>
        Array.from({ length: COLS }, (_, gx) => (
          <rect key={`${gx}-${gy}`} x={gx * T} y={gy * T} width={T} height={T} fill={(gx + gy) % 2 === 0 ? 'url(#grassPatA)' : 'url(#grassPatB)'} />
        ))
      )}

      {Array.from({ length: COLS + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * T} y1="0" x2={i * T} y2={H} stroke="#A8D9C0" strokeWidth="0.5" opacity="0.4" />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * T} x2={W} y2={i * T} stroke="#A8D9C0" strokeWidth="0.5" opacity="0.4" />
      ))}

      {decorationEls}

      {/* T6 frozen tile overlay — light blue tint with snowflake corner. */}
      {(world.level.frozenCells || []).map(([gx, gy], i) => (
        <g key={`frz-${i}`} style={{ pointerEvents: 'none' }}>
          <rect
            x={gx * T + 2} y={gy * T + 2}
            width={T - 4} height={T - 4}
            rx="6"
            fill="rgba(176,220,238,0.45)"
            stroke="rgba(123,182,224,0.7)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={gx * T + T - 14}
            y={gy * T + 16}
            fontSize="14"
            opacity="0.85"
          >❄</text>
        </g>
      ))}

      {world.paths.map((pathObj, pIdx) => (
        <g key={`path-${pIdx}`}>
          <polyline points={pathObj.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={pathOuter} strokeWidth={T * 0.95} strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={pathObj.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={pathInner} strokeWidth={T * 0.78} strokeLinejoin="round" strokeLinecap="round" opacity={pathInnerOpacity} />
          {pathStyle && pathStyle.stripes && (
            <polyline points={pathObj.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#F8E060" strokeWidth={T * 0.05} strokeDasharray="14 14" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
          )}
          {pathStyle && pathStyle.cracks && (
            <polyline points={pathObj.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#7BB6E0" strokeWidth="1.2" strokeDasharray="3 6" strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />
          )}
        </g>
      ))}

      {world.paths.flatMap((pathObj, pIdx) => pathObj.grid.filter((_, i) => i % 2 === 0).map(([gx, gy], i) => {
        const cx = gx * T + T / 2, cy = gy * T + T / 2;
        return (
          <g key={`sp${pIdx}-${i}`}>
            <rect x={cx - 18} y={cy - 12} width="6" height="2.5" rx="1.2" fill={sprinkleColors[i % sprinkleColors.length]} transform={`rotate(${(i * 37) % 180 - 90} ${cx - 15} ${cy - 11})`} />
            <rect x={cx + 10} y={cy + 8} width="6" height="2.5" rx="1.2" fill={sprinkleColors[(i + 2) % sprinkleColors.length]} transform={`rotate(${(i * 53) % 180 - 90} ${cx + 13} ${cy + 9})`} />
          </g>
        );
      }))}

      {/* Entry markers — one per path */}
      {world.paths.map((pathObj, pIdx) => {
        const p = pathObj.points[0];
        return (
          <g key={`entry-${pIdx}`}>
            <circle cx={p.x - 18} cy={p.y} r="22" fill="#8FCFAE" stroke="white" strokeWidth="3" />
            <text x={p.x - 18} y={p.y + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="white" fontFamily="Fredoka, sans-serif">起</text>
          </g>
        );
      })}

      {(() => {
        // Castle is at the end of the (primary) path.
        const p = world.paths[0].points[world.paths[0].points.length - 1];
        return (
          <g transform={`translate(${p.x + T / 2 - 50} ${p.y - 50})`}>
            <rect x="0" y="20" width="46" height="50" rx="4" fill="#FFE5EC" />
            <path d="M 0 20 L 6 8 L 12 20 L 18 8 L 24 20 L 30 8 L 36 20 L 42 8 L 46 20 Z" fill="#F58CA6" />
            <rect x="18" y="40" width="10" height="30" fill="#5A3E36" />
            <circle cx="23" cy="14" r="5" fill="#F58CA6" />
            <text x="23" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5A3E36" fontFamily="Fredoka, sans-serif">糖果城堡</text>
          </g>
        );
      })()}

      {selectedRange}
      {obstacleEls}
      {wallEls}
      {towerEls}
      {ghostEl}
      {enemyEls}
      {projectileEls}
      {beamEls}
      {shockwaveEls}
      {flashEls}
      {burstEls}
      {focusEl}
      {floatEls}
      {selectedTw && onUpgrade && onSell && (
        <TowerActionPopover
          tower={selectedTw}
          world={world}
          sugar={world.sugar}
          onUpgrade={onUpgrade}
          onSell={onSell}
        />
      )}
    </svg>
  );
}
