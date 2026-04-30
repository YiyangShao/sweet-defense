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

const PROGRESS_KEY = 'sweet-defense-progress-v1';
const ENDLESS_BEST_KEY = 'sd-endless-best-v1';
const DAILY_BEST_KEY = 'sd-daily-best-v1';

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

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [stats, setStats] = useState(null);
  const [levelIdx, setLevelIdx] = useState(0);
  const [progress, setProgress] = useState(loadProgress);
  const [playToken, setPlayToken] = useState(0); // bumps to remount Gameplay on retry
  const [activeLevel, setActiveLevel] = useState(null); // for endless/daily transient levels
  const endlessUnlocked = (progress.unlocked || 1) >= 6 || (progress.stars || {})[5] > 0;

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
      setStats({ ...s, score: s.score, mode: activeLevel.endless ? 'endless' : 'daily' });
      setScreen('defeat');
      return;
    }
    const lvl = LEVELS[levelIdx];
    const stars = computeStars(s.hp, lvl.startHp);
    setProgress(prev => {
      const next = {
        ...prev,
        stars: { ...prev.stars, [levelIdx]: Math.max(prev.stars[levelIdx] || 0, stars) },
        unlocked: Math.max(prev.unlocked || 1, levelIdx + 2),
      };
      saveProgress(next);
      return next;
    });
    setStats({ ...s, stars });
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
      endlessUnlocked={endlessUnlocked}
    />;
  }
  if (screen === 'achievements') {
    return <Achievements achState={loadAchievementState()} onBack={() => setScreen('menu')} />;
  }
  if (screen === 'levels') {
    return <LevelSelect progress={progress} onPick={startLevel} onBack={() => setScreen('menu')} />;
  }
  if (screen === 'play') {
    return (
      <Gameplay
        key={`${activeLevel ? activeLevel.id : levelIdx}-${playToken}`}
        level={activeLevel || LEVELS[levelIdx]}
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
