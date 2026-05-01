import { useState } from 'react';
import { LEVELS, levelsByTheme, levelIndex } from '../game/levels/index.js';
import { THEMES, THEME_UNLOCK_STARS } from '../game/levels/themes.js';
import { Star } from '../art/icons.jsx';

function totalStars(progress) {
  return Object.values(progress.stars || {}).reduce((a, b) => a + b, 0);
}

function isThemeUnlocked(themeId, progress) {
  return totalStars(progress) >= (THEME_UNLOCK_STARS[themeId] || 0);
}

function isLevelUnlocked(idx, progress) {
  return idx < (progress.unlocked || 1);
}

export default function LevelSelect({ progress, onPick, onBack }) {
  // Default tab: highest unlocked theme so returning players land where they left off.
  const initialTheme = (() => {
    for (let t = 6; t >= 1; t--) {
      if (isThemeUnlocked(t, progress)) return t;
    }
    return 1;
  })();
  const [activeTheme, setActiveTheme] = useState(initialTheme);

  const totalEarned = totalStars(progress);
  const totalPossible = LEVELS.length * 3;

  const themeLevels = levelsByTheme(activeTheme);
  const themeUnlocked = isThemeUnlocked(activeTheme, progress);
  const themeStarReq = THEME_UNLOCK_STARS[activeTheme] || 0;

  return (
    <div className="sprinkle-bg full" style={{ padding: 18, position: 'relative', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, maxWidth: 1180, margin: '0 auto 14px' }}>
        <button className="bubble-btn" style={{ padding: '10px 18px' }} onClick={onBack}>← 返回</button>
        <h2 className="font-display" style={{ fontSize: 28 }}>选择关卡</h2>
        <div className="stat-pill"><Star size={18} /> <span>{totalEarned} / {totalPossible}</span></div>
      </div>

      {/* Theme tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, maxWidth: 1180, margin: '0 auto 14px', flexWrap: 'wrap' }}>
        {Object.values(THEMES).map(t => {
          const unlocked = isThemeUnlocked(t.id, progress);
          const active = activeTheme === t.id;
          const themeStars = themeLevels && t.id === activeTheme
            ? themeLevels.reduce((a, _, i) => a + (progress.stars?.[levelIndex(t.id, i + 1)] || 0), 0)
            : levelsByTheme(t.id).reduce((a, _, i) => a + (progress.stars?.[levelIndex(t.id, i + 1)] || 0), 0);
          return (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              disabled={false}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                border: active ? `3px solid ${t.accentDeep}` : '2px solid var(--cream-2)',
                background: active ? `linear-gradient(180deg, ${t.accent} 0%, ${t.accentDeep} 100%)` : 'white',
                color: active ? 'white' : 'var(--ink)',
                fontWeight: 700,
                fontFamily: 'Fredoka, Noto Sans SC, sans-serif',
                cursor: 'pointer',
                fontSize: 14,
                opacity: unlocked ? 1 : 0.65,
                position: 'relative',
                boxShadow: active ? '0 4px 0 ' + t.accentDeep : '0 2px 6px rgba(180,110,80,0.10)',
              }}
            >
              {!unlocked && '🔒 '}{t.name}
              <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.85 }}>
                {themeStars}/{10 * 3}
              </span>
            </button>
          );
        })}
      </div>

      {/* Theme description / lock message */}
      <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 13, color: 'var(--ink-soft)' }}>
        {themeUnlocked
          ? THEMES[activeTheme].description
          : `🔒 累计 ${themeStarReq} ⭐ 解锁本主题（你当前 ${totalEarned} ⭐）`}
      </div>

      {/* Level grid: 5 cols × 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxWidth: 1180, margin: '0 auto' }}>
        {themeLevels.map((lv, i) => {
          const idx = levelIndex(lv.themeId, lv.subLevel);
          const stars = progress.stars?.[idx] || 0;
          const unlocked = themeUnlocked && isLevelUnlocked(idx, progress);
          const isCurrent = unlocked && stars === 0;
          const isFinale = lv.subLevel === 10;
          return (
            <div
              key={lv.id}
              className="cute-card"
              onClick={() => unlocked && onPick(idx)}
              style={{
                padding: 12,
                opacity: unlocked ? 1 : 0.5,
                border: isCurrent ? `3px solid ${lv.accentDeep}` : isFinale && unlocked ? '2px solid #F8E060' : undefined,
                boxShadow: isCurrent ? `0 6px 18px rgba(245,140,166,0.30)` : undefined,
                position: 'relative',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                height: 70,
                background: isFinale
                  ? `linear-gradient(135deg, ${lv.accentDeep} 0%, #F8E060 100%)`
                  : `linear-gradient(135deg, ${lv.accent} 0%, white 100%)`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div className="font-display" style={{ fontSize: 30, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {lv.subLevel}
                </div>
                {!unlocked && (
                  <div style={{ position: 'absolute', fontSize: 22 }}>🔒</div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: 4, right: 4, background: lv.accentDeep, color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>当前</div>
                )}
                {isFinale && unlocked && (
                  <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 14 }}>👑</div>
                )}
                {stars === 3 && (
                  <div style={{ position: 'absolute', top: 4, right: 4, background: '#F8E060', color: '#5A3E36', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>全星</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3].map(s => <Star key={s} size={14} filled={s <= stars} />)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--ink-soft)' }}>
                  {lv.waves.length}波
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
