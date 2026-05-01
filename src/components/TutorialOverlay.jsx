// First-time tutorial shown only on the very first run of L1.
// Persists dismissal in localStorage so returning players don't see it again.

const STEPS = [
  { icon: '🍰', title: '选塔', body: '从底部「甜点商店」点一张卡片，选你想造的塔。糖果不够会变灰。' },
  { icon: '🌱', title: '放置', body: '在草地空格上点一下放置。提示：路径转弯处停留时间长，伤害收益最高。' },
  { icon: '⏱', title: '开始', body: '右上「下一波」卡片点 ▶ 提前开始，奖励 +5 糖。Esc / 右键取消选中。' },
  { icon: '✨', title: '集火与升级', body: '点击敌人/障碍物 = 集火；点击已建塔 = 升级或出售（最多 3 星）。' },
];

export default function TutorialOverlay({ onDismiss }) {
  return (
    <div className="modal-backdrop" style={{ zIndex: 80 }} onClick={onDismiss}>
      <div
        className="cute-card modal-in"
        style={{ width: 'min(540px, 92%)', padding: 24, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="font-display" style={{ fontSize: 12, letterSpacing: '0.3em', color: 'var(--mint-deep)', marginBottom: 4 }}>
          ✦ 新手指引
        </div>
        <h3 className="font-display" style={{ fontSize: 26, marginBottom: 14 }}>
          欢迎来到糖霜花园
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: 'var(--cream)', borderRadius: 14, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="font-display" style={{ fontSize: 14, marginBottom: 2 }}>
                  {i + 1}. {s.title}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', textAlign: 'center', marginBottom: 12, lineHeight: 1.5 }}>
          💡 第一波是糖糖鼠群——血量低数量多，曲奇饼塔放在第一个转弯处足以应对。
        </div>
        <button
          className="bubble-btn primary"
          style={{ width: '100%', padding: '14px', fontSize: 16 }}
          onClick={onDismiss}
        >
          知道了，开始守护！
        </button>
      </div>
    </div>
  );
}
