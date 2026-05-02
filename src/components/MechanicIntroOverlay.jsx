// One-time per-theme mechanic primer. Shown the first time a player enters
// any level of a theme that has a unique mechanic (T2-T6). Dismissed with a
// single click; remembers per-theme via localStorage.

const MECHANICS = {
  2: {
    icon: '🍪',
    title: '饼干森林 · 双入口',
    color: 'var(--peach-deep)',
    bg: 'linear-gradient(135deg, #FFEAD0 0%, #FBDDB7 100%)',
    points: [
      '本主题每关有 **两条进攻路线**，敌人会从两个入口同时涌来。',
      '记得在两条路上都布置火力，糖墙也可以堵住其中一路。',
      '集火和升级仍然是赢的关键 —— 别只盯着一边。',
    ],
  },
  3: {
    icon: '🍮',
    title: '果冻沼泽 · 潮汐',
    color: 'var(--mint-deep)',
    bg: 'linear-gradient(135deg, #B0DFC8 0%, #C0E5D2 100%)',
    points: [
      '果冻沼泽里**会周期性涌来一波小怪**作为偷袭。',
      '看到入口处出现"潮汐!"提示就是潮汐到来。',
      '前段路线留几座 AOE / 减速塔，可以从容应对。',
    ],
  },
  4: {
    icon: '☁️',
    title: '棉花糖云海 · 飞行',
    color: 'var(--lavender-deep)',
    bg: 'linear-gradient(135deg, #D4C5E0 0%, #DECEE8 100%)',
    points: [
      '云海里**飞行单位（云端鸽）**占主导，糖墙拦不住它们。',
      '需要 **远射程塔**（马卡龙、巧克力喷泉）覆盖整条路径。',
      '不要把火力堆在一个角落，飞行怪会快速越过。',
    ],
  },
  5: {
    icon: '🍫',
    title: '巧克力工厂 · 传送带',
    color: 'var(--choco)',
    bg: 'linear-gradient(135deg, #C8A684 0%, #D4B896 100%)',
    points: [
      '路径上有**金色虚线条纹的"传送带"段**，敌人在那里会加速。',
      '在传送带 **前后** 布置塔，避开加速段中央的"鬼影"。',
      '蛋糕、甜甜圈这类 AOE 在传送带末端最好用 —— 怪刚减速堆叠。',
    ],
  },
  6: {
    icon: '❄',
    title: '冰淇淋雪山 · 冰冻地形',
    color: '#5A8FB8',
    bg: 'linear-gradient(135deg, #D8E8E8 0%, #E5F0F0 100%)',
    points: [
      '草地上的**蓝色 ❄ 格子是冰冻地形**，塔放上去射速 -29% 但射程 +15%。',
      '把 **马卡龙、蛋糕** 这类长射程塔放在冰冻格 = 远距狙击位。',
      '把 **杯子蛋糕、巧克力喷泉** 放在普通草地 = 高速 DPS 位。',
    ],
  },
};

function mechanicKey(themeId) { return `sd-mechanic-intro-${themeId}-v1`; }

export function shouldShowMechanicIntro(themeId) {
  if (!MECHANICS[themeId]) return false;
  try { return localStorage.getItem(mechanicKey(themeId)) !== '1'; } catch { return false; }
}

export function markMechanicIntroSeen(themeId) {
  try { localStorage.setItem(mechanicKey(themeId), '1'); } catch {}
}

export default function MechanicIntroOverlay({ themeId, onDismiss }) {
  const m = MECHANICS[themeId];
  if (!m) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 80 }} onClick={onDismiss}>
      <div
        className="cute-card modal-in"
        style={{ width: 'min(520px, 92%)', padding: 24, position: 'relative', background: m.bg, border: `2px solid ${m.color}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="font-display" style={{ fontSize: 12, letterSpacing: '0.3em', color: m.color, marginBottom: 4 }}>
          ✦ 新主题机制
        </div>
        <h3 className="font-display" style={{ fontSize: 26, marginBottom: 14, color: 'var(--ink)' }}>
          <span style={{ fontSize: 30, marginRight: 8 }}>{m.icon}</span>{m.title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {m.points.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: m.color, minWidth: 18 }}>{i + 1}.</div>
              <div
                style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, flex: 1 }}
                dangerouslySetInnerHTML={{
                  __html: p.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${m.color}">$1</strong>`),
                }}
              />
            </div>
          ))}
        </div>
        <button
          className="bubble-btn primary"
          style={{ width: '100%', padding: '14px', fontSize: 15 }}
          onClick={onDismiss}
        >
          明白了，开战！
        </button>
      </div>
    </div>
  );
}
