import { Bear, Fox, Raccoon } from '../art/animals.jsx';
import Stat from './Stat.jsx';

const FALLBACK_TIPS = [
  '冰淇淋塔可以减速刺猬，搭配马卡龙的高伤害射击效率更高！',
  '把高伤害塔放在路径转弯处，敌人停留时间更长。',
  '甜甜圈的环形伤害对付密集小怪非常高效。',
  '蛋糕塔虽然贵，但 BOSS 战必备 — 提前攒糖准备一座。',
  '别忘了升级！3 星塔的伤害是初始的 2.25 倍。',
  '波次结束有 +25 糖奖励，也可以提前开始拿额外 +5。',
];

// Targeted tip per "main offender"—the enemy type that dealt the most castle damage.
const TIPS_BY_TYPE = {
  mouse:    '糖糖鼠虽弱但量大，曲奇饼+杯子蛋糕的密集火力 + 升级到 2 星就能压住。',
  rabbit:   '兔子速度很快，棒棒糖眩晕或冰淇淋减速能拖住它们让其他塔输出。',
  hedgehog: '刺刺球装甲很厚，需要马卡龙或蛋糕的高伤塔，普通塔难破防。',
  squirrel: '抢糖松鼠会偷糖，优先击杀；糖墙拦在前段也能让它进不到家门口。',
  raccoon:  '隐身浣熊很难被针对集火，但范围伤害（甜甜圈/蛋糕）依然奏效。',
  pigeon:   '飞行单位无视糖墙，需要远射程塔（马卡龙）覆盖全程路径。',
  fox:      '狡狐有 22% 闪避，多放几座塔提高总体期望伤害比堆单塔更稳。',
  bear:     'BOSS 蜜熊王伤害极高 — 第六/七波前请务必预留糖买蛋糕塔。',
  healer:   '糖兔治愈会回血，看到就要优先点击集火，否则其它怪一直满血。',
  shielded: '糖龟甲会吸收首伤，先用便宜塔（曲奇/杯子蛋糕）破盾再打主力。',
  splitter: '糖球虫死后分裂为二，避免在路径密集段处死它，否则分裂体直接到家。',
  splitter_mini: '糖小球速度比母体更快，留心末段的防御漏洞。',
};

function pickTip(stats) {
  const dmg = stats?.damageByType;
  if (dmg && Object.keys(dmg).length) {
    let primary = null, max = 0;
    for (const [k, v] of Object.entries(dmg)) {
      if (v > max) { max = v; primary = k; }
    }
    if (primary && TIPS_BY_TYPE[primary]) return TIPS_BY_TYPE[primary];
  }
  return FALLBACK_TIPS[((stats?.killed || 0) * 7) % FALLBACK_TIPS.length];
}

export default function Defeat({ stats, onRetry, onMenu }) {
  const tip = pickTip(stats);
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
        <div style={{ fontSize: 72, marginBottom: 8 }}>{stats?.dailyCompleted ? '🎉' : isMode ? '🌟' : '😢'}</div>
        <h1 className="font-display" style={{ fontSize: 64, lineHeight: 1, color: 'var(--ink)', marginBottom: 8 }}>
          {isEndless ? <>无尽 <span style={{ color: 'var(--lavender-deep)' }}>结束</span></> :
           stats?.dailyCompleted ? <>今日 <span style={{ color: 'var(--berry)' }}>挑战达成</span></> :
           isDaily ? <>今日 <span style={{ color: 'var(--berry)' }}>挑战完结</span></> :
           <>糖果<span style={{ color: 'var(--lavender-deep)' }}>被偷</span>了</>}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.5 }}>
          {stats?.dailyCompleted ? `🔥 连续打卡 ${stats.streak || 1} 天，明天继续！` :
           isMode ? '挑战已结束，下次再战！' :
           '别灰心~ 调整策略，再守护一次甜蜜的王国吧！'}
        </p>
        <div className="cute-card" style={{ padding: 14, marginBottom: 18, display: 'inline-flex', gap: 22, flexWrap: 'wrap' }}>
          <Stat label="坚持到" val={`第 ${stats.wave} 波`} icon="⏱" />
          <Stat label="击败敌人" val={stats.killed} icon="🐭" />
          {isMode && <Stat label="得分" val={stats.score || 0} icon="✨" />}
          {isEndless && <Stat label={stats.beat ? '🎉 新记录' : '历史最佳'} val={stats.best || 0} icon="🏆" />}
          {isDaily && stats.dailyCompleted && stats.streak && <Stat label="连续打卡" val={`${stats.streak} 天`} icon="🔥" />}
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
