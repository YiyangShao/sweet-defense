// Path library. Each path is an ordered list of [gx, gy] grid cells from the
// left-edge entry to the right-edge castle. The board is 16 cols × 9 rows.
//
// We hand-author ~14 base shapes and provide mirror helpers, giving us enough
// path variety for 60 levels without authoring 60 unique grids.

// === Base paths (campaign-grade, hand-tuned) ===

// Original 6 from L1-L6
export const PATH_GENTLE_S = [
  [0,1],[1,1],[2,1],[3,1],[3,2],[3,3],[3,4],
  [4,4],[5,4],[6,4],[6,3],[6,2],[7,2],[8,2],
  [9,2],[9,3],[9,4],[9,5],[9,6],[10,6],[11,6],
  [12,6],[12,5],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_WINDING = [
  [0,2],[1,2],[2,2],[3,2],[4,2],[4,3],[4,4],
  [5,4],[6,4],[7,4],[7,5],[7,6],[8,6],[9,6],[10,6],
  [10,5],[10,4],[10,3],[10,2],[11,2],[12,2],[13,2],
  [13,3],[13,4],[14,4],[15,4],
];

export const PATH_ZIGZAG = [
  [0,1],[1,1],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],
  [3,6],[4,6],[5,6],[5,5],[5,4],[5,3],[5,2],[5,1],
  [6,1],[7,1],[8,1],[8,2],[8,3],[8,4],[8,5],[8,6],
  [9,6],[10,6],[11,6],[11,5],[11,4],
  [12,4],[13,4],[14,4],[15,4],
];

export const PATH_MEANDER = [
  [0,3],[1,3],[2,3],[2,2],[2,1],[3,1],[4,1],[5,1],
  [6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[9,4],
  [9,5],[9,6],[10,6],[11,6],[12,6],
  [12,5],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_RIGHTANGLE = [
  [0,1],[1,1],[2,1],[3,1],[4,1],[4,2],[4,3],[4,4],
  [5,4],[6,4],[7,4],[8,4],[8,5],[8,6],[8,7],
  [9,7],[10,7],[11,7],[12,7],[12,6],[12,5],[12,4],
  [13,4],[14,4],[15,4],
];

export const PATH_DESCEND = [
  [0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],
  [4,3],[5,3],[6,3],[6,4],[6,5],[6,6],[6,7],
  [7,7],[8,7],[9,7],[9,6],[9,5],[9,4],[9,3],
  [9,2],[9,1],[10,1],[11,1],[12,1],[12,2],[12,3],
  [12,4],[13,4],[14,4],[15,4],
];

// New shapes for variety
export const PATH_STRAIGHT = [
  [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
  [8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_DOUBLE_HUMP = [
  [0,4],[1,4],[1,3],[1,2],[2,2],[3,2],[3,3],[3,4],
  [4,4],[5,4],[5,5],[5,6],[6,6],[7,6],[7,5],[7,4],
  [8,4],[9,4],[9,3],[9,2],[10,2],[11,2],[11,3],[11,4],
  [12,4],[13,4],[14,4],[15,4],
];

export const PATH_SPIRAL = [
  [0,4],[1,4],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],
  [6,2],[7,2],[7,3],[7,4],[7,5],[7,6],[6,6],[5,6],
  [4,6],[4,5],[4,4],[5,4],[6,4],[8,4],[9,4],[10,4],
  [11,4],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_ZED = [
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
  [7,2],[7,3],[7,4],[7,5],
  [6,5],[5,5],[4,5],[3,5],[2,5],[1,5],
  [1,6],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],
  [8,7],[9,7],[10,7],[10,6],[10,5],[10,4],
  [11,4],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_LOWHIGH = [
  [0,7],[1,7],[2,7],[3,7],[4,7],[4,6],[4,5],[4,4],
  [4,3],[4,2],[4,1],[5,1],[6,1],[7,1],[8,1],
  [8,2],[8,3],[8,4],[9,4],[10,4],[11,4],[12,4],
  [12,5],[12,6],[13,6],[14,6],[15,6],
];

export const PATH_NORTH_DROP = [
  [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
  [7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
  [8,7],[9,7],[10,7],[11,7],[11,6],[11,5],[11,4],
  [12,4],[13,4],[14,4],[15,4],
];

export const PATH_TWISTY = [
  [0,2],[1,2],[1,3],[1,4],[2,4],[3,4],[3,3],[3,2],
  [4,2],[5,2],[5,3],[5,4],[5,5],[5,6],[6,6],[7,6],
  [7,5],[7,4],[7,3],[8,3],[9,3],[9,4],[9,5],[9,6],
  [10,6],[11,6],[11,5],[11,4],[12,4],[13,4],[14,4],[15,4],
];

export const PATH_LONG_S = [
  [0,1],[1,1],[2,1],[3,1],[3,2],[3,3],[3,4],[3,5],
  [4,5],[5,5],[6,5],[7,5],[7,4],[7,3],[7,2],[7,1],
  [8,1],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6],[9,7],
  [10,7],[11,7],[12,7],[12,6],[12,5],[12,4],
  [13,4],[14,4],[15,4],
];

// === Endless path (kept compatible with prior seed) ===
export const PATH_ENDLESS = [
  [0,2],[1,2],[2,2],[2,1],[3,1],[4,1],[5,1],
  [5,2],[5,3],[5,4],[6,4],[7,4],[7,5],[7,6],
  [8,6],[9,6],[9,5],[9,4],[9,3],[9,2],[9,1],
  [10,1],[11,1],[11,2],[11,3],[11,4],[11,5],
  [11,6],[11,7],[12,7],[13,7],[13,6],[13,5],
  [13,4],[14,4],[15,4],
];

// === Multi-path: T2 dual-entry. Two paths converge at a join point. ===
// First entry from top-left, second from bottom-left.
export const PATH_DUAL_TOP = [
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[5,2],[5,3],[5,4],
  [6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
];
export const PATH_DUAL_BOTTOM = [
  [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[5,6],[5,5],[5,4],
  [6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
];

// Alt dual layout used in later T2 levels
export const PATH_DUAL_TOP_B = [
  [0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[4,4],[5,4],
  [6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
];
export const PATH_DUAL_BOTTOM_B = [
  [0,6],[1,6],[2,6],[3,6],[3,5],[3,4],[4,4],[5,4],
  [6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],
];

// === Mirror helpers (16x9 grid → mirror x = 15-x) ===
export function mirrorX(grid) {
  return grid.map(([x, y]) => [15 - x, y]);
}
// Vertical mirror within 9-row grid
export function mirrorY(grid) {
  return grid.map(([x, y]) => [x, 8 - y]);
}

// Reverse path (start ↔ end). After mirrorX a path runs right-to-left, so
// reverse() restores the L-to-R traversal order required by the engine.
export function reverseDir(grid) {
  return grid.slice().reverse();
}

// Convenience: mirror across X and reverse to keep L→R direction.
export function flipX(grid) { return reverseDir(mirrorX(grid)); }
// Vertical mirror does not change traversal direction, no reverse needed.
export function flipY(grid) { return mirrorY(grid); }
// Both flips
export function flipXY(grid) { return reverseDir(mirrorX(mirrorY(grid))); }

// === Named path lookup ===
// Used by campaign entries to refer to paths by string id.
export const PATHS_BY_ID = {
  'gentle-s':       PATH_GENTLE_S,
  'gentle-s-flip':  flipX(PATH_GENTLE_S),
  'gentle-s-vert':  flipY(PATH_GENTLE_S),
  'winding':        PATH_WINDING,
  'winding-flip':   flipX(PATH_WINDING),
  'zigzag':         PATH_ZIGZAG,
  'zigzag-flip':    flipX(PATH_ZIGZAG),
  'meander':        PATH_MEANDER,
  'meander-flip':   flipX(PATH_MEANDER),
  'rightangle':     PATH_RIGHTANGLE,
  'rightangle-flip':flipX(PATH_RIGHTANGLE),
  'descend':        PATH_DESCEND,
  'descend-flip':   flipX(PATH_DESCEND),
  'straight':       PATH_STRAIGHT,
  'double-hump':    PATH_DOUBLE_HUMP,
  'double-hump-flip': flipX(PATH_DOUBLE_HUMP),
  'spiral':         PATH_SPIRAL,
  'spiral-flip':    flipX(PATH_SPIRAL),
  'zed':            PATH_ZED,
  'zed-flip':       flipX(PATH_ZED),
  'lowhigh':        PATH_LOWHIGH,
  'lowhigh-flip':   flipX(PATH_LOWHIGH),
  'north-drop':     PATH_NORTH_DROP,
  'twisty':         PATH_TWISTY,
  'twisty-flip':    flipX(PATH_TWISTY),
  'long-s':         PATH_LONG_S,
  'endless':        PATH_ENDLESS,
};

export function getPath(id) {
  const p = PATHS_BY_ID[id];
  if (!p) throw new Error(`Unknown path id: ${id}`);
  return p;
}

// Multi-path bundles for T2 (饼干森林 dual-entry levels).
export const DUAL_PATHS_BY_ID = {
  'dual-A': [PATH_DUAL_TOP, PATH_DUAL_BOTTOM],
  'dual-B': [PATH_DUAL_TOP_B, PATH_DUAL_BOTTOM_B],
};
