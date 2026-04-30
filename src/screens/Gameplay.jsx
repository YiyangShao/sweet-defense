import { useState, useEffect, useRef } from 'react';
import { TOWER_DEFS, WALL_DEFS, T, COLS, ROWS } from '../game/constants.js';
import { inBounds } from '../game/path.js';
import { initWorld, upgradeCost, sellRefund, placeWall } from '../game/world.js';
import { update } from '../game/update.js';
import { play, isMuted, toggleMute } from '../game/sfx.js';
import { processEvents, loadAchievementState, saveAchievementState } from '../game/achievements.js';
import GameBoard from '../components/GameBoard.jsx';
import HUD from '../components/HUD.jsx';
import WavePreview from '../components/WavePreview.jsx';
import TowerShop from '../components/TowerShop.jsx';
import TowerDetailModal from '../components/TowerDetailModal.jsx';
import AchievementToast from '../components/AchievementToast.jsx';

export default function Gameplay({ level, onWin, onLose, onMenu }) {
  const worldRef = useRef(initWorld(level));
  const [, forceTick] = useState(0);
  const [muted, setMuted] = useState(isMuted());
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [toastUnlocks, setToastUnlocks] = useState([]);
  const achStateRef = useRef(loadAchievementState());
  const lastEventIdxRef = useRef(0);
  const onMute = () => setMuted(toggleMute());

  const w = worldRef.current;

  useEffect(() => {
    let raf;
    let last = performance.now();
    let stopped = false;

    const loop = (now) => {
      if (stopped) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      update(worldRef.current, dt);
      const ww = worldRef.current;

      // Drain new events for the achievement system.
      const evs = ww.events;
      if (evs.length > lastEventIdxRef.current) {
        const delta = evs.slice(lastEventIdxRef.current);
        lastEventIdxRef.current = evs.length;
        const unlocks = processEvents(delta, achStateRef.current, {
          fullHp: ww.finished === 'win' && ww.hp >= ww.level.startHp,
          endlessWave: ww.level.endless ? ww.waveIdx + 1 : 0,
          dailyDone: ww.level.daily && ww.finished ? true : false,
        });
        if (unlocks.length) {
          saveAchievementState(achStateRef.current);
          setToastUnlocks(prev => [...prev, ...unlocks].slice(-4));
        }
      }

      forceTick(t => (t + 1) & 0xffff);
      if (ww.finished === 'win') {
        stopped = true;
        onWin({ hp: ww.hp, killed: ww.enemiesKilled, earned: ww.sugarEarned, score: ww.score, bestCombo: ww.bestCombo });
        return;
      }
      if (ww.finished === 'lose') {
        stopped = true;
        onLose({ hp: 0, killed: ww.enemiesKilled, wave: ww.waveIdx + 1, score: ww.score, bestCombo: ww.bestCombo });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onWin, onLose]);

  useEffect(() => {
    const onKey = (e) => {
      const ww = worldRef.current;
      if (e.key === 'Escape') {
        ww.selectedTowerType = null;
        ww.selectedPlacedTower = null;
        ww.focus = null;
        forceTick(t => t + 1);
      }
      if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        e.preventDefault();
        ww.speed = ww.speed === 0 ? 1 : 0;
        forceTick(t => t + 1);
      }
      if (e.key === 'f' || e.key === 'F') {
        ww.speed = ww.speed === 2 ? 1 : 2;
        forceTick(t => t + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Convert browser mouse coords → SVG viewBox coords using the SVG's own
  // screen CTM. This is aspect-ratio-aware (handles letterboxing introduced
  // by preserveAspectRatio="xMidYMid meet"), unlike a plain getBoundingClientRect
  // ratio multiplication.
  const eventToCell = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    const gx = Math.floor(local.x / T);
    const gy = Math.floor(local.y / T);
    if (!inBounds(gx, gy)) return null;
    return { gx, gy };
  };

  const towerAt = (gx, gy) => w.towers.find(tw => tw.gx === gx && tw.gy === gy);
  const wallAt = (gx, gy) => w.walls.find(wl => wl.gx === gx && wl.gy === gy);
  const obstacleAt = (gx, gy) => w.obstacles.find(ob => ob.gx === gx && ob.gy === gy);

  const onMouseMove = (e) => setHover(eventToCell(e));
  const onMouseLeave = () => setHover(null);

  const onCellClick = (e) => {
    const c = eventToCell(e);
    if (!c) return;
    if (w.selectedTowerType === 'wall') {
      const def = WALL_DEFS.wall;
      if (!w.path.isPathCell(c.gx, c.gy) || wallAt(c.gx, c.gy)) {
        play('deny');
        return;
      }
      if (w.sugar < def.cost) {
        play('deny');
        return;
      }
      w.sugar -= def.cost;
      w.walls.push(placeWall(w, def, c.gx, c.gy));
      if (!e.shiftKey) w.selectedTowerType = null;
      w.events.push({ type: 'wall_placed', gx: c.gx, gy: c.gy });
      play('place');
      forceTick(t => t + 1);
      return;
    }
    if (w.selectedTowerType) {
      const def = TOWER_DEFS[w.selectedTowerType];
      if (w.path.isPathCell(c.gx, c.gy) || towerAt(c.gx, c.gy) || obstacleAt(c.gx, c.gy)) {
        play('deny');
        return;
      }
      if (w.sugar < def.cost) {
        play('deny');
        return;
      }
      w.sugar -= def.cost;
      w.towers.push({
        id: w.nextId++,
        type: w.selectedTowerType,
        gx: c.gx, gy: c.gy,
        level: 1,
        invested: def.cost,
        cooldown: 0,
        shootPulse: 0,
      });
      w.events.push({ type: 'tower_placed', tower_type: w.selectedTowerType, gx: c.gx, gy: c.gy });
      if (!e.shiftKey) w.selectedTowerType = null;
      play('place');
      forceTick(t => t + 1);
      return;
    }
    let dirty = false;
    if (w.selectedPlacedTower != null) { w.selectedPlacedTower = null; dirty = true; }
    if (w.focus != null) { w.focus = null; dirty = true; }
    if (dirty) forceTick(t => t + 1);
  };

  const onObstacleClick = (id) => {
    if (w.selectedTowerType) return; // ignore while placing
    if (w.focus && w.focus.kind === 'obstacle' && w.focus.id === id) {
      w.focus = null; // toggle off
    } else {
      w.focus = { kind: 'obstacle', id };
      play('click');
    }
    w.selectedPlacedTower = null;
    forceTick(t => t + 1);
  };

  const onEnemyClick = (id) => {
    if (w.selectedTowerType) return;
    if (w.focus && w.focus.kind === 'enemy' && w.focus.id === id) {
      w.focus = null;
    } else {
      w.focus = { kind: 'enemy', id };
      play('click');
    }
    w.selectedPlacedTower = null;
    forceTick(t => t + 1);
  };

  const onCellRightClick = (e) => {
    e.preventDefault();
    let dirty = false;
    if (w.selectedTowerType) { w.selectedTowerType = null; dirty = true; }
    if (w.focus) { w.focus = null; dirty = true; }
    if (dirty) forceTick(t => t + 1);
  };

  const onTowerClick = (id) => {
    if (w.selectedTowerType) return;
    w.selectedPlacedTower = id;
    forceTick(t => t + 1);
  };

  const onShopSelect = (type) => {
    w.selectedTowerType = w.selectedTowerType === type ? null : type;
    w.selectedPlacedTower = null;
    forceTick(t => t + 1);
  };

  const onPause = () => { w.speed = w.speed === 0 ? 1 : 0; forceTick(t => t + 1); };
  const onSpeed = () => { w.speed = w.speed === 2 ? 1 : 2; forceTick(t => t + 1); };
  const onEarlyStart = () => {
    if (w.waveState === 'preparing' && w.waveTimer < 0) {
      w.sugar += 5;
      w.sugarEarned += 5;
      w.waveTimer = 0;
      forceTick(t => t + 1);
    }
  };

  const onUpgrade = () => {
    const tw = w.towers.find(t => t.id === w.selectedPlacedTower);
    if (!tw) return;
    const cost = upgradeCost(tw);
    if (cost == null || w.sugar < cost) { play('deny'); return; }
    w.sugar -= cost;
    tw.level += 1;
    tw.invested += cost;
    w.events.push({ type: 'tower_upgraded', tower_type: tw.type, new_level: tw.level });
    play('upgrade');
    forceTick(t => t + 1);
  };

  const onSell = () => {
    const tw = w.towers.find(t => t.id === w.selectedPlacedTower);
    if (!tw) return;
    w.sugar += sellRefund(tw);
    w.events.push({ type: 'tower_sold', tower_type: tw.type });
    w.towers = w.towers.filter(t => t.id !== tw.id);
    w.selectedPlacedTower = null;
    play('sell');
    forceTick(t => t + 1);
  };

  const onCloseModal = () => {
    w.selectedPlacedTower = null;
    forceTick(t => t + 1);
  };

  const ghost = (() => {
    if (!w.selectedTowerType || !hover) return null;
    if (w.selectedTowerType === 'wall') {
      const valid = w.path.isPathCell(hover.gx, hover.gy)
        && !wallAt(hover.gx, hover.gy)
        && w.sugar >= WALL_DEFS.wall.cost;
      return { kind: 'wall', type: 'wall', gx: hover.gx, gy: hover.gy, valid };
    }
    const valid = !w.path.isPathCell(hover.gx, hover.gy)
      && !towerAt(hover.gx, hover.gy)
      && !obstacleAt(hover.gx, hover.gy)
      && w.sugar >= TOWER_DEFS[w.selectedTowerType].cost;
    return { kind: 'tower', type: w.selectedTowerType, gx: hover.gx, gy: hover.gy, valid };
  })();

  const selectedTw = w.selectedPlacedTower != null ? w.towers.find(t => t.id === w.selectedPlacedTower) : null;

  return (
    <div className="full" style={{ position: 'relative', overflow: 'hidden', background: level.bgPrimary }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <GameBoard
          world={w}
          ghost={ghost}
          theme={level}
          svgRef={svgRef}
          onCellClick={onCellClick}
          onCellRightClick={onCellRightClick}
          onTowerClick={onTowerClick}
          onObstacleClick={onObstacleClick}
          onEnemyClick={onEnemyClick}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
      </div>
      <HUD world={w} totalWaves={level.waves.length} onPause={onPause} onSpeed={onSpeed} onMenu={onMenu} muted={muted} onMute={onMute} />
      <WavePreview world={w} onEarlyStart={onEarlyStart} />
      <TowerShop
        selected={w.selectedTowerType}
        sugar={w.sugar}
        onSelect={onShopSelect}
        availableTowers={level.availableTowers}
      />
      {selectedTw && (
        <TowerDetailModal
          tower={selectedTw}
          world={w}
          sugar={w.sugar}
          onUpgrade={onUpgrade}
          onSell={onSell}
          onClose={onCloseModal}
        />
      )}
      {w.speed === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(40,28,24,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7, pointerEvents: 'none' }}>
          <div className="font-display" style={{ fontSize: 88, color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>⏸ 暂停</div>
        </div>
      )}
      <AchievementToast unlocks={toastUnlocks} onDismiss={() => setToastUnlocks([])} />
    </div>
  );
}
