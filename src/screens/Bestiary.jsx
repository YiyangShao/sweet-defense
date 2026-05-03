import { ENEMY_DEFS } from '../game/constants.js';
import { loadAchievementState } from '../game/achievements.js';

const ORDER = [
  'mouse', 'rabbit', 'hedgehog', 'squirrel', 'raccoon',
  'pigeon', 'fox', 'healer', 'shielded', 'splitter',
  'splitter_mini', 'bear',
];

// One-line counter recommendation per enemy.
const COUNTER_TIPS = {
  mouse:        '曲奇饼 / 杯子蛋糕 群杀',
  rabbit:       '冰淇淋光波 / 棒棒糖回旋镖',
  hedgehog:     '马卡龙穿透 / 蛋糕 boss 杀',
  squirrel:     '糖墙阻挡 / 集火击杀',
  raccoon:      '甜甜圈 splash（无视隐身）',
  pigeon:       '马卡龙长射程 / 巧克力连电',
  fox:          '草莓双击 / 多塔覆盖',
  healer:       '集火优先击杀',
  shielded:     '曲奇饼破盾 → 主力收尾',
  splitter:     '远离路径末段击杀',
  splitter_mini: '柠檬 AOE 减速',
  bear:         '蛋糕 + 减速塔 combo',
};

// 1-3 stars threat (compact).
function threatLevel(def) {
  const score = def.hp * 0.05 + def.speed * 8 + (def.damage || 1) * 12 + (def.boss ? 100 : 0);
  if (score >= 80) return 3;
  if (score >= 30) return 2;
  return 1;
}

export default function Bestiary({ onBack }) {
  const ach = loadAchievementState();

  return (
    <div className="sprinkle-bg full" style={{ padding: 24, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, maxWidth: 1180, margin: '0 auto 18px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 28 }}>动物图鉴</h2>
        <div className="stat-pill"><span>共 {ORDER.length} 种 · 累计击败 {ach.stats.kills || 0}</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 1180, margin: '0 auto' }}>
        {ORDER.map(id => {
          const def = ENEMY_DEFS[id];
          if (!def) return null;
          const Comp = def.Comp;
          const threat = threatLevel(def);
          return (
            <div key={id} className="cute-card" style={{
              padding: 14, textAlign: 'center',
              background: def.boss ? 'linear-gradient(180deg, #FFE5EC 0%, white 100%)' : 'white'
            }}>
              <div style={{
                background: 'var(--cream)', borderRadius: 14, padding: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 100, marginBottom: 8, position: 'relative'
              }}>
                <Comp size={80} tint={def.tint} />
                {/* threat indicator */}
                <div style={{ position: 'absolute', top: 4, right: 6, display: 'flex', gap: 1 }}>
                  {[1, 2, 3].map(s => (
                    <span key={s} style={{ fontSize: 10, color: s <= threat ? '#FF4D6D' : 'rgba(0,0,0,0.15)' }}>●</span>
                  ))}
                </div>
              </div>
              <div style={{
                display: 'inline-block',
                background: def.boss ? 'var(--pink-deep)' : 'var(--cream-2)',
                color: def.boss ? 'white' : 'var(--ink-soft)',
                fontSize: 10, padding: '2px 8px', borderRadius: 999,
                marginBottom: 4, fontWeight: 700, letterSpacing: '0.1em'
              }}>{def.tag}</div>
              <div className="font-display" style={{ fontSize: 15 }}>{def.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 6, minHeight: 14 }}>{def.desc}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, color: 'var(--ink-soft)', marginBottom: 6 }}>
                <div>HP <b style={{ color: 'var(--ink)' }}>{def.hp}</b></div>
                <div>速度 <b style={{ color: 'var(--ink)' }}>{def.speed.toFixed(1)}</b></div>
                <div>奖励 <b style={{ color: 'var(--ink)' }}>+{def.reward}</b></div>
                <div>伤害 <b style={{ color: 'var(--ink)' }}>{def.damage}</b></div>
              </div>
              {COUNTER_TIPS[id] && (
                <div style={{
                  fontSize: 10, color: '#5A8FB8',
                  background: 'rgba(168,217,232,0.18)', borderRadius: 8,
                  padding: '4px 6px', lineHeight: 1.3,
                }}>
                  💡 {COUNTER_TIPS[id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
