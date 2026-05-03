// Theme defines visual + tower-pool constants shared across all 10 levels of a theme.
// Per-level differences (path, waves, difficulty) live in campaign.js.

export const THEMES = {
  1: {
    id: 1,
    name: '糖霜花园',
    accent: 'var(--pink)',
    accentDeep: 'var(--pink-deep)',
    bgPrimary: '#C4E4D4',
    bgSecondary: '#D4ECDD',
    pathStyle: { outer: '#E0BC8C', inner: '#F5DEB3', sprinkles: ['#FFB5C5','#7BC4A0','#F8E060','#B79CD1','#F5B872'] },
    // Onboarding pool: every attack archetype except chain/melee, so players see
    // point/beam/boomerang/splash/AOE-rain early.
    availableTowers: ['cookie','cupcake','donut','macaron','lollipop','lemon','wall'],
    decorations: [
      { type: 'macaronTree', gx: 1, gy: 7 }, { type: 'macaronTree', gx: 14, gy: 7 },
      { type: 'lollipopFlower', gx: 5, gy: 0 }, { type: 'lollipopFlower', gx: 11, gy: 8 },
      { type: 'lollipopFlower', gx: 0, gy: 5 }, { type: 'lollipopFlower', gx: 14, gy: 0 },
    ],
    mechanic: null,
    description: '甜甜的入门花园，学习塔防基础',
  },
  2: {
    id: 2,
    name: '饼干森林',
    accent: 'var(--peach)',
    accentDeep: 'var(--peach-deep)',
    bgPrimary: '#E8D5B0',
    bgSecondary: '#F0DFB8',
    pathStyle: { outer: '#A98467', inner: '#D9B47C', sprinkles: ['#5A3E36','#FFB5C5','#F8E060','#7BC4A0','#A98467'] },
    // Dual entries — choco's chain hits both lanes, banana defends choke points.
    availableTowers: ['cookie','cupcake','donut','lollipop','choco','banana','wall'],
    decorations: [
      { type: 'cookieBush', gx: 1, gy: 5 }, { type: 'cookieBush', gx: 6, gy: 0 },
      { type: 'cookieBush', gx: 12, gy: 7 }, { type: 'cookieBush', gx: 14, gy: 6 },
      { type: 'lollipopFlower', gx: 0, gy: 7 }, { type: 'lollipopFlower', gx: 5, gy: 8 },
    ],
    mechanic: 'multipath',
    description: '双入口森林，敌人从两路而来',
  },
  3: {
    id: 3,
    name: '果冻沼泽',
    accent: 'var(--mint)',
    accentDeep: 'var(--mint-deep)',
    bgPrimary: '#B0DFC8',
    bgSecondary: '#C0E5D2',
    pathStyle: { outer: '#7BB89A', inner: '#A8D9C0', sprinkles: ['#FFB5C5','#F8E060','#B79CD1','#A8D9C0','#7BB89A'] },
    // Tidal mini-waves + curvy paths: icecream aura + lemon AOE rain are the
    // counter; strawberry chain is for splitter swarms.
    availableTowers: ['cookie','cupcake','lemon','donut','strawberry','icecream','wall'],
    decorations: [
      { type: 'jellyCube', gx: 0, gy: 4 }, { type: 'jellyCube', gx: 14, gy: 1 },
      { type: 'jellyCube', gx: 14, gy: 7 }, { type: 'jellyCube', gx: 6, gy: 8 },
      { type: 'lollipopFlower', gx: 1, gy: 8 },
    ],
    mechanic: 'tidal',
    description: '潮汐定时涌来支援敌军',
  },
  4: {
    id: 4,
    name: '棉花糖云海',
    accent: 'var(--lavender)',
    accentDeep: 'var(--lavender-deep)',
    bgPrimary: '#D4C5E0',
    bgSecondary: '#DECEE8',
    pathStyle: { outer: '#E0E5F0', inner: 'white', sprinkles: ['#FFB5C5','#D9C5E8','#F8E060','#B79CD1','#A8D9C0'] },
    // Flying enemies: macaron beam pierces straight lines, choco chain
    // hits multiple flyers at once.
    availableTowers: ['cookie','cupcake','macaron','choco','strawberry','lemon','wall'],
    decorations: [
      { type: 'marshmallowCloud', gx: 0, gy: 0 }, { type: 'marshmallowCloud', gx: 14, gy: 0 },
      { type: 'marshmallowCloud', gx: 0, gy: 7 }, { type: 'marshmallowCloud', gx: 4, gy: 7 },
      { type: 'marshmallowCloud', gx: 8, gy: 1 }, { type: 'starTwinkle', gx: 11, gy: 1 },
      { type: 'starTwinkle', gx: 14, gy: 7 }, { type: 'starTwinkle', gx: 2, gy: 5 },
    ],
    mechanic: 'flying',
    description: '飞行单位横行的云端，远射程为王',
  },
  5: {
    id: 5,
    name: '巧克力工厂',
    accent: 'var(--choco)',
    accentDeep: '#8B6F5C',
    bgPrimary: '#C8A684',
    bgSecondary: '#D4B896',
    pathStyle: { outer: '#3A2A26', inner: '#5A3E36', stripes: true, sprinkles: ['#F8E060','#FFB5C5','#A98467','#FFEAD0','#5A3E36'] },
    // Conveyor speed boost: banana's melee charges off the belt, icecream
    // freezes them, cake AOE clears the speed segment.
    availableTowers: ['cookie','donut','choco','banana','cake','icecream','wall'],
    decorations: [
      { type: 'gearCookie', gx: 1, gy: 7 }, { type: 'gearCookie', gx: 14, gy: 7 },
      { type: 'gearCookie', gx: 6, gy: 0 }, { type: 'chocoPot', gx: 0, gy: 4 },
      { type: 'chocoPot', gx: 14, gy: 0 }, { type: 'chocoPot', gx: 11, gy: 4 },
    ],
    mechanic: 'conveyor',
    description: '传送带提速敌人，需要更早布防',
  },
  6: {
    id: 6,
    name: '冰淇淋雪山',
    accent: 'var(--mint)',
    accentDeep: 'var(--mint-deep)',
    bgPrimary: '#D8E8E8',
    bgSecondary: '#E5F0F0',
    pathStyle: { outer: '#9CB0C9', inner: '#E0F0FF', cracks: true, sprinkles: ['white','#A8D9C0','#FFB5C5','#B79CD1','#D8E8E8'] },
    // Frozen tiles boost range/splash — macaron + cake love them. Choco chain
    // anchors group play.
    availableTowers: ['cookie','cupcake','macaron','donut','choco','cake','wall'],
    decorations: [
      { type: 'icePine', gx: 0, gy: 8 }, { type: 'icePine', gx: 4, gy: 8 },
      { type: 'icePine', gx: 8, gy: 8 }, { type: 'icePine', gx: 14, gy: 8 },
      { type: 'icePine', gx: 1, gy: 4 }, { type: 'icePine', gx: 14, gy: 0 },
      { type: 'starTwinkle', gx: 6, gy: 0 }, { type: 'starTwinkle', gx: 11, gy: 7 },
    ],
    mechanic: 'frozen',
    description: '冰冻地形让某些格子上的塔射速变慢',
  },
};

// Stars-gate to unlock a theme. Theme N requires (N-1) * 8 cumulative stars.
// 60 levels × 3 stars = 180 max; 8/16/24/32/40 keeps gates progressive.
export const THEME_UNLOCK_STARS = { 1: 0, 2: 8, 3: 16, 4: 24, 5: 32, 6: 40 };

export function getTheme(id) {
  const t = THEMES[id];
  if (!t) throw new Error(`Unknown theme id: ${id}`);
  return t;
}
