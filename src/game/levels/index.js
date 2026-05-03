// Compose final LEVELS array from themes + paths + raw campaign entries.
// Each entry is what the engine consumes directly.

import { THEMES } from './themes.js';
import { getPath, DUAL_PATHS_BY_ID } from './paths.js';
import { RAW_CAMPAIGN_BY_THEME } from './campaign.js';
import { levelTowerPool } from './towerPools.js';

function resolveLevel(themeId, subIdx, raw) {
  const theme = THEMES[themeId];
  const subLevel = subIdx + 1;
  // Resolve path(s)
  let pathGrid = null;
  let paths = null;
  if (raw.paths) {
    paths = DUAL_PATHS_BY_ID[raw.paths];
    if (!paths) throw new Error(`Unknown dual paths id: ${raw.paths}`);
    pathGrid = paths[0]; // engine still keeps a "primary" path; rendering uses both
  } else if (raw.path) {
    pathGrid = getPath(raw.path);
  } else {
    throw new Error(`Level ${themeId}-${subLevel} missing path/paths`);
  }
  // Per-level tower pool (introduces towers gradually). Wall is always present.
  const pool = levelTowerPool(themeId, subLevel);
  const availableTowers = [...pool, 'wall'];
  return {
    id: `${themeId}-${subLevel}`,
    themeId,
    subLevel,
    name: `${theme.name} · ${subLevel}`,
    accent: theme.accent,
    accentDeep: theme.accentDeep,
    bgPrimary: theme.bgPrimary,
    bgSecondary: theme.bgSecondary,
    pathStyle: theme.pathStyle,
    pathGrid,
    paths,                       // [grid1, grid2] when multipath, else undefined
    availableTowers,
    decorations: theme.decorations,
    obstacles: raw.obstacles || [],
    startSugar: raw.startSugar ?? 280,
    startHp: raw.startHp ?? 20,
    waves: raw.waves,
    // Mechanic data — engine reads these conditionally.
    mechanic: theme.mechanic,
    conveyor: raw.conveyor,
    frozenCells: raw.frozenCells,
    tidal: raw.tidal,
  };
}

// Flat 60-level array (idx = (themeId-1)*10 + subIdx).
function build() {
  const out = [];
  for (let t = 1; t <= 6; t++) {
    const raw = RAW_CAMPAIGN_BY_THEME[t];
    if (!raw || raw.length !== 10) {
      throw new Error(`Theme ${t} must have 10 levels, got ${raw?.length}`);
    }
    raw.forEach((r, i) => out.push(resolveLevel(t, i, r)));
  }
  return out;
}

export const LEVELS = build();

// Helpers for UI
export function levelsByTheme(themeId) {
  return LEVELS.filter(lv => lv.themeId === themeId);
}

export function levelIndex(themeId, subLevel) {
  return (themeId - 1) * 10 + (subLevel - 1);
}
