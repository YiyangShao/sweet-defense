import { TOWER_DEFS, TOWER_ORDER, WALL_DEFS } from '../game/constants.js';
import { Sugar } from '../art/icons.jsx';

export default function TowerShop({ selected, sugar, onSelect }) {
  const items = [
    ...TOWER_ORDER.map(type => ({ type, kind: 'tower', def: TOWER_DEFS[type] })),
    { type: 'wall', kind: 'wall', def: WALL_DEFS.wall },
  ];
  return (
    <div className="cute-card" style={{ position: 'absolute', left: 16, right: 16, bottom: 14, padding: 12, display: 'flex', gap: 10, alignItems: 'center', zIndex: 6 }}>
      <div className="font-display" style={{ writingMode: 'vertical-rl', fontSize: 13, color: 'var(--ink-soft)', padding: '4px 6px', letterSpacing: '0.2em' }}>甜点商店</div>
      <div style={{ display: 'flex', gap: 7, flex: 1 }}>
        {items.map(it => {
          const def = it.def;
          const Comp = def.Comp;
          const canAfford = sugar >= def.cost;
          const isSelected = selected === it.type;
          const accent = it.kind === 'wall' ? 'var(--peach-deep)' : 'var(--pink-deep)';
          const accentBg = it.kind === 'wall' ? 'linear-gradient(180deg, #FFEAD0, #FBDDB7)' : 'linear-gradient(180deg, #FFE5EC, #FFD9E0)';
          return (
            <div
              key={it.type}
              className={`shop-card ${!canAfford ? 'disabled' : ''}`}
              onClick={() => canAfford && onSelect(it.type)}
              style={{
                flex: 1, minWidth: 0,
                background: isSelected ? accentBg : 'var(--cream)',
                border: isSelected ? `2px solid ${accent}` : '2px solid var(--cream-2)',
                borderRadius: 14, padding: 8, textAlign: 'center',
                cursor: canAfford ? 'pointer' : 'not-allowed', position: 'relative'
              }}
            >
              <div style={{ height: 54, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Comp size={50} />
              </div>
              <div className="font-display" style={{ fontSize: 13, marginTop: 2 }}>{def.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 3, height: 14, overflow: 'hidden' }}>{def.desc}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: canAfford ? 'var(--ink)' : '#C0928A' }}>
                <Sugar size={13} /> {def.cost}
              </div>
              {isSelected && (
                <div style={{ position: 'absolute', top: -7, right: -7, background: accent, color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>已选</div>
              )}
              {it.kind === 'wall' && (
                <div style={{ position: 'absolute', top: -7, left: -7, background: 'var(--peach-deep)', color: 'white', borderRadius: 999, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>路上</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
