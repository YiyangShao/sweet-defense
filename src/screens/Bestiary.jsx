import { ENEMY_DEFS } from '../game/constants.js';

const ORDER = ['mouse', 'rabbit', 'hedgehog', 'squirrel', 'raccoon', 'pigeon', 'fox', 'healer', 'shielded', 'splitter', 'bear'];

export default function Bestiary({ onBack }) {
  return (
    <div className="sprinkle-bg full" style={{ padding: 24, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, maxWidth: 1100, margin: '0 auto 18px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 28 }}>动物图鉴</h2>
        <div className="stat-pill"><span>共 8 种</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 1100, margin: '0 auto' }}>
        {ORDER.map(id => {
          const def = ENEMY_DEFS[id];
          const Comp = def.Comp;
          return (
            <div key={id} className="cute-card" style={{
              padding: 14, textAlign: 'center',
              background: def.boss ? 'linear-gradient(180deg, #FFE5EC 0%, white 100%)' : 'white'
            }}>
              <div style={{
                background: 'var(--cream)', borderRadius: 14, padding: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 110, marginBottom: 8
              }}>
                <Comp size={88} />
              </div>
              <div style={{
                display: 'inline-block',
                background: def.boss ? 'var(--pink-deep)' : 'var(--cream-2)',
                color: def.boss ? 'white' : 'var(--ink-soft)',
                fontSize: 10, padding: '2px 8px', borderRadius: 999,
                marginBottom: 4, fontWeight: 700, letterSpacing: '0.1em'
              }}>{def.tag}</div>
              <div className="font-display" style={{ fontSize: 16 }}>{def.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>{def.desc}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, color: 'var(--ink-soft)', marginTop: 6 }}>
                <div>HP: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{def.hp}</span></div>
                <div>速度: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{def.speed.toFixed(1)}</span></div>
                <div>奖励: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>+{def.reward}</span></div>
                <div>伤害: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{def.damage}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
