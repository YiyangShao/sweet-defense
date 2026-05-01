import { useState, useEffect, useCallback } from 'react';
import { LEVELS } from './game/constants.js';
import { makeEndlessLevel, makeDailyLevel } from './game/modes.js';
import { dailySeed } from './game/rng.js';
import { play } from './game/sfx.js';
import MainMenu from './screens/MainMenu.jsx';
import LevelSelect from './screens/LevelSelect.jsx';
import Gameplay from './screens/Gameplay.jsx';
import Victory from './screens/Victory.jsx';
import Defeat from './screens/Defeat.jsx';
import Bestiary from './screens/Bestiary.jsx';
import Achievements from './screens/Achievements.jsx';
import { loadAchievementState } from './game/achievements.js';

// v2 introduced 60-level grid (vs old 6) — old saves are not migrated.
const PROGRESS_KEY = 'sweet-defense-progress-v2';
const ENDLESS_BEST_KEY = 'sd-endless-best-v1';
const DAILY_BEST_KEY = 'sd-daily-best-v1';
const DAILY_STREAK_KEY = 'sd-daily-streak-v1';

function loadEndlessBest() {
  try { return parseInt(localStorage.getItem(ENDLESS_BEST_KEY) || '0', 10) || 0; } catch { return 0; }
}
function saveEndlessBest(score) {
  try { localStorage.setItem(ENDLESS_BEST_KEY, String(score)); } catch {}
}
function loadDailyScores() {
  try { return JSON.parse(localStorage.getItem(DAILY_BEST_KEY) || '{}'); } catch { return {}; }
}
function saveDailyScore(seed, score) {
  try {
    const scores = loadDailyScores();
    if (!scores[seed] || score > scores[seed]) {
      scores[seed] = score;
      localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(scores));
    }
  } catch {}
}

// Local-date string (YYYY-M-D); used as the "have I played today" key.
function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function loadDailyStreak() {
  try {
    const raw = localStorage.getItem(DAILY_STREAK_KEY);
    if (!raw) return { count: 0, lastDate: null };
    const parsed = JSON.parse(raw);
    return { count: parsed.count || 0, lastDate: parsed.lastDate || null };
  } catch { return { count: 0, lastDate: null }; }
}
// Bump streak on daily completion. Same-day repeats don't double-count;
// missing yesterday resets back to 1.
function bumpDailyStreak() {
  const cur = loadDailyStreak();
  const today = new Date();
  const todayK = dateKey(today);
  if (cur.lastDate === todayK) return cur;
  const yesterdayK = dateKey(new Date(today.getTime() - 86400000));
  const next = {
    count: cur.lastDate === yesterdayK ? cur.count + 1 : 1,
    lastDate: todayK,
  };
  try { localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { stars: {}, unlocked: 1 };
}

function saveProgress(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}

function computeStars(hp, startHp) {
  const pct = hp / startHp;
  if (pct >= 0.85) return 3;
  if (pct >= 0.5) return 2;
  return 1;
}

// Theme-mastery: 25 of 30 stars in a theme unlocks the golden tower skin.
// Returns Set<themeId>.
function masteredThemesFromProgress(progress) {
  const out = new Set();
  for (let t = 1; t <= 6; t++) {
    let sum = 0;
    for (let s = 1; s <= 10; s++) {
      const idx = (t - 1) * 10 + (s - 1);
      sum += progress.stars?.[idx] || 0;
    }
    if (sum >= 25) out.add(t);
  }
  return out;
}

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [stats, setStats] = useState(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [progress, setProgress] = useState(loadProgress);
  const [playToken, setPlayToken] = useState(0); // bumps to remount Gameplay on retry
  const [activeLevel, setActiveLevel] = useState(null); // for endless/daily transient levels
  const [dailyStreak, setDailyStreak] = useState(() => loadDailyStreak());

  // Global UI click sound for any .bubble-btn or .shop-card.
  // Fires after React's onClick (native bubble), so the action runs first.
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('button.bubble-btn, .shop-card');
      if (el && !el.classList.contains('disabled') && !el.disabled) {
        play('click');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const startLevel = useCallback((i) => {
    setLevelIdx(i);
    setActiveLevel(null);
    setPlayToken(t => t + 1);
    setScreen('play');
  }, []);

  const startEndless = useCallback(() => {
    setActiveLevel(makeEndlessLevel());
    setPlayToken(t => t + 1);
    setScreen('play');
  }, []);

  const startDaily = useCallback(() => {
    setActiveLevel(makeDailyLevel());
    setPlayToken(t => t + 1);
    setScreen('play');
  }, []);

  const handleWin = useCallback((s) => {
    if (activeLevel) {
      // Endless or daily — there is no "win"; this only fires if endless somehow exhausts
      // (it shouldn't because waves are infinite). Treat as defeat with score.
      const next = { ...s, score: s.score, mode: activeLevel.endless ? 'endless' : 'daily' };
      if (activeLevel.daily) {
        saveDailyScore(activeLevel.seed, s.score);
        const streak = bumpDailyStreak();
        setDailyStreak(streak);
        next.streak = streak.count;
        next.dailyCompleted = true;
      }
      setStats(next);
      setScreen('defeat');
      return;
    }
    const lvl = LEVELS[levelIdx];
    const stars = computeStars(s.hp, lvl.startHp);
    let masteryUnlocked = false;
    setProgress(prev => {
      const next = {
        ...prev,
        stars: { ...prev.stars, [levelIdx]: Math.max(prev.stars[levelIdx] || 0, stars) },
        unlocked: Math.max(prev.unlocked || 1, levelIdx + 2),
      };
      saveProgress(next);
      // Detect first-time mastery on this win.
      const before = masteredThemesFromProgress(prev);
      const after = masteredThemesFromProgress(next);
      if (lvl.themeId && !before.has(lvl.themeId) && after.has(lvl.themeId)) {
        masteryUnlocked = true;
      }
      return next;
    });
    setStats({ ...s, stars, masteryUnlocked, themeName: lvl.name?.split(' · ')[0] });
    setScreen('victory');
  }, [levelIdx, activeLevel]);

  const handleLose = useCallback((s) => {
    if (activeLevel && activeLevel.endless) {
      const best = loadEndlessBest();
      const beat = s.score > best;
      if (beat) saveEndlessBest(s.score);
      setStats({ ...s, mode: 'endless', best: Math.max(best, s.score), beat });
    } else if (activeLevel && activeLevel.daily) {
      saveDailyScore(activeLevel.seed, s.score);
      setStats({ ...s, mode: 'daily', seed: activeLevel.seed });
    } else {
      setStats(s);
    }
    setScreen('defeat');
  }, [activeLevel]);

  if (screen === 'menu') {
    return <MainMenu
      onStart={() => setScreen('levels')}
      onBestiary={() => setScreen('bestiary')}
      onAchievements={() => setScreen('achievements')}
      onEndless={startEndless}
      onDaily={startDaily}
      dailyStreak={dailyStreak}
    />;
  }
  if (screen === 'achievements') {
    return <Achievements achState={loadAchievementState()} onBack={() => setScreen('menu')} />;
  }
  if (screen === 'levels') {
    return <LevelSelect progress={progress} onPick={startLevel} onBack={() => setScreen('menu')} />;
  }
  if (screen === 'play') {
    const lvl = activeLevel || LEVELS[levelIdx];
    const masteredThemes = masteredThemesFromProgress(progress);
    const themeMastered = lvl.themeId ? masteredThemes.has(lvl.themeId) : false;
    return (
      <Gameplay
        key={`${activeLevel ? activeLevel.id : levelIdx}-${playToken}`}
        level={lvl}
        themeMastered={themeMastered}
        onWin={handleWin}
        onLose={handleLose}
        onMenu={() => setScreen(activeLevel ? 'menu' : 'levels')}
      />
    );
  }
  if (screen === 'victory') {
    const hasNext = levelIdx + 1 < LEVELS.length;
    return (
      <Victory
        stats={stats}
        hasNext={hasNext}
        onRetry={() => startLevel(levelIdx)}
        onNext={() => startLevel(levelIdx + 1)}
        onMenu={() => setScreen('levels')}
      />
    );
  }
  if (screen === 'defeat') {
    const isMode = stats && (stats.mode === 'endless' || stats.mode === 'daily');
    return (
      <Defeat
        stats={stats}
        onRetry={() => {
          if (stats?.mode === 'endless') startEndless();
          else if (stats?.mode === 'daily') startDaily();
          else startLevel(levelIdx);
        }}
        onMenu={() => setScreen(isMode ? 'menu' : 'levels')}
      />
    );
  }
  if (screen === 'bestiary') {
    return <Bestiary onBack={() => setScreen('menu')} />;
  }
  return null;
}
