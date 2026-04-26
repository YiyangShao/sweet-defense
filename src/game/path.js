import { T, COLS, ROWS, PATH_GRID } from './constants.js';

export const PATH_SET = new Set(PATH_GRID.map(([x, y]) => `${x},${y}`));
export const isPathCell = (gx, gy) => PATH_SET.has(`${gx},${gy}`);

export const PATH = (() => {
  const points = PATH_GRID.map(([gx, gy]) => ({ x: gx * T + T / 2, y: gy * T + T / 2 }));
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return { points, cum, total: cum[cum.length - 1] };
})();

export function posAt(dist) {
  if (dist <= 0) return { ...PATH.points[0] };
  if (dist >= PATH.total) return { ...PATH.points[PATH.points.length - 1] };
  let lo = 0, hi = PATH.cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (PATH.cum[mid] <= dist) lo = mid; else hi = mid;
  }
  const segLen = PATH.cum[lo + 1] - PATH.cum[lo];
  const t = (dist - PATH.cum[lo]) / segLen;
  const a = PATH.points[lo], b = PATH.points[lo + 1];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function inBounds(gx, gy) {
  return gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS;
}
