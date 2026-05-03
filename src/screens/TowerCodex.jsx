// Tower codex — every tower's identity card. Shows attack archetype, synergy
// geometry as a mini-grid, recommended partners, and core stats. Built to
// answer "what does this tower actually DO" without reading code.

import { TOWER_DEFS, TOWER_ORDER } from '../game/constants.js';
import { Sugar } from '../art/icons.jsx';

const KIND_LABEL = {
  point:        { name: '点射',         icon: '🎯', color: 'var(--ink-soft)' },
  splash:       { name: '环形 splash',  icon: '💥', color: 'var(--peach-deep)' },
  multiSplash:  { name: '多发 splash',  icon: '☔', color: '#F8E060' },
  beam:         { name: '直线穿透',     icon: '➡',  color: 'var(--lavender-deep)' },
  boomerang:    { name: '回旋镖',       icon: '↩',  color: 'var(--pink-deep)' },
  wave:         { name: '光波圈',       icon: '◎',  color: 'var(--mint-deep)' },
  chain:        { name: '连电',         icon: '⚡', color: '#5A3E36' },
  melee:        { name: '近战 · 蓄力',  icon: '⚔',  color: 'var(--peach-deep)' },
  chainBounce:  { name: '弹链 · 双击',  icon: '↯',  color: 'var(--pink-deep)' },
};

const GEOM_LABEL = {
  neighbor8:   { name: '8 邻位',  cells: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]] },
  orthogonal4: { name: '十字 4 邻', cells: [[0,-1],[-1,0],[1,0],[0,1]] },
  diagonal4:   { name: '斜对角 4 邻', cells: [[-1,-1],[1,-1],[-1,1],[1,1]] },
  row:         { name: '整行同高',  cells: 'row' },
  column:      { name: '整列同列',  cells: 'column' },
  circle2:     { name: '2 格半径圆', cells: 'circle' },
};

// Hand-curated "推荐搭配" — the synergy combos that actually unlock value.
const PARTNERS = {
  cookie:     ['cake', 'cupcake'],
  cupcake:    ['cookie', 'cake'],
  macaron:    ['cake', 'choco'],
  donut:      ['strawberry', 'lemon'],
  icecream:   ['lemon', 'lollipop'],
  lollipop:   ['icecream', 'cake'],
  choco:      ['cookie', 'donut'],
  cake:       ['cookie', 'macaron'],
  lemon:      ['icecream', 'donut'],
  strawberry: ['donut', 'cookie'],
  banana:     ['cookie', 'donut'],
};

function MiniGeomGrid({ geometry }) {
  // 5x5 mini-grid showing self (centre) + buffed cells
  const SZ = 14, GAP = 2;
  const def = GEOM_LABEL[geometry];
  if (!def) return null;
  // Build cell map
  const cellSet = new Set();
  if (Array.isArray(def.cells)) {
    def.cells.forEach(([dx, dy]) => cellSet.add(`${dx},${dy}`));
  } else if (def.cells === 'row') {
    for (let dx = -2; dx <= 2; dx++) if (dx !== 0) cellSet.add(`${dx},0`);
  } else if (def.cells === 'column') {
    for (let dy = -2; dy <= 2; dy++) if (dy !== 0) cellSet.add(`0,${dy}`);
  } else if (def.cells === 'circle') {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (dx * dx + dy * dy <= 4) cellSet.add(`${dx},${dy}`);
      }
    }
  }
  const cells = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const isSelf = dx === 0 && dy === 0;
      const isBuff = cellSet.has(`${dx},${dy}`);
      cells.push(
        <rect key={`${dx},${dy}`}
          x={(dx + 2) * (SZ + GAP)} y={(dy + 2) * (SZ + GAP)}
          width={SZ} height={SZ} rx="2"
          fill={isSelf ? 'var(--pink-deep)' : isBuff ? '#F8E060' : 'var(--cream-2)'}
          stroke={isSelf ? 'white' : '#fff'} strokeWidth="1"
        />
      );
    }
  }
  return (
    <svg width={5 * (SZ + GAP)} height={5 * (SZ + GAP)}>{cells}</svg>
  );
}

function describeBuff(s) {
  const out = [];
  if (s.dmgMul) out.push(`攻 +${(s.dmgMul * 100).toFixed(0)}%`);
  if (s.rangeMul) out.push(`程 +${(s.rangeMul * 100).toFixed(0)}%`);
  if (s.cdMul) out.push(`速 +${(-s.cdMul * 100).toFixed(0)}%`);
  if (s.splashMul) out.push(`范 +${(s.splashMul * 100).toFixed(0)}%`);
  if (s.critChance) out.push(`暴击 +${(s.critChance * 100).toFixed(0)}%`);
  if (s.multiShot) out.push(`多发 +${(s.multiShot * 100).toFixed(0)}%`);
  if (s.executeBonus) out.push(`残血 +${(s.executeBonus * 100).toFixed(0)}%`);
  if (s.stunChance) out.push(`眩晕概率 +${(s.stunChance * 100).toFixed(0)}%`);
  if (s.stunDuration) out.push(`眩晕时长 +${s.stunDuration}s`);
  if (s.statusDuration) out.push(`状态 +${(s.statusDuration * 100).toFixed(0)}%`);
  if (s.slowFactor) out.push(`减速狠 ${(s.slowFactor * 100).toFixed(0)}%`);
  if (s.dotDamage) out.push(`DOT +${(s.dotDamage * 100).toFixed(0)}%`);
  if (s.knockback) out.push(`击退 +${s.knockback}`);
  return out.join(' · ');
}

export default function TowerCodex({ onBack }) {
  return (
    <div className="sprinkle-bg full" style={{ padding: 24, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, maxWidth: 1180, margin: '0 auto 18px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 28 }}>炮塔图鉴</h2>
        <div className="stat-pill"><span>共 {TOWER_ORDER.length} 种</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, maxWidth: 1180, margin: '0 auto' }}>
        {TOWER_ORDER.map(id => {
          const def = TOWER_DEFS[id];
          if (!def) return null;
          const Comp = def.Comp;
          const kind = KIND_LABEL[def.attackKind] || KIND_LABEL.point;
          const partners = PARTNERS[id] || [];
          return (
            <div key={id} className="cute-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--cream)', borderRadius: 14, padding: 6, width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Comp size={56} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-display" style={{ fontSize: 18 }}>{def.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 }}>{def.role}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: kind.color, color: 'white',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  }}>
                    {kind.icon} {kind.name}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'var(--cream)', padding: '3px 8px', borderRadius: 999, fontWeight: 800, fontSize: 12, color: 'var(--ink)', height: 24 }}>
                  <Sugar size={12} /> {def.cost}
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {def.desc}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, color: 'var(--ink-soft)' }}>
                <div>攻 <b style={{ color: 'var(--ink)' }}>{def.dmg}</b></div>
                <div>程 <b style={{ color: 'var(--ink)' }}>{def.range}</b></div>
                <div>速 <b style={{ color: 'var(--ink)' }}>{(1 / def.cd).toFixed(1)}/s</b></div>
                <div>cd <b style={{ color: 'var(--ink)' }}>{def.cd.toFixed(2)}s</b></div>
              </div>

              {def.synergy && (
                <div style={{ background: 'linear-gradient(135deg, #FFF1C4 0%, #FFE5B4 100%)', borderRadius: 10, padding: '8px 10px', display: 'flex', gap: 10 }}>
                  <MiniGeomGrid geometry={def.synergy.geometry} />
                  <div style={{ flex: 1, fontSize: 10.5, color: '#8B5E3C' }}>
                    <div style={{ fontWeight: 800, marginBottom: 2 }}>
                      ✦ {GEOM_LABEL[def.synergy.geometry]?.name || '协同'}
                    </div>
                    <div style={{ lineHeight: 1.4 }}>{describeBuff(def.synergy)}</div>
                  </div>
                </div>
              )}

              {partners.length > 0 && (
                <div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>
                  推荐搭配：
                  {partners.map((p, i) => (
                    <span key={p} style={{ color: 'var(--ink)', fontWeight: 700 }}>
                      {i > 0 ? ' · ' : ' '}{TOWER_DEFS[p]?.name || p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
