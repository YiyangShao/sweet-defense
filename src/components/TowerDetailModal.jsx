import { TOWER_DEFS } from '../game/constants.js';
import { towerStats, upgradeCost, sellRefund } from '../game/world.js';
import { Sugar } from '../art/icons.jsx';

export default function TowerDetailModal({ tower, sugar, onUpgrade, onSell, onClose }) {
  const def = TOWER_DEFS[tower.type];
  const stats = towerStats(tower);
  const Comp = def.Comp;
  const upCost = upgradeCost(tower);
  const refund = sellRefund(tower);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cute-card modal-in" style={{ width: 'min(520px, 92%)', padding: 24, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div onClick={onClose} style={{ position: 'absolute', top: 10, right: 14, fontSize: 22, color: 'var(--ink-faint)', cursor: 'pointer' }}>×</div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 18 }}>
          <div style={{
            width: 120, height: 120,
            background: 'linear-gradient(180deg, #FFE5EC 0%, #FFD9E0 100%)',
            borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <div className="floaty"><Comp size={100} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--ink-soft)' }}>{def.role.toUpperCase()}</div>
            <h3 className="font-display" style={{ fontSize: 26, marginTop: 2 }}>
              {def.name} <span style={{ fontSize: 13, color: 'var(--pink-deep)' }}>{'★'.repeat(tower.level)}{'☆'.repeat(3 - tower.level)}</span>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{def.desc}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 18 }}>
          {[
            { k: '攻击力', v: stats.dmg.toFixed(0), pct: Math.min(1, stats.dmg / 60), c: 'var(--pink-deep)' },
            { k: '射速', v: (1 / stats.cd).toFixed(1) + '/s', pct: Math.min(1, (1 / stats.cd) / 5), c: 'var(--peach-deep)' },
            { k: '射程', v: stats.range.toFixed(1) + '格', pct: Math.min(1, stats.range / 4), c: 'var(--mint-deep)' },
            { k: '累计花费', v: tower.invested.toString(), pct: Math.min(1, tower.invested / 700), c: 'var(--lavender-deep)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--cream)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--ink-soft)' }}>{s.k}</span>
                <span style={{ fontWeight: 700 }}>{s.v}</span>
              </div>
              <div style={{ height: 6, background: 'white', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${s.pct * 100}%`, height: '100%', background: s.c, borderRadius: 3, transition: 'width .2s' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {upCost !== null ? (
            <button className="bubble-btn primary" disabled={sugar < upCost} style={{ flex: 2, padding: '14px', fontSize: 15 }} onClick={onUpgrade}>
              ⬆ 升级到 {tower.level + 1} 星
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 999, fontSize: 13 }}>
                <Sugar size={13} />{upCost}
              </span>
            </button>
          ) : (
            <div style={{ flex: 2, padding: '14px', fontSize: 14, textAlign: 'center', color: 'var(--ink-soft)', background: 'var(--cream)', borderRadius: 999 }}>已满级 ★★★</div>
          )}
          <button className="bubble-btn" style={{ flex: 1, padding: '14px', fontSize: 14, color: 'var(--ink-soft)' }} onClick={onSell}>
            💰 出售 +{refund}
          </button>
        </div>
      </div>
    </div>
  );
}
