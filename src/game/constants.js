import { Cupcake, Donut, Macaron, IceCream, Lollipop, Cookie, Cake, ChocoFountain, Lemon, Strawberry, Banana } from '../art/desserts.jsx';
import { Mouse, Hedgehog, Rabbit, Squirrel, Raccoon, Pigeon, Fox, Bear, Healer, Shielded, Splitter } from '../art/animals.jsx';
import { NougatWall } from '../art/structures.jsx';

export const T = 80;
export const COLS = 16;
export const ROWS = 9;
export const W = COLS * T;
export const H = ROWS * T;

export const PREP_DURATION = 5;

// === Tower definitions ===
//
// Each tower has:
//   attackKind  — point / beam / boomerang / wave / chain / melee / splash /
//                 multiSplash / chainBounce
//   synergy     — { geometry, ...buff fields } where geometry is one of
//                 neighbor8 | orthogonal4 | diagonal4 | row | column | circle2
//
// Pricing was collapsed to a 60-130 band so towers compete on niche, not raw
// cost. Each tower has a unique synergy field + geometry combo.
export const TOWER_DEFS = {
  cookie: {
    Comp: Cookie,            cost: 60,   dmg: 7,  range: 1.8, cd: 0.85,
    name: '曲奇饼',          role: '点射 · 残血加伤',
    desc: '朴素点射，5% 暴击。给 8 邻塔残血斩杀加伤。',
    proj: '#D9B47C',         attackKind: 'point',
    critChance: 0.05,        critMul: 2.0,
    synergy: { geometry: 'neighbor8', executeBonus: 0.10 },
  },
  cupcake: {
    Comp: Cupcake,           cost: 80,   dmg: 9,  range: 2.0, cd: 0.32,
    name: '杯子蛋糕',        role: '点射 · 高频',
    desc: '高速糖珠扫射。给十字 4 邻塔射速 +8.7%。',
    proj: '#FFB5C5',         attackKind: 'point',
    synergy: { geometry: 'orthogonal4', cdMul: -0.08 },
  },
  macaron: {
    Comp: Macaron,           cost: 110,  dmg: 22, range: 4.2, cd: 1.20,
    name: '马卡龙',          role: '直线穿透',
    desc: '直线投掷穿透，每多一个目标 ×0.7 dmg。给整行塔 range +10%。',
    proj: '#B79CD1',         attackKind: 'beam',
    pierce: 4,               pierceFalloff: 0.7,
    synergy: { geometry: 'row', rangeMul: 0.10 },
  },
  donut: {
    Comp: Donut,             cost: 100,  dmg: 13, range: 2.0, cd: 0.95,
    name: '甜甜圈',          role: '环形 splash',
    desc: '糖霜炸开，命中敌人受伤 +20% 持续 2 秒。给斜对角塔 splash +15%。',
    proj: '#F58CA6',         attackKind: 'splash',
    splash: 1.2,
    debuff: { kind: 'frosting', amount: 0.20, duration: 2.0 },
    synergy: { geometry: 'diagonal4', splashMul: 0.15 },
  },
  icecream: {
    Comp: IceCream,          cost: 120,  dmg: 0,  range: 2.0, cd: 1.50,
    name: '冰淇淋',          role: '光波圈 · 减速冻结',
    desc: '周期性向外扩散冷波，圈内敌人减速；停留过久自动冻结。给 2 格圆内塔状态 +20%。',
    proj: '#A8D9C0',         attackKind: 'wave',
    waveDamage: 4,
    waveSlow: { factor: 0.5, duration: 1.6 },
    freezeAfter: 3.0,        freezeDuration: 1.5,
    synergy: { geometry: 'circle2', statusDuration: 0.20 },
  },
  lollipop: {
    Comp: Lollipop,          cost: 90,   dmg: 8,  range: 2.2, cd: 1.10,
    name: '棒棒糖',          role: '回旋镖',
    desc: '糖棒飞出绕弧线返回，往返打沿路。给整列塔眩晕概率 +10%。',
    proj: '#FFE5EC',         attackKind: 'boomerang',
    synergy: { geometry: 'column', stunChance: 0.10 },
  },
  choco: {
    Comp: ChocoFountain,     cost: 110,  dmg: 6,  range: 2.2, cd: 0.55,
    name: '巧克力喷泉',      role: '连电 · DOT',
    desc: '同时电连最多 ⭐ 个目标（=等级），每 tick 附加燃烧叠层。给 8 邻塔 DOT +15%。',
    proj: '#5A3E36',         attackKind: 'chain',
    dot: { dps: 1.0, duration: 3.0, maxStacks: 5 },
    synergy: { geometry: 'neighbor8', dotDamage: 0.15 },
  },
  cake: {
    Comp: Cake,              cost: 130,  dmg: 32, range: 2.6, cd: 1.30,
    name: '蛋糕',            role: '点射 · 击杀爆炸',
    desc: '高伤单点 + 10% 暴击 ×2.5；击杀触发圆形爆炸。给整行塔 dmg +10%。',
    proj: '#F8E060',         attackKind: 'point',
    splash: 0,
    critChance: 0.10,        critMul: 2.5,
    onKillSplash: 1.4,
    synergy: { geometry: 'row', dmgMul: 0.10 },
  },
  lemon: {
    Comp: Lemon,             cost: 100,  dmg: 5,  range: 2.0, cd: 0.95,
    name: '柠檬汁',          role: '三发酸雨',
    desc: '同时落 3 发小 splash + 易伤 debuff。给十字 4 邻塔减速更狠 (-0.10)。',
    proj: '#FFEC80',         attackKind: 'multiSplash',
    splashCount: 3,          splashSpread: 1.0,
    splash: 0.8,
    slow: { factor: 0.65, duration: 1.8 },
    debuff: { kind: 'acid', amount: 0.15, duration: 2.0 },
    synergy: { geometry: 'orthogonal4', slowFactor: -0.10 },
  },
  strawberry: {
    Comp: Strawberry,        cost: 110,  dmg: 14, range: 2.4, cd: 1.00,
    name: '草莓',            role: '弹链 · 双击',
    desc: '弹链 3 跳，每跳 30% 双击。给斜对角塔多发概率 +8%。',
    proj: '#F58CA6',         attackKind: 'chainBounce',
    chainBounce: 3,          doubleTapChance: 0.30,
    synergy: { geometry: 'diagonal4', multiShot: 0.08 },
  },
  banana: {
    Comp: Banana,            cost: 90,   dmg: 8,  range: 1.0, cd: 0.40,
    name: '香蕉',            role: '近战 · 蓄力群攻',
    desc: '短 range 高速点击，5 击触发圆形大群伤 + 击退。给 8 邻塔击退距离 +15。',
    proj: '#F8E060',         attackKind: 'melee',
    chargeNeeded: 5,
    chargeRadius: 1.5,
    chargeDamage: 36,
    knockback: 56,
    synergy: { geometry: 'neighbor8', knockback: 15 },
  },
};

export const TOWER_ORDER = ['cupcake','macaron','donut','icecream','lollipop','cookie','choco','cake','lemon','strawberry','banana'];

// Walls — placed ON path tiles, block enemies, no attack.
export const WALL_DEFS = {
  wall: { Comp: NougatWall, cost: 75, hp: 220, name: '糖墙', role: '阻挡', desc: '挡住路径上的敌人' },
};

// Boulder obstacle component (used by GameBoard)
export { Boulder } from '../art/structures.jsx';

// Obstacles are now destructible by towers (via focus-fire). They award
// sugar when killed instead of costing sugar to clear manually.
export const OBSTACLE_HP = 60;
export const OBSTACLE_REWARD = 40;
export const ENGAGE_DIST = T * 0.5; // px in front of wall where enemies stop

export const ENEMY_DEFS = {
  mouse:    { Comp: Mouse,    hp: 22,  speed: 1.4, reward: 8,  wallDps: 14, name: '糖糖鼠',   damage: 1,           desc: '速度快、生命少',  tag: '基础' },
  rabbit:   { Comp: Rabbit,   hp: 16,  speed: 2.0, reward: 10, wallDps: 12, name: '跳跳兔',   damage: 1,           desc: '可跳过部分塔',    tag: '特殊' },
  hedgehog: { Comp: Hedgehog, hp: 90,  speed: 0.7, reward: 18, wallDps: 30, name: '刺刺球',   damage: 2,           desc: '装甲厚血量高',    tag: '装甲' },
  squirrel: { Comp: Squirrel, hp: 30,  speed: 1.3, reward: 12, wallDps: 16, name: '抢糖松鼠', damage: 1, steal: 6, desc: '会偷走糖果',      tag: '小偷' },
  raccoon:  { Comp: Raccoon,  hp: 38,  speed: 1.2, reward: 14, wallDps: 20, name: '夜行浣熊', damage: 1,           desc: '隐身潜行',        tag: '隐身' },
  pigeon:   { Comp: Pigeon,   hp: 22,  speed: 1.7, reward: 12, wallDps: 14, name: '云端鸽',   damage: 1,           desc: '飞行单位',        tag: '飞行' },
  fox:      { Comp: Fox,      hp: 42,  speed: 1.4, reward: 16, wallDps: 22, name: '狡狐',     damage: 1, dodge: 0.22, desc: '会闪避攻击',   tag: '闪避' },
  bear:     { Comp: Bear,     hp: 360, speed: 0.55,reward: 100,wallDps: 80, name: '蜜熊王',   damage: 5, boss: true,  desc: '关卡 BOSS',     tag: 'BOSS' },
  healer:   { Comp: Healer,   hp: 28,  speed: 1.0, reward: 16, wallDps: 12, name: '糖兔治愈', damage: 1,  desc: '治愈周围伙伴',  tag: '治愈',
              heal: { rate: 1.6, amount: 9, radius: 1.6 } },
  shielded: { Comp: Shielded, hp: 36,  speed: 0.85,reward: 18, wallDps: 22, name: '糖龟甲',  damage: 1,  desc: '硬糖盾抵首伤',  tag: '盾',
              shield: 28 },
  splitter: { Comp: Splitter, hp: 56,  speed: 1.05,reward: 20, wallDps: 18, name: '糖球虫',  damage: 1,  desc: '死亡分裂为二',  tag: '分裂',
              splitter: { childType: 'splitter_mini', count: 2 } },
  splitter_mini: { Comp: Splitter, hp: 18, speed: 1.4, reward: 6, wallDps: 8, name: '糖小球', damage: 1, desc: '糖球虫的分裂体', tag: '分裂', tint: 'mint', sizeMul: 0.6 },
};

// LEVELS now lives in ./levels/index.js (60 levels). Re-export below so the
// rest of the codebase can keep importing { LEVELS } from constants.
export { LEVELS } from './levels/index.js';

