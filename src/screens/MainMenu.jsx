import { Cupcake, Macaron, Donut, IceCream } from '../art/desserts.jsx';
import { Mouse, Rabbit, Fox } from '../art/animals.jsx';

export default function MainMenu({ onStart, onBestiary, onEndless, onDaily, onAchievements, dailyStreak }) {
  const streakCount = dailyStreak?.count || 0;
  // "Active" streak = last completion was today or yesterday (not stale from weeks ago).
  const today = new Date();
  const todayK = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const yK = (() => { const y = new Date(today.getTime() - 86400000); return `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`; })();
  const streakActive = dailyStreak?.lastDate === todayK || dailyStreak?.lastDate === yK;
  const streakDoneToday = dailyStreak?.lastDate === todayK;
  return (
    <div className="sprinkle-bg full" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '8%', left: '8%' }} className="floaty"><Cupcake size={110} /></div>
      <div style={{ position: 'absolute', top: '16%', right: '10%', animationDelay: '1s' }} className="floaty"><Macaron size={100} /></div>
      <div style={{ position: 'absolute', bottom: '12%', left: '14%' }} className="floaty"><Donut size={120} /></div>
      <div style={{ position: 'absolute', bottom: '18%', right: '8%' }} className="floaty"><IceCream size={110} /></div>
      <div style={{ position: 'absolute', bottom: '8%', left: '6%' }} className="wobble"><Mouse size={80} /></div>
      <div style={{ position: 'absolute', top: '10%', right: '30%' }} className="wobble"><Rabbit size={72} /></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '24%' }} className="wobble"><Fox size={84} /></div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="font-display" style={{ fontSize: 14, letterSpacing: '0.4em', color: 'var(--ink-soft)', marginBottom: 8 }}>SWEET DEFENSE</div>
        <h1 className="font-display" style={{ fontSize: 96, lineHeight: 1, color: 'var(--ink)', marginBottom: 6, fontWeight: 700 }}>
          甜<span style={{ color: 'var(--pink-deep)' }}>点</span>防<span style={{ color: 'var(--mint-deep)' }}>御</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', marginBottom: 36, maxWidth: 420 }}>
          用蛋糕守护你的糖果王国，不让小动物们偷走甜蜜！
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button className="bubble-btn primary" style={{ fontSize: 24, padding: '20px 70px', minWidth: 260 }} onClick={onStart}>
            🎮 开始游戏
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="bubble-btn mint"
              style={{ fontSize: 15, padding: '12px 22px' }}
              title="挑战无尽模式"
              onClick={onEndless}
            >
              ♾ 无尽模式
            </button>
            <button
              className="bubble-btn"
              style={{ fontSize: 15, padding: '12px 22px', position: 'relative' }}
              onClick={onDaily}
              title={streakDoneToday ? '今日已挑战，可再战追分' : '完成每日挑战累计连续天数'}
            >
              📆 每日挑战
              {streakActive && streakCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -10,
                  background: streakDoneToday ? 'var(--peach-deep)' : 'var(--pink-deep)',
                  color: 'white',
                  fontSize: 11, fontWeight: 800,
                  padding: '2px 8px', borderRadius: 999,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  🔥 {streakCount}
                </span>
              )}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bubble-btn" style={{ fontSize: 14, padding: '10px 18px' }} onClick={onBestiary}>
              📖 动物图鉴
            </button>
            <button className="bubble-btn" style={{ fontSize: 14, padding: '10px 18px' }} onClick={onAchievements}>
              ✦ 成就
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6, maxWidth: 420, lineHeight: 1.6 }}>
            底部商店选塔 → 点击草地放置 → 右键/Esc 取消 → 点击敌人/石头集火 → 点击塔可升级
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 18, fontSize: 12, color: 'var(--ink-faint)' }}>v1.1 · Vite 版 · 糖果工坊</div>
    </div>
  );
}
