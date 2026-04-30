import { Bear, Fox, Raccoon } from '../art/animals.jsx';
import Stat from './Stat.jsx';

const TIPS = [
  '冰淇淋塔可以减速刺猬，搭配马卡龙的高伤害射击效率更高！',
  '把高伤害塔放在路径转弯处，敌人停留时间更长。',
  '甜甜圈的环形伤害对付密集小怪非常高效。',
  '蛋糕塔虽然贵，但 BOSS 战必备 — 提前攒糖准备一座。',
  '别忘了升级！3 星塔的伤害是初始的 2.25 倍。',
  '波次结束有 +25 糖奖励，也可以提前开始拿额外 +5。',
];

export default function Defeat({ stats, onRetry, onMenu }) {
  const tip = TIPS[(stats.killed * 7) % TIPS.length];
  const isEndless = stats?.mode === 'endless';
  const isDaily = stats?.mode === 'daily';
  const isMode = isEndless || isDaily;
  return (
    <div className="full" style={{
      background: 'linear-gradient(180deg, #E8DDF0 0%, #F5E8DD 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'absolute', top: '12%', left: '10%' }}><Bear size={110} /></div>
      <div style={{ position: 'absolute', bottom: '14%', right: '12%' }}><Fox size={84} /></div>
      <div style={{ position: 'absolute', bottom: '18%', left: '14%' }}><Raccoon size={78} /></div>

      <div style={{ textAlign: 'center', zIndex: 1, maxWidth: 540 }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{isMode ? '🌟' : '😢'}</div>
        <h1 className="font-display" style={{ fontSize: 64, lineHeight: 1, color: 'var(--ink)', marginBottom: 8 }}>
          {isEndless ? <>无尽 <span style={{ color: 'var(--lavender-deep)' }}>结束</span></> :
           isDaily ? <>今日 <span style={{ color: 'var(--berry)' }}>挑战完结</span></> :
           <>糖果<span style={{ color: 'var(--lavender-deep)' }}>被偷</span>了</>}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.5 }}>
          {isMode ? '挑战已结束，下次再战！' : '别灰心~ 调整策略，再守护一次甜蜜的王国吧！'}
        </p>
        <div className="cute-card" style={{ padding: 14, marginBottom: 18, display: 'inline-flex', gap: 22, flexWrap: 'wrap' }}>
          <Stat label="坚持到" val={`第 ${stats.wave} 波`} icon="⏱" />
          <Stat label="击败敌人" val={stats.killed} icon="🐭" />
          {isMode && <Stat label="得分" val={stats.score || 0} icon="✨" />}
          {isEndless && <Stat label={stats.beat ? '🎉 新记录' : '历史最佳'} val={stats.best || 0} icon="🏆" />}
          {stats.bestCombo > 1 && <Stat label="最高连击" val={`×${stats.bestCombo}`} icon="🔥" />}
        </div>
        <div className="cute-card" style={{ padding: 16, marginBottom: 24, textAlign: 'left', maxWidth: 420, margin: '0 auto 24px' }}>
          <div className="font-display" style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 8, letterSpacing: '0.15em' }}>💡 小提示</div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{tip}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="bubble-btn" style={{ padding: '14px 28px', fontSize: 16 }} onClick={onMenu}>← 关卡</button>
          <button className="bubble-btn primary" style={{ padding: '14px 36px', fontSize: 18 }} onClick={onRetry}>🔁 重新挑战</button>
        </div>
      </div>
    </div>
  );
}
