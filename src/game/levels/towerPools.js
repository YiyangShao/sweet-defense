// Per-level tower pools — controls *which* towers a player can place in a
// given level. The first 11 levels introduce one new tower each, so a fresh
// player meets the cast gradually. After that the pool varies per (theme,
// sub-level) so no two levels feel identical.

const ALL_TOWERS = [
  'cookie', 'cupcake', 'lollipop', 'donut', 'macaron',
  'lemon', 'strawberry', 'icecream', 'choco', 'cake', 'banana',
];

// T1 introduces 10 towers across its 10 sub-levels (cookie → cake).
// Each level adds exactly one new tower vs. the previous level.
const T1_PROGRESSION = [
  ['cookie'],                                                                                  // 1-1: cookie
  ['cookie', 'cupcake'],                                                                       // 1-2: + cupcake
  ['cookie', 'cupcake', 'lollipop'],                                                           // 1-3: + lollipop
  ['cookie', 'cupcake', 'lollipop', 'donut'],                                                  // 1-4: + donut
  ['cookie', 'cupcake', 'lollipop', 'donut', 'macaron'],                                       // 1-5: + macaron
  ['cookie', 'cupcake', 'lollipop', 'donut', 'macaron', 'lemon'],                              // 1-6: + lemon
  ['cookie', 'cupcake', 'lollipop', 'donut', 'macaron', 'lemon', 'strawberry'],                // 1-7: + strawberry
  ['cookie', 'cupcake', 'donut', 'macaron', 'lemon', 'strawberry', 'icecream'],                // 1-8: + icecream
  ['cookie', 'cupcake', 'lollipop', 'macaron', 'lemon', 'strawberry', 'icecream', 'choco'],    // 1-9: + choco
  ['cookie', 'cupcake', 'donut', 'macaron', 'icecream', 'choco', 'cake'],                      // 1-10 boss: + cake
];

// T2 introduces banana on its first level; after that pool varies.
const T2_FIRST = ['cookie', 'cupcake', 'donut', 'lollipop', 'choco', 'banana'];

// Per-theme tower preferences (the 4 most thematic towers). Each level picks
// these 4 + 2-3 rotating extras so no two levels look the same.
const THEME_FAVORITES = {
  2: ['choco', 'banana', 'donut', 'lollipop'],          // dual-entry: chain + melee
  3: ['icecream', 'lemon', 'strawberry', 'donut'],      // tidal: AOE + slow
  4: ['macaron', 'choco', 'strawberry', 'lemon'],       // flying: long range + chain
  5: ['banana', 'icecream', 'cake', 'choco'],           // conveyor: melee + freeze + boss
  6: ['macaron', 'cake', 'choco', 'donut'],             // frozen tiles: range + AOE
};

function rotateExtras(themeId, subLevel) {
  // Pseudo-random: each (theme, sub) yields a different set of extras so the
  // 49 non-T1 levels feel varied. Always picks from the 11-tower full set
  // minus the theme favorites.
  const favs = THEME_FAVORITES[themeId] || [];
  const pool = ALL_TOWERS.filter(t => !favs.includes(t));
  const seed = themeId * 73 + subLevel * 17 + 1;
  const out = [];
  // Pick 2-3 extras based on seed parity
  const count = 2 + (subLevel % 2);                     // 2 or 3 extras
  for (let i = 0; i < count; i++) {
    out.push(pool[(seed * (i + 1)) % pool.length]);
  }
  return [...new Set(out)];
}

export function levelTowerPool(themeId, subLevel) {
  if (themeId === 1) {
    return T1_PROGRESSION[subLevel - 1] || T1_PROGRESSION[T1_PROGRESSION.length - 1];
  }
  if (themeId === 2 && subLevel === 1) return T2_FIRST;        // banana introduction
  const favs = THEME_FAVORITES[themeId] || [];
  const extras = rotateExtras(themeId, subLevel);
  return [...new Set([...favs, ...extras])];
}

// Level N+1 may introduce towers not seen at level N. Returns the array of
// "newly introduced" tower types when transitioning between two pools.
export function newlyIntroducedTowers(prevPool, nextPool) {
  const prev = new Set(prevPool || []);
  return (nextPool || []).filter(t => !prev.has(t));
}
