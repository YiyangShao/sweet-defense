import { ACHIEVEMENTS, getProgress } from '../game/achievements.js';

export default function Achievements({ achState, onBack }) {
  const { stats, unlocked } = achState;
  const earned = ACHIEVEMENTS.filter(a => unlocked[a.id]).length;

  return (
    <div className="sprinkle-bg full" style={{ padding: 24, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, maxWidth: 1100, margin: '0 auto 18px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 28 }}>成就</h2>
        <div className="stat-pill"><span>{earned} / {ACHIEVEMENTS.length}</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 1100, margin: '0 auto' }}>
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = !!unlocked[a.id];
          const { cur, target, pct } = getProgress(a, stats);
          return (
            <div
              key={a.id}
              className="cute-card"
              style={{
                padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                opacity: isUnlocked ? 1 : 0.7,
                background: isUnlocked ? 'linear-gradient(135deg, #FFE5EC 0%, #FFF1C4 100%)' : 'white',
                border: isUnlocked ? '2px solid var(--peach-deep)' : '2px solid var(--cream-2)',
              }}
            >
              <div style={{ fontSize: 32, filter: isUnlocked ? 'none' : 'grayscale(0.8)' }}>{a.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-display" style={{ fontSize: 15, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>{a.desc}</div>
                <div style={{ height: 5, background: 'var(--cream)', borderRadius: 2.5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', background: isUnlocked ? 'var(--peach-deep)' : 'var(--mint-deep)' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginTop: 3 }}>
                  {Math.min(cur, target)} / {target}{isUnlocked && ' ✓'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
