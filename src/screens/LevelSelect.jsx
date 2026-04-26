import { LEVELS } from '../game/constants.js';
import { Star } from '../art/icons.jsx';

export default function LevelSelect({ progress, onPick, onBack }) {
  const totalEarned = Object.values(progress.stars || {}).reduce((a, b) => a + b, 0);
  const totalPossible = LEVELS.length * 3;

  return (
    <div className="sprinkle-bg full" style={{ padding: 24, position: 'relative', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, maxWidth: 1100, margin: '0 auto 20px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 32 }}>选择关卡</h2>
        <div className="stat-pill"><Star size={18} /> <span>{totalEarned} / {totalPossible}</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, maxWidth: 1100, margin: '0 auto' }}>
        {LEVELS.map((lv, i) => {
          const stars = progress.stars?.[i] || 0;
          const unlocked = i < (progress.unlocked || 1);
          const isCurrent = unlocked && stars === 0;
          return (
            <div
              key={lv.id}
              className="cute-card"
              onClick={() => unlocked && onPick(i)}
              style={{
                padding: 18,
                opacity: unlocked ? 1 : 0.55,
                border: isCurrent ? '3px solid var(--pink-deep)' : undefined,
                boxShadow: isCurrent ? '0 8px 24px rgba(245,140,166,0.35)' : undefined,
                position: 'relative',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                height: 110,
                background: `linear-gradient(135deg, ${lv.accent} 0%, white 100%)`,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="font-display" style={{ fontSize: 64, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                  {lv.id}
                </div>
                {!unlocked && (
                  <div style={{ position: 'absolute', fontSize: 36 }}>🔒</div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--pink-deep)', color: 'white', fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
                    当前
                  </div>
                )}
                {stars === 3 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#F8E060', color: '#5A3E36', fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
                    全星
                  </div>
                )}
              </div>
              <div className="font-display" style={{ fontSize: 18, marginBottom: 6 }}>{lv.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map(s => <Star key={s} size={20} filled={s <= stars} />)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                  {lv.waves.length} 波
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
