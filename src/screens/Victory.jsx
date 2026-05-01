import { Heart, Sugar, Star } from '../art/icons.jsx';
import { Cake, Donut, Macaron } from '../art/desserts.jsx';
import Stat from './Stat.jsx';

export default function Victory({ stats, hasNext, onRetry, onNext, onMenu }) {
  const stars = stats.stars || 3;
  return (
    <div className="full" style={{
      background: 'linear-gradient(180deg, #FFE5EC 0%, #FFF4E6 50%, #C4E4D4 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {Array.from({ length: 50 }, (_, i) => {
        const colors = ['var(--pink)', 'var(--butter)', 'var(--mint)', 'var(--lavender)', 'var(--peach)'];
        const x = (i * 137) % 100, y = (i * 41) % 90;
        return <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 12, height: 6, background: colors[i % 5], borderRadius: 2, transform: `rotate(${(i * 37) % 90 - 45}deg)` }} />;
      })}
      <div style={{ position: 'absolute', top: '10%', left: '10%' }} className="floaty"><Cake size={100} /></div>
      <div style={{ position: 'absolute', top: '14%', right: '12%' }} className="floaty"><Donut size={90} /></div>
      <div style={{ position: 'absolute', bottom: '14%', left: '12%' }} className="floaty"><Macaron size={90} /></div>

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div className="font-display wobble" style={{ fontSize: 18, letterSpacing: '0.3em', color: 'var(--mint-deep)', marginBottom: 8 }}>✦ VICTORY ✦</div>
        <h1 className="font-display" style={{ fontSize: 88, lineHeight: 1, color: 'var(--ink)', marginBottom: 8 }}>
          甜蜜<span style={{ color: 'var(--pink-deep)' }}>胜利</span>!
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', marginBottom: 24 }}>糖果王国的甜蜜被你守护啦~</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
          <div className="floaty"><Star size={56} filled={stars >= 1} /></div>
          <div className="floaty" style={{ animationDelay: '0.2s' }}><Star size={70} filled={stars >= 2} /></div>
          <div className="floaty"><Star size={56} filled={stars >= 3} /></div>
        </div>
        <div className="cute-card" style={{ padding: '18px 32px', display: 'inline-flex', gap: 32, marginBottom: 28 }}>
          <Stat label="剩余生命" val={stats.hp} icon={<Heart size={20} />} />
          <Stat label="击败敌人" val={stats.killed} icon="🐭" />
          <Stat label="获得糖果" val={`+${stats.earned}`} icon={<Sugar size={20} />} />
        </div>
        {stats.masteryUnlocked && (
          <div className="cute-card" style={{
            padding: '14px 22px', marginBottom: 18, display: 'inline-block',
            background: 'linear-gradient(135deg, #FFE5B4 0%, #F8E060 100%)',
            border: '2px solid var(--peach-deep)',
          }}>
            <div className="font-display" style={{ fontSize: 12, color: 'var(--ink-soft)', letterSpacing: '0.18em' }}>
              ✦ 主题精通解锁
            </div>
            <div className="font-display" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 2 }}>
              👑 {stats.themeName || '本主题'} · 金边皮肤
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
              再回这个主题任意一关，所有塔将披上金光
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="bubble-btn" style={{ padding: '14px 24px', fontSize: 15 }} onClick={onMenu}>← 关卡</button>
          <button className="bubble-btn" style={{ padding: '14px 24px', fontSize: 15 }} onClick={onRetry}>🔁 重玩</button>
          {hasNext && (
            <button className="bubble-btn primary" style={{ padding: '14px 36px', fontSize: 18 }} onClick={onNext}>下一关 →</button>
          )}
        </div>
      </div>
    </div>
  );
}
