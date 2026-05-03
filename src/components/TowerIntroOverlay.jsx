// First-time tower introduction. Whenever the player enters a level whose
// pool contains a tower they've never seen, queue a modal for that tower.
// Multiple new towers in one entry are queued and shown one-by-one.

import { TOWER_DEFS } from '../game/constants.js';

const KIND_LINE = {
  point:        '🎯 点射 — 标准单点投射',
  splash:       '💥 环形 splash — 落地溅射群伤',
  multiSplash:  '☔ 多发酸雨 — 同时三发 splash',
  beam:         '➡ 直线穿透 — 物理糖针，沿途打',
  boomerang:    '↩ 回旋镖 — 绕塔一整圈',
  wave:         '◎ 光波圈 — 周期向外扩，停留 3 秒冻结',
  chain:        '⚡ 连电 — 同时电连多目标，附燃烧',
  melee:        '⚔ 近战蓄力 — 5 击触发圆形群攻',
  chainBounce:  '↯ 弹链 — 弹跳 3 跳，30% 双击',
};

const GEOM_LINE = {
  neighbor8:   '✦ 给周围 8 邻位塔提供加成',
  orthogonal4: '✦ 给十字 4 邻塔（上下左右）加成',
  diagonal4:   '✦ 给斜对角 4 邻塔加成',
  row:         '✦ 给整行同高的所有塔加成',
  column:      '✦ 给整列同列的所有塔加成',
  circle2:     '✦ 给 2 格半径圆内所有塔加成',
};

function buffOneLine(s) {
  if (!s) return '';
  const parts = [];
  if (s.dmgMul) parts.push(`攻 +${(s.dmgMul * 100).toFixed(0)}%`);
  if (s.rangeMul) parts.push(`程 +${(s.rangeMul * 100).toFixed(0)}%`);
  if (s.cdMul) parts.push(`速 +${(-s.cdMul * 100).toFixed(0)}%`);
  if (s.splashMul) parts.push(`范 +${(s.splashMul * 100).toFixed(0)}%`);
  if (s.executeBonus) parts.push(`残血加伤 +${(s.executeBonus * 100).toFixed(0)}%`);
  if (s.statusDuration) parts.push(`状态时长 +${(s.statusDuration * 100).toFixed(0)}%`);
  if (s.stunChance) parts.push(`眩晕概率 +${(s.stunChance * 100).toFixed(0)}%`);
  if (s.dotDamage) parts.push(`DOT +${(s.dotDamage * 100).toFixed(0)}%`);
  if (s.slowFactor) parts.push(`减速更狠`);
  if (s.multiShot) parts.push(`多发概率 +${(s.multiShot * 100).toFixed(0)}%`);
  if (s.knockback) parts.push(`击退距离 +${s.knockback}`);
  return parts.join(' · ');
}

function towerSeenKey(type) { return `sd-tower-seen-${type}-v1`; }

export function unseenTowers(types) {
  return (types || []).filter(t => {
    if (!TOWER_DEFS[t]) return false;
    try { return localStorage.getItem(towerSeenKey(t)) !== '1'; } catch { return false; }
  });
}

export function markTowerSeen(type) {
  try { localStorage.setItem(towerSeenKey(type), '1'); } catch {}
}

export default function TowerIntroOverlay({ towerType, remaining, onDismiss }) {
  const def = TOWER_DEFS[towerType];
  if (!def) return null;
  const Comp = def.Comp;

  return (
    <div className="modal-backdrop" style={{ zIndex: 80 }} onClick={onDismiss}>
      <div
        className="cute-card modal-in"
        style={{ width: 'min(540px, 92%)', padding: 24, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="font-display" style={{ fontSize: 12, letterSpacing: '0.3em', color: 'var(--peach-deep)', marginBottom: 4 }}>
          ✦ 解锁新塔
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <div style={{ background: 'linear-gradient(180deg, #FFE5EC 0%, #FFD9E0 100%)',
                         borderRadius: 22, padding: 10, width: 110, height: 110,
                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div className="floaty"><Comp size={86} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="font-display" style={{ fontSize: 26, marginBottom: 4 }}>
              {def.name}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 }}>
              {def.role} · 价格 {def.cost} 糖
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              {def.desc}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--ink)' }}>
            {KIND_LINE[def.attackKind] || def.attackKind}
          </div>
          {def.synergy && (
            <div style={{ background: 'linear-gradient(135deg, #FFF1C4 0%, #FFE5B4 100%)', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, color: '#8B5E3C' }}>
              <div style={{ fontWeight: 800, marginBottom: 2 }}>{GEOM_LINE[def.synergy.geometry] || '协同加成'}</div>
              <div style={{ lineHeight: 1.4 }}>{buffOneLine(def.synergy)}</div>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', padding: '4px 0' }}>
            🎯 攻 {def.dmg} · 程 {def.range} · 射速 {(1 / def.cd).toFixed(1)}/s
          </div>
        </div>

        <button
          className="bubble-btn primary"
          style={{ width: '100%', padding: '14px', fontSize: 15 }}
          onClick={onDismiss}
        >
          {remaining > 0 ? `知道了，下一个 (还有 ${remaining})` : '知道了，开战！'}
        </button>
      </div>
    </div>
  );
}
