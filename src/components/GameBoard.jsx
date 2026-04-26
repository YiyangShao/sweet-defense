import { TOWER_DEFS, ENEMY_DEFS, T, COLS, ROWS, W, H, PATH_GRID } from '../game/constants.js';
import { PATH, posAt } from '../game/path.js';
import { towerStats } from '../game/world.js';

export default function GameBoard({
  world, ghost, theme,
  svgRef,
  onCellClick, onCellRightClick, onTowerClick,
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
      <g key={e.id} transform={`translate(${ep.x} ${ep.y})`} style={{ filter: e.flash > 0 ? 'brightness(1.5) saturate(0.6)' : undefined }}>
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
    const sz = T * (tw.shootPulse > 0 ? 1.04 : 1.0);
    const isSelected = world.selectedPlacedTower === tw.id;
    return (
      <g key={tw.id} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onTowerClick(tw.id); }}>
        <ellipse cx={cx} cy={cy + 8} rx={T * 0.42} ry={T * 0.18} fill="rgba(90,62,54,0.12)" />
        <circle cx={cx} cy={cy} r={T * 0.42} fill={isSelected ? 'rgba(255, 234, 208, 0.95)' : 'white'} opacity={isSelected ? 1 : 0.5} stroke={isSelected ? 'var(--pink-deep)' : 'transparent'} strokeWidth="3" />
        <g transform={`translate(${cx - sz / 2} ${cy - sz / 2 - 4})`}>
          <Comp size={sz} />
        </g>
        {tw.level > 1 && (
          <g transform={`translate(${cx + T * 0.22} ${cy - T * 0.22})`}>
            <circle r="11" fill="white" stroke="#F58CA6" strokeWidth="2" />
            <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#F58CA6" fontFamily="Fredoka, sans-serif">{tw.level}</text>
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
        <line x1={p.fromX} y1={p.fromY} x2={x} y2={y} stroke={p.color} strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
        <circle cx={x} cy={y} r={p.size} fill={p.color} />
        <circle cx={x} cy={y} r={p.size - 2} fill="white" opacity="0.4" />
      </g>
    );
  });

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
    const def = TOWER_DEFS[ghost.type];
    const Comp = def.Comp;
    const cx = ghost.gx * T + T / 2, cy = ghost.gy * T + T / 2;
    const valid = ghost.valid;
    return (
      <g style={{ pointerEvents: 'none' }}>
        <circle cx={cx} cy={cy} r={def.range * T} fill={valid ? 'rgba(143,207,174,0.18)' : 'rgba(245,140,166,0.18)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="8 6" />
        <rect x={ghost.gx * T + 4} y={ghost.gy * T + 4} width={T - 8} height={T - 8} rx="14" fill={valid ? 'rgba(143,207,174,0.22)' : 'rgba(245,140,166,0.22)'} stroke={valid ? '#8FCFAE' : '#F58CA6'} strokeWidth="3" strokeDasharray="6 4" />
        <g transform={`translate(${cx - T / 2} ${cy - T / 2 - 4})`} opacity="0.7">
          <Comp size={T} />
        </g>
      </g>
    );
  })();

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
      {towerEls}
      {ghostEl}
      {enemyEls}
      {projectileEls}
      {floatEls}
    </svg>
  );
}
