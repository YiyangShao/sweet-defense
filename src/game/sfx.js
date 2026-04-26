// Tiny WebAudio-synthesized SFX. No assets, ~120 lines.

let ctx = null;
let masterGain = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

let muted = (() => {
  try { return localStorage.getItem('sd-muted') === '1'; } catch { return false; }
})();

export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('sd-muted', muted ? '1' : '0'); } catch {}
  return muted;
}

function tone({ freq, freq2, type = 'sine', dur = 0.08, gain = 0.18, attack = 0.005, release = 0.05 }) {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freq2 != null) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq2), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + release);
  osc.connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + release + 0.05);
}

function noise({ dur = 0.05, gain = 0.10, hp = 2000 }) {
  const c = getCtx();
  if (!c || muted) return;
  const buf = c.createBuffer(1, Math.max(64, c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.value = hp;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(filt).connect(g).connect(masterGain);
  src.start();
}

const SFX = {
  shoot:      () => tone({ freq: 980, freq2: 380, type: 'square', dur: 0.05, gain: 0.06 }),
  shootHeavy: () => { tone({ freq: 240, freq2: 80, type: 'sawtooth', dur: 0.10, gain: 0.14 }); noise({ dur: 0.05, gain: 0.06, hp: 800 }); },
  shootSnipe: () => tone({ freq: 1400, freq2: 600, type: 'triangle', dur: 0.08, gain: 0.10 }),
  hit:        () => noise({ dur: 0.05, gain: 0.10, hp: 2400 }),
  splash:     () => { noise({ dur: 0.10, gain: 0.10, hp: 600 }); tone({ freq: 200, freq2: 60, type: 'sawtooth', dur: 0.10, gain: 0.10 }); },
  kill:       () => { tone({ freq: 700, freq2: 220, type: 'triangle', dur: 0.10, gain: 0.10 }); noise({ dur: 0.04, gain: 0.06 }); },
  killBoss:   () => { [0, 80, 180].forEach((d, i) => setTimeout(() => tone({ freq: [600, 400, 240][i], freq2: [200, 120, 80][i], type: 'sawtooth', dur: 0.18, gain: 0.16 }), d)); },
  place:      () => tone({ freq: 600, freq2: 880, type: 'sine', dur: 0.10, gain: 0.14 }),
  upgrade:    () => [0, 90].forEach((d, i) => setTimeout(() => tone({ freq: [880, 1320][i], type: 'triangle', dur: 0.10, gain: 0.14 }), d)),
  sell:       () => tone({ freq: 720, freq2: 460, type: 'triangle', dur: 0.08, gain: 0.12 }),
  click:      () => tone({ freq: 1100, type: 'square', dur: 0.018, gain: 0.045 }),
  deny:       () => tone({ freq: 240, freq2: 160, type: 'sawtooth', dur: 0.10, gain: 0.10 }),
  wave:       () => { tone({ freq: 440, freq2: 660, type: 'triangle', dur: 0.14, gain: 0.16 }); setTimeout(() => tone({ freq: 660, freq2: 880, type: 'triangle', dur: 0.14, gain: 0.16 }), 110); },
  win:        () => [0, 180, 360, 560].forEach((d, i) => setTimeout(() => tone({ freq: [523, 659, 784, 1047][i], type: 'triangle', dur: 0.18, gain: 0.18 }), d)),
  lose:       () => [0, 180, 380].forEach((d, i) => setTimeout(() => tone({ freq: [400, 320, 240][i], type: 'triangle', dur: 0.20, gain: 0.16 }), d)),
  coin:       () => tone({ freq: 1500, freq2: 1100, type: 'triangle', dur: 0.05, gain: 0.08 }),
};

export function play(name) {
  const fn = SFX[name];
  if (fn) {
    try { fn(); } catch {}
  }
}

// Map tower type → shoot sound
export function shootSoundFor(type) {
  if (type === 'cake' || type === 'donut') return 'shootHeavy';
  if (type === 'macaron') return 'shootSnipe';
  return 'shoot';
}
