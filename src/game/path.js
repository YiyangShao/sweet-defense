import { COLS, ROWS } from './constants.js';

// inBounds is path-agnostic, so it stays as a free function.
export function inBounds(gx, gy) {
  return gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS;
}

// Build a path object from a list of grid cells. Each level supplies its own
// pathGrid; the resulting object owns all derived data + helpers, so we never
// reach back into module-level singletons.
export function buildPath(pathGrid, T) {
  const points = pathGrid.map(([gx, gy]) => ({ x: gx * T + T / 2, y: gy * T + T / 2 }));
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const total = cum[cum.length - 1];
  const set = new Set(pathGrid.map(([x, y]) => `${x},${y}`));
  const indexByKey = new Map();
  pathGrid.forEach(([x, y], i) => indexByKey.set(`${x},${y}`, i));

  return {
    grid: pathGrid,
    points,
    cum,
    total,
    set,
    isPathCell(gx, gy) { return set.has(`${gx},${gy}`); },
    pathIndexOf(gx, gy) {
      const i = indexByKey.get(`${gx},${gy}`);
      return i === undefined ? -1 : i;
    },
    distAtCell(gx, gy) {
      const i = indexByKey.get(`${gx},${gy}`);
      return i === undefined ? -1 : cum[i];
    },
    posAt(dist) {
      if (dist <= 0) return { ...points[0] };
      if (dist >= total) return { ...points[points.length - 1] };
      let lo = 0, hi = cum.length - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= dist) lo = mid; else hi = mid;
      }
      const segLen = cum[lo + 1] - cum[lo];
      const t = (dist - cum[lo]) / segLen;
      const a = points[lo], b = points[lo + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    },
  };
}
