import { Cupcake, Donut, Macaron, IceCream, Lollipop, Cookie, Cake, ChocoFountain, Lemon, Strawberry, Banana } from '../art/desserts.jsx';
import { Mouse, Hedgehog, Rabbit, Squirrel, Raccoon, Pigeon, Fox, Bear, Healer, Shielded, Splitter } from '../art/animals.jsx';
import { NougatWall } from '../art/structures.jsx';

export const T = 80;
export const COLS = 16;
export const ROWS = 9;
export const W = COLS * T;
export const H = ROWS * T;

export const PREP_DURATION = 5;

// `synergy`: bonuses this tower grants to its 8-neighbor placements.
// dmgMul/rangeMul/splashMul are additive multipliers (e.g. 0.10 = +10%).
// cdMul is also additive (e.g. -0.15 = -15% cooldown / faster fire).
export const TOWER_DEFS = {
  cupcake:  { Comp: Cupcake,       cost: 50,  dmg: 8,  range: 2.0, cd: 0.22, name: '杯子蛋糕',     role: '快速射击', desc: '糖珠扫射，对小怪极有效',     proj: '#FFB5C5' },
  macaron:  { Comp: Macaron,       cost: 80,  dmg: 26, range: 3.8, cd: 1.10, synergy: { rangeMul: 0.10 },                 name: '马卡龙',       role: '远程狙击', desc: '远距精准重击',                proj: '#B79CD1' },
  donut:    { Comp: Donut,         cost: 100, dmg: 14, range: 1.9, cd: 1.00, splash: 1.2, synergy: { dmgMul: 0.05, splashMul: 0.15 }, name: '甜甜圈', role: '环形伤害', desc: '糖霜爆炸，溅射群伤', proj: '#F58CA6' },
  icecream: { Comp: IceCream,      cost: 120, dmg: 4,  range: 2.2, cd: 0.60, slow: { factor: 0.5, duration: 1.6 }, synergy: { cdMul: -0.10 }, name: '冰淇淋', role: '冰冻减速', desc: '降低敌人速度', proj: '#A8D9C0' },
  lollipop: { Comp: Lollipop,      cost: 90,  dmg: 6,  range: 2.0, cd: 0.85, stun: 0.9, synergy: { dmgMul: 0.05 },        name: '棒棒糖',  role: '眩晕控制', desc: '短暂定身敌人',                proj: '#FFE5EC' },
  cookie:   { Comp: Cookie,        cost: 30,  dmg: 6,  range: 1.7, cd: 0.95, name: '曲奇饼',       role: '基础便宜', desc: '入门首选，性价比高',          proj: '#D9B47C' },
  choco:    { Comp: ChocoFountain, cost: 200, dmg: 9,  range: 2.0, cd: 0.18, synergy: { cdMul: -0.15 },                   name: '巧克力喷泉',   role: '持续伤害', desc: '高频微伤喷射',                proj: '#5A3E36' },
  cake:     { Comp: Cake,          cost: 350, dmg: 50, range: 2.6, cd: 1.40, splash: 0.9, synergy: { dmgMul: 0.10 },      name: '蛋糕', role: 'Boss 塔', desc: '重型轰击，AOE 巨伤',         proj: '#F8E060' },
  lemon:    { Comp: Lemon,         cost: 110, dmg: 5,  range: 2.0, cd: 0.80, splash: 1.4, slow: { factor: 0.55, duration: 2.2 }, synergy: { rangeMul: 0.05 }, name: '柠檬汁',  role: '范围减速', desc: 'AOE 减速，泼洒酸冰',   proj: '#FFEC80' },
  strawberry:{ Comp: Strawberry,   cost: 130, dmg: 18, range: 2.4, cd: 1.00, chainBounce: 2, synergy: { dmgMul: 0.05 },     name: '草莓',    role: '链式弹射', desc: '弹跳到 3 个目标',    proj: '#F58CA6' },
  banana:   { Comp: Banana,        cost: 100, dmg: 11, range: 2.0, cd: 0.70, knockback: 56, synergy: { cdMul: -0.05 },      name: '香蕉',    role: '击退',     desc: '命中后敌人后退',      proj: '#F8E060' },
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

