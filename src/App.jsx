import { useState, useEffect, useCallback } from 'react';
import { LEVELS } from './game/constants.js';
import { play } from './game/sfx.js';
import MainMenu from './screens/MainMenu.jsx';
import LevelSelect from './screens/LevelSelect.jsx';
import Gameplay from './screens/Gameplay.jsx';
import Victory from './screens/Victory.jsx';
import Defeat from './screens/Defeat.jsx';
import Bestiary from './screens/Bestiary.jsx';

const PROGRESS_KEY = 'sweet-defense-progress-v1';

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
    setPlayToken(t => t + 1);
    setScreen('play');
  }, []);

  const handleWin = useCallback((s) => {
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
  }, [levelIdx]);

  const handleLose = useCallback((s) => {
    setStats(s);
    setScreen('defeat');
  }, []);

  if (screen === 'menu') {
    return <MainMenu onStart={() => setScreen('levels')} onBestiary={() => setScreen('bestiary')} />;
  }
  if (screen === 'levels') {
    return <LevelSelect progress={progress} onPick={startLevel} onBack={() => setScreen('menu')} />;
  }
  if (screen === 'play') {
    return (
      <Gameplay
        key={`${levelIdx}-${playToken}`}
        level={LEVELS[levelIdx]}
        onWin={handleWin}
        onLose={handleLose}
        onMenu={() => setScreen('levels')}
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
    return (
      <Defeat
        stats={stats}
        onRetry={() => startLevel(levelIdx)}
        onMenu={() => setScreen('levels')}
      />
    );
  }
  if (screen === 'bestiary') {
    return <Bestiary onBack={() => setScreen('menu')} />;
  }
  return null;
}
