import { ENEMY_DEFS } from '../game/constants.js';

export default function WavePreview({ world, onEarlyStart }) {
  const waves = world.level.waves;
  const nextIdx = world.waveState === 'preparing' ? world.waveIdx : world.waveIdx + 1;
  if (nextIdx >= waves.length) return null;

  const wave = waves[nextIdx];
  const counts = {};
  for (const g of wave) counts[g.type] = (counts[g.type] || 0) + g.count;
  const types = Object.keys(counts).slice(0, 4);

  return (
    <div className="cute-card" style={{ position: 'absolute', top: 84, right: 18, padding: 12, minWidth: 210, zIndex: 6 }}>
      <div className="font-display" style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8, letterSpacing: '0.1em' }}>
        下一波 ▸ #{nextIdx + 1}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {types.map(t => {
          const Comp = ENEMY_DEFS[t].Comp;
          return (
            <div key={t} style={{ textAlign: 'center' }}>
              <Comp size={38} />
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: -2 }}>×{counts[t]}</div>
            </div>
          );
        })}
      </div>
      {world.waveState === 'preparing' && (
        <button className="bubble-btn primary prep-pulse" style={{ width: '100%', marginTop: 10, padding: '8px 12px', fontSize: 13 }} onClick={onEarlyStart}>
          ▶ 提前开始 +5
        </button>
      )}
    </div>
  );
}
