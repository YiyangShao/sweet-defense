export default function Stat({ label, val, icon }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4, letterSpacing: '0.1em' }}>{label}</div>
      <div className="font-display" style={{ fontSize: 26, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        {icon}{val}
      </div>
    </div>
  );
}
