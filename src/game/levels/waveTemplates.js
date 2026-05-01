// Wave-pattern templates parameterised by count/scale. Most levels can be
// expressed as a sequence of named templates rather than hand-rolled JSON.
//
// Each template returns a list of "groups" (the existing wave format):
//   { type, count, interval, delay? }

const round = Math.round;

// Helper: scale counts by `scale` keeping minimum of 1.
function n(base, scale) { return Math.max(1, round(base * scale)); }

// === Single-flavor templates ===
export function rush(type, scale = 1) {
  // Pure rush — one enemy type, fast spawn
  return [{ type, count: n(8, scale), interval: 0.55 }];
}

export function rushHeavy(type, scale = 1) {
  return [{ type, count: n(12, scale), interval: 0.40 }];
}

// === Mixed templates ===
export function mixed2(t1, t2, scale = 1) {
  return [
    { type: t1, count: n(6, scale), interval: 0.55 },
    { type: t2, count: n(4, scale), interval: 0.95, delay: 4 },
  ];
}

export function mixed3(t1, t2, t3, scale = 1) {
  return [
    { type: t1, count: n(7, scale), interval: 0.5 },
    { type: t2, count: n(4, scale), interval: 1.0, delay: 4 },
    { type: t3, count: n(3, scale), interval: 1.4, delay: 9 },
  ];
}

export function mixed4(t1, t2, t3, t4, scale = 1) {
  return [
    { type: t1, count: n(8, scale), interval: 0.45 },
    { type: t2, count: n(5, scale), interval: 0.9,  delay: 4 },
    { type: t3, count: n(4, scale), interval: 1.2,  delay: 8 },
    { type: t4, count: n(3, scale), interval: 1.5,  delay: 12 },
  ];
}

// === Boss-pattern templates ===
// Single boss with escort
export function bossWave(escortType, escortCount, bossCount = 1, scale = 1) {
  return [
    { type: escortType, count: n(escortCount, scale), interval: 0.6 },
    { type: 'bear', count: bossCount, interval: 6, delay: 12 },
  ];
}

// Double boss + heavy escort (used in theme finales)
export function bossFinaleWave(escortTypes, scale = 1) {
  const out = [];
  let delay = 0;
  for (const [type, cnt] of escortTypes) {
    out.push({ type, count: n(cnt, scale), interval: 0.5, delay });
    delay += 4;
  }
  out.push({ type: 'bear', count: 2, interval: 6, delay: delay + 6 });
  return out;
}

// === Special templates ===
// Flying-only (T4 theme niche)
export function skyRush(scale = 1) {
  return [
    { type: 'pigeon', count: n(10, scale), interval: 0.45 },
    { type: 'pigeon', count: n(6, scale),  interval: 0.6, delay: 6 },
  ];
}

// Armoured push (hedgehog + shielded)
export function armoredPush(scale = 1) {
  return [
    { type: 'hedgehog', count: n(5, scale), interval: 1.4 },
    { type: 'shielded', count: n(4, scale), interval: 1.8, delay: 4 },
  ];
}

// Splitter chaos (last-3 of T3)
export function splitterChaos(scale = 1) {
  return [
    { type: 'mouse', count: n(6, scale), interval: 0.45 },
    { type: 'splitter', count: n(3, scale), interval: 2.5, delay: 4 },
    { type: 'splitter', count: n(3, scale), interval: 2.5, delay: 12 },
  ];
}

// Healer protection (T6 setpiece)
export function healerEscort(scale = 1) {
  return [
    { type: 'fox', count: n(6, scale), interval: 0.7 },
    { type: 'healer', count: n(2, scale), interval: 3, delay: 4 },
    { type: 'hedgehog', count: n(3, scale), interval: 1.6, delay: 9 },
  ];
}

// Build the full wave list for a campaign level by listing template calls.
// Convenience: takes [templateFn, ...args] tuples.
export function buildWaves(specs) {
  return specs.map(spec => {
    if (typeof spec === 'function') return spec();
    if (Array.isArray(spec)) {
      const [fn, ...args] = spec;
      return fn(...args);
    }
    return spec; // raw wave passes through
  });
}
