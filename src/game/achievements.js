// Achievement definitions + lifetime stat tracking.
//
// processEvents(events, state) is the only thing the rest of the app talks to:
// give it the latest delta of `world.events`, it mutates the stat counters and
// returns the list of newly-unlocked achievement IDs to celebrate.

const STORAGE_KEY = 'sd-achievements-v1';

export const ACHIEVEMENTS = [
  { id: 'first_clear',    name: '初尝甜蜜',     desc: '通关任意一关',          icon: '🥇', metric: 'levelsWon',    target: 1 },
  { id: 'three_clears',   name: '老练守护',     desc: '通关 3 个关卡',         icon: '🛡️', metric: 'levelsWon',    target: 3 },
  { id: 'all_clears',     name: '糖果国王',     desc: '通关所有 6 关',         icon: '👑', metric: 'levelsWon',    target: 6 },

  { id: 'kill_50',        name: '小英雄',       desc: '累计击败 50 只小动物',  icon: '🐭', metric: 'kills',        target: 50 },
  { id: 'kill_500',       name: '糖果守护神',   desc: '累计击败 500 只小动物', icon: '⚔️',  metric: 'kills',        target: 500 },
  { id: 'kill_2000',      name: '动物图鉴员',   desc: '累计击败 2000 只小动物',icon: '📕', metric: 'kills',        target: 2000 },

  { id: 'boss_1',         name: 'BOSS 猎人',    desc: '击败一次蜜熊王',        icon: '🐻', metric: 'bossKills',    target: 1 },
  { id: 'boss_10',        name: '熊语者',       desc: '累计击败 10 次蜜熊王',  icon: '🍯', metric: 'bossKills',    target: 10 },

  { id: 'place_50',       name: '建筑师',       desc: '累计放置 50 座防御塔',  icon: '🏗️', metric: 'placed',       target: 50 },
  { id: 'place_300',      name: '都市规划师',   desc: '累计放置 300 座防御塔', icon: '🏰', metric: 'placed',       target: 300 },
  { id: 'upgrade_30',     name: '升级控',       desc: '累计升级 30 次',        icon: '⬆️', metric: 'upgrades',     target: 30 },

  { id: 'obs_10',         name: '清道夫',       desc: '打掉 10 块石头障碍',    icon: '🧹', metric: 'obstacles',    target: 10 },
  { id: 'wall_5',         name: '糖墙工程',     desc: '放置 5 道糖墙',         icon: '🧱', metric: 'walls',        target: 5 },

  { id: 'combo_5',        name: '小爆发',       desc: '达成 5 连击',           icon: '🎯', metric: 'maxCombo',     target: 5 },
  { id: 'combo_15',       name: '连击大师',     desc: '达成 15 连击',          icon: '🔥', metric: 'maxCombo',     target: 15 },
  { id: 'combo_30',       name: '甜蜜风暴',     desc: '达成 30 连击',          icon: '🌪️', metric: 'maxCombo',     target: 30 },

  { id: 'endless_10',     name: '星空旅者',     desc: '无尽模式坚持到第 10 波',icon: '⭐', metric: 'maxEndlessWave', target: 10 },
  { id: 'endless_25',     name: '银河捍卫者',   desc: '无尽模式坚持到第 25 波',icon: '🌌', metric: 'maxEndlessWave', target: 25 },
  { id: 'daily_done',     name: '每日打卡',     desc: '完成一次每日挑战',      icon: '📆', metric: 'dailyRuns',    target: 1 },

  { id: 'perfect_clear',  name: '不破金身',     desc: '通关时生命满格',        icon: '💖', metric: 'perfectRuns',  target: 1 },
];

export function defaultStats() {
  return {
    kills: 0,
    bossKills: 0,
    placed: 0,
    upgrades: 0,
    obstacles: 0,
    walls: 0,
    maxCombo: 0,
    levelsWon: 0,
    maxEndlessWave: 0,
    dailyRuns: 0,
    perfectRuns: 0,
  };
}

export function loadAchievementState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        stats: { ...defaultStats(), ...(parsed.stats || {}) },
        unlocked: parsed.unlocked || {},
      };
    }
  } catch {}
  return { stats: defaultStats(), unlocked: {} };
}

export function saveAchievementState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// Drain a list of world events into the lifetime stats and return any newly
// unlocked achievement ids. Mutates `state`.
export function processEvents(events, state, extra = {}) {
  const newUnlocks = [];
  if (!events || !events.length) return newUnlocks;
  const s = state.stats;

  for (const e of events) {
    switch (e.type) {
      case 'enemy_killed':
        s.kills += 1;
        if (e.boss) s.bossKills += 1;
        if (e.combo && e.combo > s.maxCombo) s.maxCombo = e.combo;
        break;
      case 'tower_placed':
        s.placed += 1;
        break;
      case 'tower_upgraded':
        s.upgrades += 1;
        break;
      case 'obstacle_destroyed':
        s.obstacles += 1;
        break;
      case 'wall_placed':
        s.walls += 1;
        break;
      case 'level_won':
        s.levelsWon += 1;
        if (extra.fullHp) s.perfectRuns += 1;
        break;
    }
  }
  // Mode-specific stats supplied separately (no clean event for them).
  if (extra.endlessWave && extra.endlessWave > s.maxEndlessWave) {
    s.maxEndlessWave = extra.endlessWave;
  }
  if (extra.dailyDone) s.dailyRuns += 1;

  // Re-check achievements against updated stats.
  for (const a of ACHIEVEMENTS) {
    if (state.unlocked[a.id]) continue;
    const cur = s[a.metric] || 0;
    if (cur >= a.target) {
      state.unlocked[a.id] = Date.now();
      newUnlocks.push(a.id);
    }
  }
  return newUnlocks;
}

export function getProgress(achievement, stats) {
  const cur = stats[achievement.metric] || 0;
  return { cur, target: achievement.target, pct: Math.min(1, cur / achievement.target) };
}
