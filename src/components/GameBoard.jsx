import { TOWER_DEFS, ENEMY_DEFS, WALL_DEFS, T, COLS, ROWS, W, H, PATH_GRID } from '../game/constants.js';
import { Boulder, NougatWall } from '../art/structures.jsx';
import { PATH, posAt } from '../game/path.js';
import { towerStats } from '../game/world.js';

export default function GameBoard({
  world, ghost, theme,
  svgRef,
  onCellClick, onCellRightClick, onTowerClick, onObstacleClick, onEnemyClick,
  onMouseMove, onMouseLeave,
}) {
  const enemyEls = world.enemies.map(e => {
    const ep = posAt(e.dist);
    const def = ENEMY_DEFS[e.type];
    const Comp = def.Comp;
    const size = def.boss ? T * 1.2 : T * 0.78;
    const hpPct = e.hp / e.maxHp;
    const hpW = def.boss ? 70 : 44;
    return (
      <g
        key={e.id}
        transform={`translate(${ep.x} ${ep.y})`}
        style={{
          cursor: 'crosshair',
          filter: e.flash > 0 ? 'brightness(1.6) saturate(0.5)' : `drop-shadow(0 ${def.boss ? 6 : 4}px ${def.boss ? 6 : 4}px rgba(60,40,32,0.45))`,
        }}
        onClick={(ev) => { ev.stopPropagation(); onEnemyClick && onEnemyClick(e.id); }}
      >
        <g transform={`translate(${-size / 2} ${-size / 2})`}>
          <Comp size={size} />
        </g>
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
      </g>
    );
  });

  const towerEls = world.towers.map(tw => {
    const def = TOWER_DEFS[tw.type];
    const Comp = def.Comp;
    const cx = tw.gx * T + T / 2, cy = tw.gy * T + T / 2;
    const lvl = tw.level;
    // Size scales subtly by level; shoot-pulse is more punchy now
    const lvlScale = 1 + (lvl - 1) * 0.06;
    const sz = T * (tw.shootPulse > 0 ? lvlScale * 1.10 : lvlScale * 1.0);
    const isSelected = world.selectedPlacedTower === tw.id;

    return (
      <g key={tw.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onTowerClick(tw.id); }}>
        {/* Soft ground contact shadow (extended for 3D depth) */}
        <ellipse cx={cx} cy={cy + 14} rx={T * 0.46} ry={T * 0.16} fill="rgba(60,40,32,0.30)" filter="url(#sd-blur)" />
        <ellipse cx={cx} cy={cy + 10} rx={T * 0.40} ry={T * 0.12} fill="rgba(60,40,32,0.18)" />

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
      </g>
    );
  });

  const projectileEls = world.projectiles.map(p => {
    const x = p.fromX + (p.toX - p.fromX) * p.t;
    const y = p.fromY + (p.toY - p.fromY) * p.t;
    return (
      <g key={p.id}>
        <line x1={p.fromX} y1={p.fromY} x2={x} y2={y} stroke={p.color} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.5" />
        <circle cx={x} cy={y} r={p.size + 3} fill={p.color} opacity="0.35" />
        <circle cx={x} cy={y} r={p.size} fill={p.color} />
        <circle cx={x - 1.5} cy={y - 1.5} r={p.size - 2.5} fill="white" opacity="0.55" />
      </g>
    );
  });

  // Muzzle flashes
  const flashEls = world.flashes.map(f => {
    const pt = f.t / f.dur;
    const r = 18 * (1 + pt * 1.3);
    return (
      <g key={f.id}>
        <circle cx={f.x} cy={f.y} r={r} fill={f.color} opacity={(1 - pt) * 0.55} />
        <circle cx={f.x} cy={f.y} r={r * 0.55} fill="white" opacity={(1 - pt) * 0.85} />
      </g>
    );
  });

  // Hit-impact particle bursts
  const burstEls = world.bursts.map(b => {
    const pt = b.t / b.dur;
    return (
      <g key={b.id}>
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
      if (ent) pos = posAt(ent.dist);
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
    <g key={f.id} transform={`translate(${f.x} ${f.y - f.t * 50})`} style={{ opacity: 1 - f.t / 0.7 }}>
      <text textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize={f.text === '闪避' ? 16 : 22} fill={f.color}
            stroke="white" strokeWidth="3" paintOrder="stroke">
        {f.text}
      </text>
    </g>
  ));

  const selectedTw = world.selectedPlacedTower != null ? world.towers.find(t => t.id === world.selectedPlacedTower) : null;
  const selectedRange = selectedTw && (() => {
    const stats = towerStats(selectedTw);
    const cx = selectedTw.gx * T + T / 2, cy = selectedTw.gy * T + T / 2;
    return (
      <circle cx={cx} cy={cy} r={stats.range * T} fill="rgba(255,181,197,0.18)" stroke="#F58CA6" strokeWidth="3" strokeDasharray="8 6" />
    );
  })();

  const ghostEl = ghost && (() => {
    const isWall = ghost.kind === 'wall';
    const def = isWall ? WALL_DEFS.wall : TOWER_DEFS[ghost.type];
    const Comp = def.Comp;
    const cx = ghost.gx * T + T / 2, cy = ghost.gy * T + T / 2;
    const valid = ghost.valid;
    return (
      <g style={{ pointerEvents: 'none' }}>
        {!isWall && (
          <circle cx={cx} cy={cy} r={def.range * T} fill={valid ? 'rgba(143,207,174,0.18)' : 'rgba(245,140,166,0.18)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="8 6" />
        )}
        <rect x={ghost.gx * T + 4} y={ghost.gy * T + 4} width={T - 8} height={T - 8} rx="14" fill={valid ? 'rgba(143,207,174,0.22)' : 'rgba(245,140,166,0.22)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="6 4" />
        <g transform={`translate(${cx - T / 2} ${cy - T / 2 - 4})`} opacity="0.7">
          <Comp size={T} />
        </g>
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

      <polyline points={PATH.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#E0BC8C" strokeWidth={T * 0.95} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={PATH.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#F5DEB3" strokeWidth={T * 0.78} strokeLinejoin="round" strokeLinecap="round" />

      {PATH_GRID.filter((_, i) => i % 2 === 0).map(([gx, gy], i) => {
        const cx = gx * T + T / 2, cy = gy * T + T / 2;
        const colors = ['#FFB5C5', '#7BC4A0', '#F8E060', '#B79CD1', '#F5B872'];
        return (
          <g key={`sp${i}`}>
            <rect x={cx - 18} y={cy - 12} width="6" height="2.5" rx="1.2" fill={colors[i % 5]} transform={`rotate(${(i * 37) % 180 - 90} ${cx - 15} ${cy - 11})`} />
            <rect x={cx + 10} y={cy + 8} width="6" height="2.5" rx="1.2" fill={colors[(i + 2) % 5]} transform={`rotate(${(i * 53) % 180 - 90} ${cx + 13} ${cy + 9})`} />
          </g>
        );
      })}

      {(() => {
        const p = PATH.points[0];
        return (
          <g>
            <circle cx={p.x - 18} cy={p.y} r="22" fill="#8FCFAE" stroke="white" strokeWidth="3" />
            <text x={p.x - 18} y={p.y + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="white" fontFamily="Fredoka, sans-serif">起</text>
          </g>
        );
      })()}

      {(() => {
        const p = PATH.points[PATH.points.length - 1];
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
      {flashEls}
      {burstEls}
      {focusEl}
      {floatEls}
    </svg>
  );
}
