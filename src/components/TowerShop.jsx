import { TOWER_DEFS, TOWER_ORDER } from '../game/constants.js';
import { Sugar } from '../art/icons.jsx';

export default function TowerShop({ selected, sugar, onSelect }) {
  return (
    <div className="cute-card" style={{ position: 'absolute', left: 16, right: 16, bottom: 14, padding: 12, display: 'flex', gap: 10, alignItems: 'center', zIndex: 6 }}>
      <div className="font-display" style={{ writingMode: 'vertical-rl', fontSize: 13, color: 'var(--ink-soft)', padding: '4px 6px', letterSpacing: '0.2em' }}>甜点商店</div>
      <div style={{ display: 'flex', gap: 8, flex: 1 }}>
        {TOWER_ORDER.map(type => {
          const def = TOWER_DEFS[type];
          const Comp = def.Comp;
          const canAfford = sugar >= def.cost;
          const isSelected = selected === type;
          return (
            <div
              key={type}
              className={`shop-card ${!canAfford ? 'disabled' : ''}`}
              onClick={() => canAfford && onSelect(type)}
              style={{
                flex: 1,
                background: isSelected ? 'linear-gradient(180deg, #FFE5EC, #FFD9E0)' : 'var(--cream)',
                border: isSelected ? '2px solid var(--pink-deep)' : '2px solid var(--cream-2)',
                borderRadius: 14, padding: 8, textAlign: 'center',
                cursor: canAfford ? 'pointer' : 'not-allowed', position: 'relative'
              }}
            >
              <div style={{ height: 54, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Comp size={50} />
              </div>
              <div className="font-display" style={{ fontSize: 13, marginTop: 2 }}>{def.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 3, height: 14 }}>{def.desc}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: canAfford ? 'var(--ink)' : '#C0928A' }}>
                <Sugar size={13} /> {def.cost}
              </div>
              {isSelected && (
                <div style={{ position: 'absolute', top: -7, right: -7, background: 'var(--pink-deep)', color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>已选</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
