import { useEffect } from 'react';
import { ACHIEVEMENTS } from '../game/achievements.js';

const BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

export default function AchievementToast({ unlocks, onDismiss }) {
  useEffect(() => {
    if (!unlocks || !unlocks.length) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [unlocks, onDismiss]);

  if (!unlocks || !unlocks.length) return null;

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 100, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {unlocks.map((id, i) => {
        const a = BY_ID[id];
        if (!a) return null;
        return (
          <div
            key={`${id}-${i}`}
            className="cute-card"
            style={{
              padding: '12px 18px',
              minWidth: 240,
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, #FFE5EC 0%, #FFF1C4 100%)',
              border: '2px solid var(--peach-deep)',
              animation: 'modalIn 0.4s cubic-bezier(.2,.9,.4,1.2)',
            }}
          >
            <div style={{ fontSize: 32 }}>{a.icon}</div>
            <div>
              <div className="font-display" style={{ fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.15em' }}>✦ 成就解锁</div>
              <div className="font-display" style={{ fontSize: 16 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{a.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
