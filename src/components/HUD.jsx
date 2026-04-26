import { Fragment } from 'react';
import { Heart, Sugar } from '../art/icons.jsx';

export default function HUD({ world, totalWaves, onPause, onSpeed, onMenu, muted, onMute }) {
  const wave = world.waveIdx + 1;
  const time = (() => {
    const s = Math.floor(world.elapsed);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  })();
  const preparing = world.waveState === 'preparing';
  const prepLeft = preparing ? Math.max(0, -world.waveTimer) : 0;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, pointerEvents: 'none', zIndex: 5 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', pointerEvents: 'auto' }}>
        <div className="stat-pill"><Heart size={20} /><span style={{ fontSize: 18 }}>{world.hp}</span></div>
        <div className="stat-pill"><Sugar size={20} /><span style={{ fontSize: 18 }}>{world.sugar}</span></div>
        <button className="bubble-btn" style={{ padding: '8px 14px', fontSize: 13 }} onClick={onMenu}>← 关卡</button>
      </div>

      <div className="cute-card font-display" style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 999, pointerEvents: 'auto' }}>
        <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>第</span>
        <span style={{ fontSize: 24, color: 'var(--berry)' }}>{wave}</span>
        <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>/ {totalWaves} 波</span>
        <div style={{ width: 1, height: 20, background: 'var(--cream-3)' }} />
        <span style={{ fontSize: 16 }}>⏱ {time}</span>
        {preparing && wave <= totalWaves && (
          <Fragment>
            <div style={{ width: 1, height: 20, background: 'var(--cream-3)' }} />
            <span style={{ fontSize: 14, color: 'var(--pink-deep)' }}>⏳ {prepLeft.toFixed(1)}s</span>
          </Fragment>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        <button className="bubble-btn" style={{ padding: '10px 14px', fontSize: 14 }} onClick={onMute} title={muted ? '取消静音' : '静音'}>{muted ? '🔇' : '🔊'}</button>
        <button className="bubble-btn" style={{ padding: '10px 14px', fontSize: 14 }} onClick={onPause}>{world.speed === 0 ? '▶' : '⏸'}</button>
        <button className={`bubble-btn ${world.speed === 2 ? 'mint' : ''}`} style={{ padding: '10px 14px', fontSize: 14 }} onClick={onSpeed}>{world.speed === 2 ? '▶▶ 加速中' : '▶▶ 加速'}</button>
      </div>
    </div>
  );
}
