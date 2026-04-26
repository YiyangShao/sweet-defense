import { Cupcake, Donut, Macaron, IceCream, Lollipop, Cookie, Cake, ChocoFountain } from '../art/desserts.jsx';
import { Mouse, Hedgehog, Rabbit, Squirrel, Raccoon, Pigeon, Fox, Bear } from '../art/animals.jsx';
import { NougatWall } from '../art/structures.jsx';

export const T = 80;
export const COLS = 16;
export const ROWS = 9;
export const W = COLS * T;
export const H = ROWS * T;

export const PREP_DURATION = 5;

// Default S-shape path used by every level (for now)
export const PATH_GRID = [
  [0,1],[1,1],[2,1],[3,1],[3,2],[3,3],[3,4],
  [4,4],[5,4],[6,4],[6,3],[6,2],[7,2],[8,2],
  [9,2],[9,3],[9,4],[9,5],[9,6],[10,6],[11,6],
  [12,6],[12,5],[12,4],[13,4],[14,4],[15,4],
];

export const TOWER_DEFS = {
  cupcake:  { Comp: Cupcake,       cost: 50,  dmg: 8,  range: 2.0, cd: 0.22, name: '杯子蛋糕',     role: '快速射击', desc: '糖珠扫射，对小怪极有效',     proj: '#FFB5C5' },
  macaron:  { Comp: Macaron,       cost: 80,  dmg: 26, range: 3.8, cd: 1.10, name: '马卡龙',       role: '远程狙击', desc: '远距精准重击',                proj: '#B79CD1' },
  donut:    { Comp: Donut,         cost: 100, dmg: 14, range: 1.9, cd: 1.00, splash: 1.2, name: '甜甜圈', role: '环形伤害', desc: '糖霜爆炸，溅射群伤', proj: '#F58CA6' },
  icecream: { Comp: IceCream,      cost: 120, dmg: 4,  range: 2.2, cd: 0.60, slow: { factor: 0.5, duration: 1.6 }, name: '冰淇淋', role: '冰冻减速', desc: '降低敌人速度', proj: '#A8D9C0' },
  lollipop: { Comp: Lollipop,      cost: 90,  dmg: 6,  range: 2.0, cd: 0.85, stun: 0.9, name: '棒棒糖',  role: '眩晕控制', desc: '短暂定身敌人',                proj: '#FFE5EC' },
  cookie:   { Comp: Cookie,        cost: 30,  dmg: 6,  range: 1.7, cd: 0.95, name: '曲奇饼',       role: '基础便宜', desc: '入门首选，性价比高',          proj: '#D9B47C' },
  choco:    { Comp: ChocoFountain, cost: 200, dmg: 9,  range: 2.0, cd: 0.18, name: '巧克力喷泉',   role: '持续伤害', desc: '高频微伤喷射',                proj: '#5A3E36' },
  cake:     { Comp: Cake,          cost: 350, dmg: 50, range: 2.6, cd: 1.40, splash: 0.9, name: '蛋糕', role: 'Boss 塔', desc: '重型轰击，AOE 巨伤',         proj: '#F8E060' },
};

export const TOWER_ORDER = ['cupcake','macaron','donut','icecream','lollipop','cookie','choco','cake'];

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
};

// 6 levels — each defines theme color + a wave list (re-using the shared path for now)
export const LEVELS = [
  {
    id: 1, name: '糖霜花园', themeKey: 'pastel', accent: 'var(--pink)', accentDeep: 'var(--pink-deep)',
    startSugar: 250, startHp: 20,
    bgPrimary: '#C4E4D4', bgSecondary: '#D4ECDD',
    obstacles: [[1,3],[5,1],[10,3]],
    waves: [
      [ { type: 'mouse', count: 8, interval: 0.85, delay: 0 } ],
      [ { type: 'mouse', count: 6, interval: 0.70, delay: 0 },
        { type: 'rabbit', count: 4, interval: 1.00, delay: 6 } ],
      [ { type: 'mouse', count: 6, interval: 0.55, delay: 0 },
        { type: 'hedgehog', count: 3, interval: 2.40, delay: 4 },
        { type: 'squirrel', count: 2, interval: 1.40, delay: 9 } ],
      [ { type: 'mouse', count: 8, interval: 0.45, delay: 0 },
        { type: 'rabbit', count: 5, interval: 0.80, delay: 4 },
        { type: 'fox', count: 3, interval: 1.50, delay: 9 },
        { type: 'raccoon', count: 2, interval: 1.20, delay: 14 } ],
      [ { type: 'mouse', count: 10, interval: 0.45, delay: 0 },
        { type: 'rabbit', count: 6, interval: 0.70, delay: 4 },
        { type: 'hedgehog', count: 3, interval: 2.20, delay: 8 },
        { type: 'fox', count: 4, interval: 1.20, delay: 12 },
        { type: 'bear', count: 1, interval: 1, delay: 16 } ],
    ],
  },
  {
    id: 2, name: '饼干森林', themeKey: 'peach', accent: 'var(--peach)', accentDeep: 'var(--peach-deep)',
    startSugar: 250, startHp: 20,
    bgPrimary: '#E8D5B0', bgSecondary: '#F0DFB8',
    obstacles: [[1,5],[4,7],[8,1],[12,3]],
    waves: [
      [ { type: 'mouse', count: 10, interval: 0.65, delay: 0 } ],
      [ { type: 'rabbit', count: 8, interval: 0.65, delay: 0 } ],
      [ { type: 'mouse', count: 8, interval: 0.50, delay: 0 },
        { type: 'hedgehog', count: 4, interval: 2.00, delay: 3 } ],
      [ { type: 'rabbit', count: 6, interval: 0.55, delay: 0 },
        { type: 'squirrel', count: 4, interval: 1.20, delay: 4 },
        { type: 'fox', count: 3, interval: 1.50, delay: 9 } ],
      [ { type: 'mouse', count: 10, interval: 0.40, delay: 0 },
        { type: 'hedgehog', count: 5, interval: 1.80, delay: 5 },
        { type: 'pigeon', count: 4, interval: 1.20, delay: 9 } ],
      [ { type: 'mouse', count: 8, interval: 0.40, delay: 0 },
        { type: 'rabbit', count: 6, interval: 0.60, delay: 4 },
        { type: 'fox', count: 4, interval: 1.20, delay: 8 },
        { type: 'hedgehog', count: 3, interval: 1.80, delay: 12 },
        { type: 'bear', count: 1, interval: 1, delay: 18 } ],
    ],
  },
  {
    id: 3, name: '果冻沼泽', themeKey: 'mint', accent: 'var(--mint)', accentDeep: 'var(--mint-deep)',
    startSugar: 280, startHp: 20,
    bgPrimary: '#B0DFC8', bgSecondary: '#C0E5D2',
    obstacles: [[2,3],[5,7],[8,5],[11,3]],
    waves: [
      [ { type: 'mouse', count: 12, interval: 0.55, delay: 0 } ],
      [ { type: 'squirrel', count: 6, interval: 0.85, delay: 0 } ],
      [ { type: 'rabbit', count: 8, interval: 0.55, delay: 0 },
        { type: 'hedgehog', count: 4, interval: 1.70, delay: 4 } ],
      [ { type: 'mouse', count: 10, interval: 0.40, delay: 0 },
        { type: 'fox', count: 5, interval: 1.10, delay: 4 } ],
      [ { type: 'rabbit', count: 8, interval: 0.50, delay: 0 },
        { type: 'pigeon', count: 6, interval: 0.90, delay: 4 },
        { type: 'hedgehog', count: 4, interval: 1.60, delay: 9 } ],
      [ { type: 'squirrel', count: 6, interval: 0.80, delay: 0 },
        { type: 'fox', count: 6, interval: 1.10, delay: 5 },
        { type: 'raccoon', count: 4, interval: 1.20, delay: 11 } ],
      [ { type: 'mouse', count: 10, interval: 0.35, delay: 0 },
        { type: 'rabbit', count: 6, interval: 0.60, delay: 4 },
        { type: 'hedgehog', count: 4, interval: 1.50, delay: 8 },
        { type: 'fox', count: 5, interval: 1.00, delay: 12 },
        { type: 'bear', count: 2, interval: 6, delay: 18 } ],
    ],
  },
  {
    id: 4, name: '棉花糖云海', themeKey: 'lavender', accent: 'var(--lavender)', accentDeep: 'var(--lavender-deep)',
    startSugar: 280, startHp: 20,
    bgPrimary: '#D4C5E0', bgSecondary: '#DECEE8',
    obstacles: [[1,5],[3,7],[6,5],[10,1],[13,3]],
    waves: [
      [ { type: 'pigeon', count: 8, interval: 0.55, delay: 0 } ],
      [ { type: 'rabbit', count: 8, interval: 0.50, delay: 0 },
        { type: 'pigeon', count: 6, interval: 0.80, delay: 5 } ],
      [ { type: 'mouse', count: 10, interval: 0.40, delay: 0 },
        { type: 'fox', count: 6, interval: 1.10, delay: 4 } ],
      [ { type: 'hedgehog', count: 5, interval: 1.50, delay: 0 },
        { type: 'pigeon', count: 8, interval: 0.70, delay: 3 } ],
      [ { type: 'squirrel', count: 6, interval: 0.70, delay: 0 },
        { type: 'fox', count: 6, interval: 1.00, delay: 4 },
        { type: 'raccoon', count: 5, interval: 1.10, delay: 10 } ],
      [ { type: 'rabbit', count: 10, interval: 0.40, delay: 0 },
        { type: 'pigeon', count: 8, interval: 0.60, delay: 4 },
        { type: 'hedgehog', count: 5, interval: 1.40, delay: 9 } ],
      [ { type: 'mouse', count: 12, interval: 0.30, delay: 0 },
        { type: 'fox', count: 6, interval: 0.90, delay: 5 },
        { type: 'hedgehog', count: 5, interval: 1.30, delay: 10 },
        { type: 'raccoon', count: 4, interval: 1.10, delay: 15 },
        { type: 'bear', count: 2, interval: 5, delay: 20 } ],
    ],
  },
  {
    id: 5, name: '巧克力工厂', themeKey: 'choco', accent: 'var(--choco)', accentDeep: '#8B6F5C',
    startSugar: 300, startHp: 20,
    bgPrimary: '#C8A684', bgSecondary: '#D4B896',
    obstacles: [[1,3],[4,1],[5,7],[8,7],[11,3],[14,7]],
    waves: [
      [ { type: 'hedgehog', count: 5, interval: 1.50, delay: 0 } ],
      [ { type: 'mouse', count: 14, interval: 0.40, delay: 0 } ],
      [ { type: 'fox', count: 8, interval: 0.90, delay: 0 } ],
      [ { type: 'rabbit', count: 10, interval: 0.45, delay: 0 },
        { type: 'hedgehog', count: 5, interval: 1.50, delay: 4 } ],
      [ { type: 'pigeon', count: 8, interval: 0.60, delay: 0 },
        { type: 'fox', count: 6, interval: 0.90, delay: 4 } ],
      [ { type: 'hedgehog', count: 6, interval: 1.30, delay: 0 },
        { type: 'fox', count: 6, interval: 0.90, delay: 4 },
        { type: 'raccoon', count: 5, interval: 1.10, delay: 9 } ],
      [ { type: 'mouse', count: 14, interval: 0.30, delay: 0 },
        { type: 'rabbit', count: 8, interval: 0.50, delay: 5 },
        { type: 'pigeon', count: 6, interval: 0.80, delay: 9 } ],
      [ { type: 'squirrel', count: 8, interval: 0.70, delay: 0 },
        { type: 'fox', count: 8, interval: 0.80, delay: 4 },
        { type: 'hedgehog', count: 6, interval: 1.20, delay: 10 },
        { type: 'bear', count: 2, interval: 8, delay: 16 } ],
    ],
  },
  {
    id: 6, name: '冰淇淋雪山', themeKey: 'snow', accent: 'var(--mint)', accentDeep: 'var(--mint-deep)',
    startSugar: 320, startHp: 20,
    bgPrimary: '#D8E8E8', bgSecondary: '#E5F0F0',
    obstacles: [[1,5],[2,7],[5,1],[8,5],[10,1],[13,7]],
    waves: [
      [ { type: 'mouse', count: 16, interval: 0.40, delay: 0 } ],
      [ { type: 'rabbit', count: 10, interval: 0.45, delay: 0 },
        { type: 'pigeon', count: 6, interval: 0.80, delay: 4 } ],
      [ { type: 'hedgehog', count: 6, interval: 1.30, delay: 0 },
        { type: 'fox', count: 6, interval: 0.90, delay: 4 } ],
      [ { type: 'squirrel', count: 8, interval: 0.65, delay: 0 },
        { type: 'raccoon', count: 6, interval: 1.00, delay: 5 } ],
      [ { type: 'mouse', count: 12, interval: 0.30, delay: 0 },
        { type: 'rabbit', count: 8, interval: 0.45, delay: 4 },
        { type: 'pigeon', count: 6, interval: 0.70, delay: 8 } ],
      [ { type: 'hedgehog', count: 7, interval: 1.20, delay: 0 },
        { type: 'fox', count: 7, interval: 0.85, delay: 4 },
        { type: 'pigeon', count: 6, interval: 0.70, delay: 9 } ],
      [ { type: 'rabbit', count: 10, interval: 0.40, delay: 0 },
        { type: 'fox', count: 7, interval: 0.80, delay: 4 },
        { type: 'raccoon', count: 6, interval: 1.00, delay: 9 },
        { type: 'hedgehog', count: 5, interval: 1.30, delay: 13 } ],
      [ { type: 'mouse', count: 16, interval: 0.25, delay: 0 },
        { type: 'rabbit', count: 10, interval: 0.40, delay: 4 },
        { type: 'fox', count: 8, interval: 0.80, delay: 8 },
        { type: 'hedgehog', count: 6, interval: 1.20, delay: 12 },
        { type: 'raccoon', count: 5, interval: 1.10, delay: 16 },
        { type: 'bear', count: 3, interval: 6, delay: 22 } ],
    ],
  },
];
