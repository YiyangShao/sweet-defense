// Achievement definitions + lifetime stat tracking.
//
// processEvents(events, state) is the only thing the rest of the app talks to:
// give it the latest delta of `world.events`, it mutates the stat counters and
// returns the list of newly-unlocked achievement IDs to celebrate.

const STORAGE_KEY = 'sd-achievements-v1';

// Achievements re-tiered for the 60-level / 6-theme campaign.
// Old "通关 6 关" trophies retired; new mastery and theme-finale tier added.
export const ACHIEVEMENTS = [
  // Campaign progression (60 levels / 180 stars total)
  { id: 'first_clear',    name: '初尝甜蜜',     desc: '通关任意一关',          icon: '🥇', metric: 'levelsWon',     target: 1 },
  { id: 'clears_10',      name: '小有所成',     desc: '通关 10 个关卡',        icon: '🛡️', metric: 'levelsWon',     target: 10 },
  { id: 'clears_30',      name: '半途辉煌',     desc: '通关 30 个关卡',        icon: '🎖️', metric: 'levelsWon',     target: 30 },
  { id: 'clears_60',      name: '甜点大师',     desc: '通关全部 60 关',        icon: '👑', metric: 'levelsWon',     target: 60 },

  // Theme mastery (≥25 stars in a theme)
  { id: 'mastery_first',  name: '初窥精通',     desc: '精通任意一个主题',      icon: '✨', metric: 'masteredThemes', target: 1 },
  { id: 'mastery_three',  name: '三连大师',     desc: '精通 3 个主题',         icon: '🌟', metric: 'masteredThemes', target: 3 },
  { id: 'mastery_all',    name: '全主题宗师',   desc: '精通全部 6 个主题',     icon: '🏆', metric: 'masteredThemes', target: 6 },

  // Stars
  { id: 'stars_30',       name: '星光初闪',     desc: '累计获得 30 ⭐',         icon: '⭐', metric: 'starsTotal',    target: 30 },
  { id: 'stars_90',       name: '星河璀璨',     desc: '累计获得 90 ⭐',         icon: '🌠', metric: 'starsTotal',    target: 90 },
  { id: 'stars_180',      name: '满天星海',     desc: '集齐全部 180 ⭐',        icon: '🌌', metric: 'starsTotal',    target: 180 },

  // Kills
  { id: 'kill_50',        name: '小英雄',       desc: '累计击败 50 只小动物',  icon: '🐭', metric: 'kills',         target: 50 },
  { id: 'kill_1000',      name: '糖果守护神',   desc: '累计击败 1000 只小动物',icon: '⚔️', metric: 'kills',         target: 1000 },
  { id: 'kill_5000',      name: '动物图鉴员',   desc: '累计击败 5000 只小动物',icon: '📕', metric: 'kills',         target: 5000 },

  // Boss
  { id: 'boss_1',         name: 'BOSS 猎人',    desc: '击败一次蜜熊王',        icon: '🐻', metric: 'bossKills',     target: 1 },
  { id: 'boss_10',        name: '熊语者',       desc: '累计击败 10 次蜜熊王',  icon: '🍯', metric: 'bossKills',     target: 10 },
  { id: 'boss_30',        name: '熊王终结',     desc: '累计击败 30 次蜜熊王',  icon: '🪓', metric: 'bossKills',     target: 30 },

  // Building
  { id: 'place_100',      name: '建筑师',       desc: '累计放置 100 座防御塔', icon: '🏗️', metric: 'placed',        target: 100 },
  { id: 'place_500',      name: '都市规划师',   desc: '累计放置 500 座防御塔', icon: '🏰', metric: 'placed',        target: 500 },
  { id: 'upgrade_50',     name: '升级控',       desc: '累计升级 50 次',        icon: '⬆️', metric: 'upgrades',      target: 50 },

  // Sub-systems
  { id: 'obs_20',         name: '清道夫',       desc: '打掉 20 块石头障碍',    icon: '🧹', metric: 'obstacles',     target: 20 },
  { id: 'wall_10',        name: '糖墙工程',     desc: '放置 10 道糖墙',        icon: '🧱', metric: 'walls',         target: 10 },

  // Combo
  { id: 'combo_5',        name: '小爆发',       desc: '达成 5 连击',           icon: '🎯', metric: 'maxCombo',      target: 5 },
  { id: 'combo_15',       name: '连击大师',     desc: '达成 15 连击',          icon: '🔥', metric: 'maxCombo',      target: 15 },
  { id: 'combo_30',       name: '甜蜜风暴',     desc: '达成 30 连击',          icon: '🌪️', metric: 'maxCombo',      target: 30 },

  // Endless / daily
  { id: 'endless_10',     name: '星空旅者',     desc: '无尽模式坚持到第 10 波',icon: '⭐', metric: 'maxEndlessWave', target: 10 },
  { id: 'endless_25',     name: '银河捍卫者',   desc: '无尽模式坚持到第 25 波',icon: '🌌', metric: 'maxEndlessWave', target: 25 },
  { id: 'endless_50',     name: '宇宙神话',     desc: '无尽模式坚持到第 50 波',icon: '🛸', metric: 'maxEndlessWave', target: 50 },
  { id: 'daily_done',     name: '每日打卡',     desc: '完成一次每日挑战',      icon: '📆', metric: 'dailyRuns',     target: 1 },
  { id: 'daily_streak_7', name: '连续打卡 7 天', desc: '每日挑战连续 7 天',     icon: '🔥', metric: 'dailyStreak',   target: 7 },

  // Polish achievements
  { id: 'perfect_clear',  name: '不破金身',     desc: '通关时生命满格',        icon: '💖', metric: 'perfectRuns',   target: 1 },
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
    dailyStreak: 0,        // mirrored from streak system on daily completion
    perfectRuns: 0,
    starsTotal: 0,         // mirrored from progress.stars on each campaign win
    masteredThemes: 0,     // count of themes with ≥25 ⭐ (mirrored on win)
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
  if (extra.dailyStreak && extra.dailyStreak > s.dailyStreak) {
    s.dailyStreak = extra.dailyStreak;
  }
  if (extra.starsTotal && extra.starsTotal > s.starsTotal) {
    s.starsTotal = extra.starsTotal;
  }
  if (extra.masteredThemes && extra.masteredThemes > s.masteredThemes) {
    s.masteredThemes = extra.masteredThemes;
  }

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
