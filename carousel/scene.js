/*
 * «Историческая карусель» — Ленинградский вокзал (Москва).
 * Процедурная low-poly модель здания К. Тона, перрона и поездов по эпохам.
 * Three.js r160 подключён локально из ./vendor.
 */
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';

/* ------------------------------------------------------------------ */
/* Данные эпох                                                          */
/* ------------------------------------------------------------------ */
const ERAS = [
  {
    year: '1851', label: '1851',
    title: 'Петербургский вокзал',
    text: 'Вокзал открыт в 1851 году по проекту архитектора Константина Тона — это первый вокзал Москвы. К перрону подходят паровоз с высокой трубой и деревянные вагоны.',
    desc: 'тёплая сепия, паровоз с высокой трубой и деревянные вагоны у перрона, масляные фонари на площади',
    train: 'steam51',
    filter: 'sepia(0.82) saturate(0.85) contrast(1.03) brightness(1.02)',
    vignette: 0.55,
    fb: { sky: '#e6d3ad', wall: '#c4a275', wall2: '#b08c60', glow: '#5a4630' },
    look: {
      skyTop: '#9fb0bd', skyHorizon: '#f1dcb4', skyBottom: '#cbb894', fog: '#e8d6b2', fogNear: 70, fogFar: 300,
      sun: '#ffd9a8', sunInt: 2.7, sunAz: 0.55, sunEl: 0.55,
      hemiSky: '#f4e4c6', hemiGround: '#6d5a40', hemiInt: 1.0,
      ground: '#8f7d60', paving: '#ab9877',
      wallA: '#d4b07c', wallB: '#c49d6c', trim: '#efe4cc', plinth: '#8f8676', roof: '#5e5a52',
      city: '#bba98a', winGlow: '#ffcf8a', win: 0.12, lampColor: '#ffc070', lamp: 0.8, halo: 0.25,
      facade: 0, exposure: 1.0, seams: 0, sunGlow: 0.6,
    },
    feat: { gas: 1 },
  },
  {
    year: '1855', label: '1855',
    title: 'Николаевский вокзал',
    text: 'Вокзал переименован в Николаевский — в честь императора Николая I. На площади перед зданием — фонари и конные экипажи.',
    desc: 'светлая сепия, конные экипажи и фонари на площади, паровоз с деревянными вагонами',
    train: 'steam55',
    filter: 'sepia(0.55) saturate(0.9) contrast(1.02)',
    vignette: 0.42,
    fb: { sky: '#ece0c6', wall: '#cdae80', wall2: '#ba9767', glow: '#4f4234' },
    look: {
      skyTop: '#a9bccb', skyHorizon: '#f2e4c6', skyBottom: '#d3c4a6', fog: '#ece0c4', fogNear: 90, fogFar: 350,
      sun: '#ffe2b8', sunInt: 2.9, sunAz: 0.75, sunEl: 0.68,
      hemiSky: '#f4e8d0', hemiGround: '#6f5e46', hemiInt: 1.05,
      ground: '#94846a', paving: '#b3a283',
      wallA: '#d8b887', wallB: '#c7a273', trim: '#f1e8d4', plinth: '#958c7c', roof: '#5b5852',
      city: '#c2b394', winGlow: '#ffcf8a', win: 0.1, lampColor: '#ffc070', lamp: 0.7, halo: 0.2,
      facade: 0, exposure: 1.02, seams: 0, sunGlow: 0.5,
    },
    feat: { gas: 1, carriages: 1 },
  },
  {
    year: '1923–1924', label: '1923',
    title: 'Октябрьский → Ленинградский',
    text: 'В 1923 году вокзал переименован в Октябрьский, а затем — в Ленинградский. Это имя он носит до сих пор.',
    desc: 'приглушённые цвета 1920–30-х годов, пасмурное небо, чёрный советский паровоз с красной звездой',
    train: 'soviet',
    filter: 'sepia(0.28) saturate(0.6) contrast(0.98)',
    vignette: 0.35,
    fb: { sky: '#d3d0c6', wall: '#ac9f86', wall2: '#9b8b72', glow: '#3d3a35' },
    look: {
      skyTop: '#8e979e', skyHorizon: '#cfcbc0', skyBottom: '#a8a396', fog: '#c6c2b6', fogNear: 60, fogFar: 270,
      sun: '#efe7da', sunInt: 1.7, sunAz: 0.95, sunEl: 0.85,
      hemiSky: '#d8d6cf', hemiGround: '#5b564c', hemiInt: 1.45,
      ground: '#6f6a5f', paving: '#8d877b',
      wallA: '#b4a68c', wallB: '#a29177', trim: '#d8d1c1', plinth: '#7c776e', roof: '#4a4a46',
      city: '#9b978c', winGlow: '#ffd9a0', win: 0.08, lampColor: '#ffcf8a', lamp: 0.45, halo: 0.12,
      facade: 0, exposure: 1.0, seams: 0, sunGlow: 0.0,
    },
    feat: { gas: 1 },
  },
  {
    year: '1949', label: '1949',
    title: 'Реставрация интерьеров',
    text: 'Интерьеры вокзала реставрированы по проекту архитектора Алексея Душкина. Наступает время электрического света.',
    desc: 'цвета середины века, ясное небо, зелёный паровоз и вагоны, электрические фонари-шары',
    train: 'p36',
    filter: 'sepia(0.12) saturate(0.85) contrast(1.02)',
    vignette: 0.2,
    fb: { sky: '#d6e0e8', wall: '#d6b373', wall2: '#c39e5f', glow: '#3e3a33' },
    look: {
      skyTop: '#6d97c4', skyHorizon: '#eadfc6', skyBottom: '#c9bfa8', fog: '#e0d8c4', fogNear: 80, fogFar: 320,
      sun: '#fff1d6', sunInt: 3.0, sunAz: 0.45, sunEl: 0.62,
      hemiSky: '#e9eef2', hemiGround: '#6b6250', hemiInt: 1.1,
      ground: '#77736a', paving: '#a49c8e',
      wallA: '#dcb978', wallB: '#cfa766', trim: '#f3ead6', plinth: '#8a857c', roof: '#5d6a60',
      city: '#b8b2a3', winGlow: '#fff0c8', win: 0.12, lampColor: '#fff3d8', lamp: 0.6, halo: 0.18,
      facade: 0, exposure: 1.0, seams: 0, sunGlow: 0.4,
    },
    feat: { electric: 1, trees: 1 },
  },
  {
    year: '2009', label: '2009',
    title: '«Сапсан»',
    text: 'В декабре 2009 года начал курсировать скоростной поезд «Сапсан». В 2008–2013 годах шла реконструкция «Наземное метро».',
    desc: 'современный дневной свет, бело-серый обтекаемый поезд «Сапсан» с красными акцентами, контактная сеть над путями',
    train: 'sapsan',
    filter: 'sepia(0) saturate(1.04) contrast(1.02)',
    vignette: 0.0,
    fb: { sky: '#cfe0ee', wall: '#e0c48a', wall2: '#d4b67a', glow: '#33404c' },
    look: {
      skyTop: '#3b74c0', skyHorizon: '#d6e6f2', skyBottom: '#9aa7ae', fog: '#cddcea', fogNear: 110, fogFar: 400,
      sun: '#fffaf0', sunInt: 3.4, sunAz: 0.3, sunEl: 0.85,
      hemiSky: '#dfeaf5', hemiGround: '#5d5a52', hemiInt: 1.15,
      ground: '#5f6266', paving: '#a8a7a3',
      wallA: '#e4c98f', wallB: '#dcbd80', trim: '#f7f2e6', plinth: '#8c8a86', roof: '#5f6669',
      city: '#aab4bd', winGlow: '#fff4e0', win: 0.04, lampColor: '#f2f6ff', lamp: 0.0, halo: 0.0,
      facade: 0, exposure: 1.0, seams: 0, sunGlow: 0.35,
    },
    feat: { modern: 1, trees: 1, catenary: 1 },
  },
  {
    year: '2026', label: '2026',
    title: 'Реконструкция',
    text: 'Закрытый 11 августа 2024 года вокзал вновь открылся 22 мая 2026-го. Фасад восстановлен по снимку 1873 года, на башню вернули флагшток, над платформами — стеклянный дебаркадер площадью более 6,9 тыс. м².',
    desc: 'вечерние сумерки, тёплая подсветка фасада и фонари, двухцветный фасад с белыми швами, флагшток на башне, стеклянный навес над платформами и «Сапсан»',
    train: 'sapsan',
    filter: 'sepia(0) saturate(1.06) contrast(1.03)',
    vignette: 0.3,
    fb: { sky: '#3a3f63', wall: '#d9bd90', wall2: '#b4835a', glow: '#ffbf73' },
    look: {
      skyTop: '#1b2c5c', skyHorizon: '#f09a68', skyBottom: '#3a3240', fog: '#7a6478', fogNear: 70, fogFar: 320,
      sun: '#ff9b5e', sunInt: 0.9, sunAz: -2.2, sunEl: 0.07,
      hemiSky: '#7488c0', hemiGround: '#40332e', hemiInt: 1.35,
      ground: '#4a4950', paving: '#7d746b',
      wallA: '#dcc196', wallB: '#b98a5e', trim: '#f6efe0', plinth: '#7f786f', roof: '#3f4a4a',
      city: '#3a3848', winGlow: '#ffb35c', win: 0.9, lampColor: '#ffb45a', lamp: 3.2, halo: 0.95,
      facade: 1, exposure: 1.25, seams: 1, sunGlow: 1.0,
    },
    feat: { gas: 1, canopy: 1, flag: 1, catenary: 1, trees: 1 },
  },
];
const N = ERAS.length;
const FEATS = ['gas', 'carriages', 'electric', 'modern', 'canopy', 'flag', 'catenary', 'trees'];
const COLOR_KEYS = ['skyTop', 'skyHorizon', 'skyBottom', 'fog', 'sun', 'hemiSky', 'hemiGround', 'ground', 'paving',
  'wallA', 'wallB', 'trim', 'plinth', 'roof', 'city', 'winGlow', 'lampColor'];
const NUM_KEYS = ['fogNear', 'fogFar', 'sunInt', 'sunAz', 'sunEl', 'hemiInt', 'win', 'lamp', 'halo', 'facade',
  'exposure', 'seams', 'sunGlow'];

/* ------------------------------------------------------------------ */
/* UI карусели (работает и без WebGL)                                   */
/* ------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const canvas = $('scene');
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches;

const AUTOPLAY_MS = 7000;
const HOLD_MS = 15000;
const ui = {
  idx: 0,
  userPaused: reduce,
  holdUntil: 0,
  hoverHold: false,
  focusHold: false,
  elapsed: 0,
  last: performance.now(),
};
let world = null; // 3D-сцена, если WebGL доступен

const timeline = $('timeline');
const yearBtns = ERAS.map((e, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'year-btn';
  b.textContent = e.label;
  b.setAttribute('aria-label', `${e.year} — ${e.title}`);
  b.addEventListener('click', () => { interact(); goTo(i, { user: true }); });
  li.appendChild(b);
  timeline.appendChild(li);
  return b;
});
$('eraTotal').textContent = String(N);

function canvasLabel(e) {
  return `Трёхмерная модель Ленинградского вокзала, ${e.year}: ${e.title}. На сцене: ${e.desc}.`;
}

function goTo(i, { user = false, instant = false } = {}) {
  i = ((i % N) + N) % N;
  const changed = i !== ui.idx;
  ui.idx = i;
  ui.elapsed = 0;
  const e = ERAS[i];
  const card = $('card');
  $('eraNum').textContent = String(i + 1);
  $('eraYear').textContent = e.year;
  $('eraTitle').textContent = e.title;
  $('eraText').textContent = e.text;
  if (changed && !reduce) {
    card.classList.remove('is-changing');
    void card.offsetWidth; // перезапуск анимации
    card.classList.add('is-changing');
  }
  yearBtns.forEach((b, k) => {
    if (k === i) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
  scrollTimelineTo(yearBtns[i]);
  stage.dataset.era = String(i);
  stage.style.setProperty('--vignette', String(e.vignette));
  canvas.style.filter = e.filter;
  canvas.setAttribute('aria-label', canvasLabel(e));
  const fbs = stage.style;
  fbs.setProperty('--fb-sky', e.fb.sky);
  fbs.setProperty('--fb-wall', e.fb.wall);
  fbs.setProperty('--fb-wall2', e.fb.wall2);
  fbs.setProperty('--fb-glow', e.fb.glow);
  // объявляем смену только по действию пользователя, чтобы автопрокрутка не «болтала»
  if (user) $('announcer').textContent = `${e.year}. ${e.title}. ${e.text}`;
  if (world) world.setEra(i, instant || reduce);
}

function scrollTimelineTo(btn) {
  const wrap = timeline.parentElement;
  const left = btn.offsetLeft - (wrap.clientWidth - btn.offsetWidth) / 2;
  wrap.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
}

function interact() { ui.holdUntil = performance.now() + HOLD_MS; }

function setPaused(p) {
  ui.userPaused = p;
  const b = $('playBtn');
  b.classList.toggle('is-paused', p);
  b.setAttribute('aria-label', p ? 'Запустить автопрокрутку эпох' : 'Остановить автопрокрутку эпох');
  ui.elapsed = 0;
}

$('prevBtn').addEventListener('click', () => { interact(); goTo(ui.idx - 1, { user: true }); });
$('nextBtn').addEventListener('click', () => { interact(); goTo(ui.idx + 1, { user: true }); });
$('playBtn').addEventListener('click', () => { setPaused(!ui.userPaused); ui.holdUntil = 0; });

document.addEventListener('keydown', (ev) => {
  if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
  const t = ev.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  let handled = true;
  if (ev.key === 'ArrowRight') goTo(ui.idx + 1, { user: true });
  else if (ev.key === 'ArrowLeft') goTo(ui.idx - 1, { user: true });
  else if (ev.key === 'Home') goTo(0, { user: true });
  else if (ev.key === 'End') goTo(N - 1, { user: true });
  else handled = false;
  if (handled) { ev.preventDefault(); interact(); }
});

const panel = $('panel');
panel.addEventListener('pointerenter', () => { ui.hoverHold = true; });
panel.addEventListener('pointerleave', () => { ui.hoverHold = false; interact(); });
panel.addEventListener('focusin', () => { ui.focusHold = true; });
panel.addEventListener('focusout', (ev) => {
  if (!panel.contains(ev.relatedTarget)) { ui.focusHold = false; interact(); }
});

const progressBar = $('progressBar');
function uiTick(now) {
  const dt = Math.min(now - ui.last, 1000);
  ui.last = now;
  const holding = ui.userPaused || reduce || ui.hoverHold || ui.focusHold || now < ui.holdUntil || document.hidden;
  if (!holding) {
    ui.elapsed += dt;
    if (ui.elapsed >= AUTOPLAY_MS) goTo(ui.idx + 1);
  }
  progressBar.style.transform = `scaleX(${holding ? 0 : Math.min(ui.elapsed / AUTOPLAY_MS, 1)})`;
  requestAnimationFrame(uiTick);
}

reduceMQ.addEventListener('change', (e) => {
  reduce = e.matches;
  if (reduce) setPaused(true);
  if (world) world.setReduce(reduce);
});

/* ------------------------------------------------------------------ */
/* Геометрия: утилиты                                                   */
/* ------------------------------------------------------------------ */
const _o = new THREE.Object3D();
function place(geo, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _o.position.set(x, y, z);
  _o.rotation.set(rx, ry, rz, 'YXZ');
  _o.scale.set(sx, sy, sz);
  _o.updateMatrix();
  const g = geo.clone();
  g.applyMatrix4(_o.matrix);
  return g;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
const cylZ = (r, len, s = 16) => new THREE.CylinderGeometry(r, r, len, s).rotateX(Math.PI / 2);
const wheel = (r, t = 0.14) => new THREE.CylinderGeometry(r, r, t, 14).rotateZ(Math.PI / 2);
const sphere = (r, w = 16, h = 10) => new THREE.SphereGeometry(r, w, h);

function merge(list) {
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.computeBoundingSphere();
  return out;
}

/** Собирает геометрию по материалам и сливает в несколько мешей. */
class Batch {
  constructor() { this.m = new Map(); }
  add(key, geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    g.deleteAttribute('uv');
    if (!this.m.has(key)) this.m.set(key, []);
    this.m.get(key).push(g);
    return this;
  }
  /** Элемент на плоскости фасада: u — вдоль фасада, v — высота, d — от стены наружу. */
  face(key, geo, f, u, v, d) {
    const c = Math.cos(f.ry), s = Math.sin(f.ry);
    return this.add(key, place(geo, f.x + u * c + d * s, v, f.z - u * s + d * c, f.ry));
  }
  build(mats, { cast = true, receive = true, skipShadow = [] } = {}) {
    const grp = new THREE.Group();
    for (const [key, list] of this.m) {
      const mesh = new THREE.Mesh(merge(list), mats[key]);
      mesh.castShadow = cast && !skipShadow.includes(key);
      mesh.receiveShadow = receive;
      mesh.name = key;
      grp.add(mesh);
    }
    return grp;
  }
}

function archShape(w, h) {
  const r = w / 2;
  const s = new THREE.Shape();
  s.moveTo(-r, 0);
  s.lineTo(r, 0);
  s.lineTo(r, h - r);
  s.absarc(0, h - r, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  return s;
}
function starShape(R, r) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return s;
}

function std(color, rough = 0.85, metal = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}

/* Детерминированный ГПСЧ для «города» */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ------------------------------------------------------------------ */
/* 3D-мир                                                               */
/* ------------------------------------------------------------------ */
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

function createWorld() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe8d6b2, 80, 330);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 1600);
  const TARGET = new THREE.Vector3(6, 6.5, -5);

  /* ---------- Материалы ---------- */
  const M = {
    wallA: std('#d4b07c', 0.9),
    wallB: std('#c49d6c', 0.9),
    trim: std('#efe4cc', 0.8),
    plinth: std('#8f8676', 0.95),
    roof: std('#5e5a52', 0.7, 0.2),
    glass: std('#2e3a44', 0.3, 0.3, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.1 }),
    door: std('#3b2a1e', 0.6, 0.0, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.05 }),
    dark: std('#2b2a28', 0.6, 0.3),
    gold: std('#c9a24a', 0.35, 0.75),
    clockFace: std('#f4eedf', 0.6, 0, { emissive: new THREE.Color('#fff1cf'), emissiveIntensity: 0 }),
    seams: std('#ffffff', 0.9, 0, { transparent: true, opacity: 0 }),
    ground: std('#8f7d60', 1),
    paving: std('#ab9877', 0.95),
    platform: std('#9b958a', 0.95),
    edge: std('#e9e3d2', 0.8),
    ballast: std('#5a5249', 1),
    rail: std('#7a7a7a', 0.4, 0.8),
    sleeper: std('#4a3b2e', 1),
    city: std('#bba98a', 1),
    tree: std('#55703f', 0.95),
    trunk: std('#5a4632', 1),
    lampGlass: std('#fff1d0', 0.4, 0, { emissive: new THREE.Color('#ffc070'), emissiveIntensity: 0.8 }),
    iron: std('#26262a', 0.55, 0.5),
    steel: std('#8b949c', 0.45, 0.7),
    canopyGlass: new THREE.MeshStandardMaterial({
      color: '#bcd3e2', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.3,
      side: THREE.DoubleSide, depthWrite: false,
    }),
    horse: std('#5b3a24', 0.9),
    coach: std('#3a1f1c', 0.6, 0.1),
    wheelW: std('#2a211b', 0.8),
  };

  /* ---------- Небо ---------- */
  const skyU = {
    top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
    fogC: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: new THREE.Color() }, sunGlow: { value: 0.5 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(700, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 fogC;
        uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunGlow;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.6));
          c = mix(fogC, c, smoothstep(-0.02, 0.12, h));
          if (h < -0.02) c = mix(fogC, bottom, clamp(-h * 3.0, 0.0, 1.0));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          c += sunColor * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12) * sunGlow * step(-0.05, h);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.renderOrder = -10;
  scene.add(sky);

  /* ---------- Свет ---------- */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -48; sc.right = 48; sc.top = 48; sc.bottom = -48; sc.near = 10; sc.far = 260;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.target.position.copy(TARGET);
  scene.add(sun, sun.target);

  // Тёплая подсветка фасада (эпоха 2026)
  const spots = [];
  const spotDefs = [
    [-11, 0.4, 13, -11, 5, 2.8], [11, 0.4, 13, 11, 5, 2.8], [0, 0.4, 15, 0, 6, 3.4],
    [-5, 0.4, 12, -6, 4, 2.6], [5, 0.4, 12, 6, 4, 2.6], [0, 10, 8, 0, 16, 0.5],
  ];
  for (const [x, y, z, tx, ty, tz] of spotDefs) {
    const s = new THREE.SpotLight(0xffb066, 0, 60, 0.62, 0.85, 1.6);
    s.position.set(x, y, z);
    s.target.position.set(tx, ty, tz);
    scene.add(s, s.target);
    spots.push(s);
  }

  /* ---------- Земля, площадь ---------- */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(900, 48).rotateX(-Math.PI / 2), M.ground);
  ground.receiveShadow = true;
  scene.add(ground);

  const env = new Batch();
  env.add('paving', place(box(64, 0.08, 26), 0, 0.04, 16));
  // бордюр площади
  env.add('edge', place(box(64, 0.14, 0.3), 0, 0.07, 29));
  // перроны и конкорс
  const TRACKS = [6, 11.5, 17, 22.5];
  const PLATFORMS = [8.75, 19.75];
  env.add('platform', place(box(25, 0.95, 2.6), 14.5, 0.475, -3.9));
  for (const px of PLATFORMS) {
    env.add('platform', place(box(3.4, 0.95, 82), px, 0.475, -46));
    env.add('edge', place(box(0.25, 0.04, 82), px - 1.55, 0.97, -46));
    env.add('edge', place(box(0.25, 0.04, 82), px + 1.55, 0.97, -46));
  }
  for (const tx of TRACKS) {
    env.add('ballast', place(box(3.0, 0.25, 340), tx, 0.125, -175));
    env.add('rail', place(box(0.09, 0.15, 340), tx - 0.76, 0.325, -175));
    env.add('rail', place(box(0.09, 0.15, 340), tx + 0.76, 0.325, -175));
    // упор
    env.add('dark', place(box(2.2, 0.9, 0.5), tx, 0.7, -5.55));
  }
  scene.add(env.build(M));

  // шпалы — инстансами
  {
    const perTrack = 170;
    const sleepers = new THREE.InstancedMesh(box(2.5, 0.08, 0.26), M.sleeper, perTrack * TRACKS.length);
    let k = 0;
    for (const tx of TRACKS) {
      for (let i = 0; i < perTrack; i++) {
        _o.position.set(tx, 0.27, -6.2 - i * 0.9);
        _o.rotation.set(0, 0, 0);
        _o.scale.set(1, 1, 1);
        _o.updateMatrix();
        sleepers.setMatrixAt(k++, _o.matrix);
      }
    }
    sleepers.receiveShadow = true;
    scene.add(sleepers);
  }

  /* ---------- Город вдали ---------- */
  {
    const r = rng(1851);
    const cb = new Batch();
    let placed = 0;
    while (placed < 70) {
      const a = r() * Math.PI * 2;
      const d = 105 + r() * 170;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (x > -4 && x < 34 && z < 10) continue; // коридор путей
      const w = 8 + r() * 16, dd = 8 + r() * 16, h = 5 + r() * (d > 190 ? 24 : 11);
      cb.add('city', place(box(w, h, dd), x, h / 2, z, r() * 0.4));
      placed++;
    }
    const city = cb.build(M, { cast: false, receive: false });
    scene.add(city);
  }

  /* ---------- Здание вокзала ---------- */
  const bld = new Batch();
  const seams = new Batch();
  const clockHands = [];

  function addWindow(f, u, v, w, h, glassKey = 'glass') {
    const fw = 0.14;
    bld.face('trim', new THREE.ShapeGeometry(archShape(w + fw * 2, h + fw), 10), f, u, v, 0.02);
    bld.face(glassKey, new THREE.ShapeGeometry(archShape(w, h), 10), f, u, v, 0.04);
    bld.face('trim', box(0.06, h - 0.06, 0.03), f, u, v + h / 2 - 0.03, 0.055);
    bld.face('trim', box(w, 0.06, 0.03), f, u, v + h - w / 2, 0.055);
    bld.face('trim', box(w + 0.42, 0.1, 0.2), f, u, v - 0.05, 0.1);
    bld.face('trim', box(0.22, 0.32, 0.12), f, u, v + h + fw - 0.08, 0.06);
  }
  function pilaster(f, u, v0, v1, w = 0.38) {
    bld.face('trim', box(w, v1 - v0, 0.16), f, u, (v0 + v1) / 2, 0.08);
    bld.face('trim', box(w + 0.12, 0.14, 0.22), f, u, v1 - 0.07, 0.11); // капитель
  }
  function quoins(f, u, v0, v1) {
    let alt = false;
    for (let v = v0; v < v1 - 0.2; v += 0.5) {
      bld.face('trim', box(alt ? 0.62 : 0.42, 0.4, 0.1), f, u + (u > 0 ? -1 : 1) * (alt ? 0.31 : 0.21), v + 0.22, 0.05);
      alt = !alt;
    }
  }
  function seamLines(f, u, len, v0 = 0.95, v1 = 3.4) {
    for (let v = v0; v <= v1; v += 0.36) seams.face('seams', box(len, 0.035, 0.02), f, u, v, 0.012);
  }
  /** Объём: стены + цоколь + карнизы (плиты, выступающие со всех сторон). */
  function volume(key, cx, cz, w, d, h, { mid = 3.6, top = 7.0 } = {}) {
    bld.add(key, place(box(w, h, d), cx, h / 2, cz));
    bld.add('plinth', place(box(w + 0.16, 0.6, d + 0.16), cx, 0.3, cz));
    bld.add('trim', place(box(w + 0.36, 0.22, d + 0.36), cx, mid, cz));
    bld.add('trim', place(box(w + 0.4, 0.2, d + 0.4), cx, top - 0.1, cz));
    bld.add('trim', place(box(w + 0.8, 0.28, d + 0.8), cx, top + 0.14, cz));
  }

  // корпус
  const BODY_W = 30.8, BODY_D = 5.2;
  volume('wallA', 0, 0, BODY_W, BODY_D, 7.0);
  // парапет корпуса и кровля
  bld.add('wallA', place(box(BODY_W - 0.2, 0.62, BODY_D - 0.2), 0, 7.59, 0));
  bld.add('trim', place(box(BODY_W + 0.1, 0.12, BODY_D + 0.1), 0, 7.94, 0));
  bld.add('roof', place(box(BODY_W - 1.2, 0.9, BODY_D - 1.6), 0, 7.9, 0));
  for (const x of [-9, -6, 6, 9]) bld.add('plinth', place(box(0.7, 1.4, 0.7), x, 8.6, 0.4));

  const front = { x: 0, z: BODY_D / 2, ry: 0 };
  const back = { x: 0, z: -BODY_D / 2, ry: Math.PI };
  const wingX = [-11.375, -9.325, -7.275, -5.225, 5.225, 7.275, 9.325, 11.375];
  const pilX = [-10.35, -8.3, -6.25, 6.25, 8.3, 10.35];
  for (const f of [front, back]) {
    const sgn = f === front ? 1 : -1;
    for (const x of wingX) {
      addWindow(f, x * sgn, 1.0, 1.0, 2.1);
      addWindow(f, x * sgn, 4.25, 0.95, 2.05);
    }
    for (const x of pilX) {
      pilaster(f, x * sgn, 0.6, 3.5);
      pilaster(f, x * sgn, 3.71, 6.9);
      bld.face('trim', box(0.5, 0.7, 0.42), f, x * sgn, 7.75, 0.0); // тумбы парапета
    }
    seamLines(f, -8.3 * sgn, 8.2);
    seamLines(f, 8.3 * sgn, 8.2);
  }

  // торцевые ризалиты
  for (const sx of [-1, 1]) {
    const cx = 13.9 * sx;
    volume('wallB', cx, 0, 3.0, 6.0, 7.0);
    bld.add('wallB', place(box(3.0, 1.1, 6.0), cx, 7.8, 0));
    bld.add('trim', place(box(3.5, 0.18, 6.5), cx, 8.42, 0));
    for (const f of [{ x: cx, z: 3.0, ry: 0 }, { x: cx, z: -3.0, ry: Math.PI }]) {
      addWindow(f, 0, 0.95, 1.2, 2.3);
      addWindow(f, 0, 4.15, 1.1, 2.2);
      quoins(f, 1.5, 0.6, 7.0);
      quoins(f, -1.5, 0.6, 7.0);
      bld.face('trim', box(1.9, 0.5, 0.08), f, 0, 7.75, 0.04); // филёнка
      seamLines(f, 0, 3.0);
    }
    const side = { x: 15.4 * sx, z: 0, ry: (sx * Math.PI) / 2 };
    for (const u of [-1.5, 1.5]) {
      addWindow(side, u, 0.95, 1.1, 2.2);
      addWindow(side, u, 4.15, 1.05, 2.1);
    }
    quoins(side, 3.0, 0.6, 7.0);
    quoins(side, -3.0, 0.6, 7.0);
    seamLines(side, 0, 6.0);
  }

  // центральный ризалит
  {
    const cz = 0.2, w = 8.4, d = 6.4;
    volume('wallB', 0, cz, w, d, 9.0);
    bld.add('trim', place(box(w + 0.5, 0.25, d + 0.5), 0, 9.05, cz));
    bld.add('trim', place(box(w + 0.8, 0.22, d + 0.8), 0, 9.27, cz));
    const fF = { x: 0, z: cz + d / 2, ry: 0 };
    const fB = { x: 0, z: cz - d / 2, ry: Math.PI };
    for (const f of [fF, fB]) {
      for (const u of [-2.8, 0, 2.8]) {
        if (f === fF) addWindow(f, u, 0.6, 1.55, 3.0, 'door');
        else addWindow(f, u, 1.0, 1.35, 2.4);
        addWindow(f, u, 4.05, 1.45, 2.65);
      }
      for (const u of [-3.95, -1.4, 1.4, 3.95]) {
        pilaster(f, u, 0.6, 3.5, 0.44);
        pilaster(f, u, 3.71, 6.9, 0.44);
        bld.face('trim', box(0.5, 1.7, 0.18), f, u, 8.1, 0.09);
      }
      bld.face('trim', box(4.6, 1.0, 0.1), f, 0, 8.05, 0.06); // доска-плашка
      bld.face('gold', box(4.2, 0.08, 0.04), f, 0, 8.05, 0.13);
      seamLines(f, 0, 8.4, 0.95, 3.4);
    }
    // вазы на аттике
    for (const x of [-3.95, -1.4, 1.4, 3.95]) {
      for (const z of [cz + d / 2 - 0.1, cz - d / 2 + 0.1]) {
        bld.add('trim', place(box(0.5, 0.4, 0.5), x, 9.58, z));
        bld.add('trim', place(sphere(0.26, 10, 6), x, 9.98, z));
      }
    }
  }

  // башня с часами
  const TOWER = { x: 0, z: 0.2 };
  {
    const { x, z } = TOWER;
    // ярус 1
    bld.add('wallA', place(box(5.2, 3.4, 5.2), x, 9.0 + 1.7, z));
    bld.add('trim', place(box(5.8, 0.3, 5.8), x, 12.45, z));
    bld.add('trim', place(box(5.5, 0.18, 5.5), x, 12.2, z));
    // ярус 2 (часы)
    bld.add('wallB', place(box(4.2, 3.4, 4.2), x, 12.6 + 1.7, z));
    bld.add('trim', place(box(4.9, 0.3, 4.9), x, 16.15, z));
    bld.add('trim', place(box(4.6, 0.18, 4.6), x, 15.95, z));
    // фонарик и шатёр
    bld.add('wallA', place(box(2.6, 1.4, 2.6), x, 16.3 + 0.7, z));
    bld.add('trim', place(box(3.0, 0.2, 3.0), x, 17.8, z));
    bld.add('roof', place(new THREE.ConeGeometry(2.05, 2.3, 4, 1), x, 19.05, z, Math.PI / 4));
    bld.add('gold', place(sphere(0.2, 10, 8), x, 20.25, z));
    bld.add('gold', place(cyl(0.04, 0.06, 1.0, 6), x, 20.8, z));

    for (let k = 0; k < 4; k++) {
      const ry = (k * Math.PI) / 2;
      const c = Math.cos(ry), s = Math.sin(ry);
      const f1 = { x: x + 2.6 * s, z: z + 2.6 * c, ry };
      addWindow(f1, 0, 9.7, 1.3, 2.05);
      pilaster(f1, -2.3, 9.0, 12.2, 0.5);
      pilaster(f1, 2.3, 9.0, 12.2, 0.5);
      const f2 = { x: x + 2.1 * s, z: z + 2.1 * c, ry };
      pilaster(f2, -1.82, 12.6, 15.95, 0.46);
      pilaster(f2, 1.82, 12.6, 15.95, 0.46);
      const f3 = { x: x + 1.3 * s, z: z + 1.3 * c, ry };
      bld.face('glass', new THREE.ShapeGeometry(archShape(0.5, 0.95), 8), f3, -0.55, 16.5, 0.02);
      bld.face('glass', new THREE.ShapeGeometry(archShape(0.5, 0.95), 8), f3, 0.55, 16.5, 0.02);
      // циферблат
      bld.face('clockFace', new THREE.CircleGeometry(1.2, 40), f2, 0, 14.3, 0.04);
      bld.face('gold', new THREE.TorusGeometry(1.24, 0.07, 6, 40), f2, 0, 14.3, 0.06);
      for (let h = 0; h < 12; h++) {
        const a = (h / 12) * Math.PI * 2;
        const len = h % 3 === 0 ? 0.26 : 0.14;
        const rr = 1.0;
        const g = box(0.06, len, 0.02).rotateZ(-a).translate(Math.sin(a) * rr, 14.3 + Math.cos(a) * rr, 0);
        bld.face('dark', g, f2, 0, 0, 0.06);
      }
      // стрелки (отдельные меши, чтобы вращать)
      const pivot = new THREE.Group();
      pivot.position.set(f2.x + 0.1 * s, 14.3, f2.z + 0.1 * c);
      pivot.rotation.y = ry;
      const hourH = new THREE.Mesh(box(0.1, 0.62, 0.03).translate(0, 0.26, 0), M.dark);
      const minH = new THREE.Mesh(box(0.06, 0.92, 0.03).translate(0, 0.4, 0.02), M.dark);
      const cap = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), M.gold);
      cap.position.z = 0.045;
      pivot.add(hourH, minH, cap);
      scene.add(pivot);
      clockHands.push({ hourH, minH });
    }
  }

  // трубы на кровле
  for (const x of [-12.5, -3.2, 3.2, 12.5]) bld.add('plinth', place(box(0.55, 1.1, 0.55), x, 8.8, -1.4));

  scene.add(bld.build(M, { skipShadow: ['glass', 'door', 'clockFace'] }));
  const seamsGroup = seams.build(M, { cast: false, receive: false });
  scene.add(seamsGroup);

  /* ---------- Эпоховые элементы ---------- */
  const feats = {};
  const haloTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const haloMats = [];
  function halo(scale) {
    const m = new THREE.SpriteMaterial({
      map: haloTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: true,
    });
    haloMats.push(m);
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    return s;
  }

  const LAMP_SQUARE = [[-21, 8], [-14.5, 8], [-8, 8], [8, 8], [14.5, 8], [21, 8], [-21, 24], [21, 24]];
  const LAMP_PLATFORM = [];
  for (const px of PLATFORMS) for (const z of [-12, -24, -36, -48]) LAMP_PLATFORM.push([px, z]);

  function featGroup(name) {
    const g = new THREE.Group();
    g.name = name;
    feats[name] = g;
    scene.add(g);
    return g;
  }

  // Газовые / масляные фонари (и LED-фонари 2026, стилизованные под масляные)
  {
    const g = featGroup('gas');
    const proto = new Batch();
    proto.add('iron', place(box(0.36, 0.45, 0.36), 0, 0.22, 0));
    proto.add('iron', place(cyl(0.06, 0.09, 2.9, 8), 0, 1.9, 0));
    proto.add('iron', place(box(0.5, 0.05, 0.05), 0, 3.05, 0));
    proto.add('lampGlass', place(cyl(0.22, 0.15, 0.5, 6), 0, 3.4, 0));
    proto.add('iron', place(new THREE.ConeGeometry(0.3, 0.32, 6), 0, 3.82, 0));
    proto.add('iron', place(sphere(0.06, 6, 4), 0, 4.02, 0));
    const lampMesh = proto.build(M, { receive: false });
    for (const [x, z] of [...LAMP_SQUARE, ...LAMP_PLATFORM]) {
      const l = new THREE.Group();
      l.position.set(x, z < -2 ? 0.95 : 0.08, z);
      l.add(lampMesh.clone());
      const h = halo(2.6);
      h.position.y = 3.4;
      l.add(h);
      g.add(l);
    }
  }
  // Электрические фонари-шары (1949)
  {
    const g = featGroup('electric');
    const proto = new Batch();
    proto.add('iron', place(box(0.4, 0.5, 0.4), 0, 0.25, 0));
    proto.add('iron', place(cyl(0.07, 0.11, 4.4, 8), 0, 2.4, 0));
    proto.add('iron', place(box(1.3, 0.07, 0.07), 0, 4.35, 0));
    proto.add('lampGlass', place(sphere(0.26, 12, 8), -0.62, 4.6, 0));
    proto.add('lampGlass', place(sphere(0.26, 12, 8), 0.62, 4.6, 0));
    proto.add('lampGlass', place(sphere(0.3, 12, 8), 0, 4.95, 0));
    const lampMesh = proto.build(M, { receive: false });
    for (const [x, z] of [...LAMP_SQUARE, ...LAMP_PLATFORM]) {
      const l = new THREE.Group();
      l.position.set(x, z < -2 ? 0.95 : 0.08, z);
      l.add(lampMesh.clone());
      const h = halo(3.4);
      h.position.y = 4.75;
      l.add(h);
      g.add(l);
    }
  }
  // Современные мачты освещения (2009)
  {
    const g = featGroup('modern');
    const proto = new Batch();
    proto.add('steel', place(cyl(0.08, 0.13, 7.5, 8), 0, 3.75, 0));
    proto.add('steel', place(box(0.08, 0.08, 1.5), 0, 7.4, 0.7));
    proto.add('lampGlass', place(box(0.32, 0.1, 0.65), 0, 7.33, 1.35));
    const lampMesh = proto.build(M, { receive: false });
    for (const [x, z] of [...LAMP_SQUARE, ...LAMP_PLATFORM]) {
      const l = new THREE.Group();
      l.position.set(x, z < -2 ? 0.95 : 0.08, z);
      if (z < -2) l.rotation.y = -Math.PI / 2;
      l.add(lampMesh.clone());
      const h = halo(2.0);
      h.position.set(0, 7.2, 1.35);
      l.add(h);
      g.add(l);
    }
  }
  // Конные экипажи (1855)
  {
    const g = featGroup('carriages');
    const proto = new Batch();
    proto.add('coach', place(box(1.5, 1.05, 2.0), 0, 1.25, 0));
    proto.add('dark', place(box(1.6, 0.1, 2.2), 0, 1.82, 0));
    proto.add('dark', place(box(1.3, 0.12, 0.9), 0, 1.5, 1.5)); // козлы
    proto.add('glass', place(box(1.52, 0.4, 0.8), 0, 1.45, 0));
    for (const [zz, r] of [[0.75, 0.42], [-0.75, 0.55]]) {
      proto.add('wheelW', place(wheel(r, 0.08), 0.8, r, zz));
      proto.add('wheelW', place(wheel(r, 0.08), -0.8, r, zz));
    }
    proto.add('dark', place(box(0.05, 0.05, 2.0), 0.35, 0.95, 2.6));
    proto.add('dark', place(box(0.05, 0.05, 2.0), -0.35, 0.95, 2.6));
    // лошадь
    proto.add('horse', place(box(0.55, 0.65, 1.5), 0, 1.35, 3.0));
    for (const [lx, lz] of [[0.18, 2.5], [-0.18, 2.5], [0.18, 3.55], [-0.18, 3.55]]) {
      proto.add('horse', place(box(0.13, 1.05, 0.13), lx, 0.52, lz));
    }
    proto.add('horse', place(box(0.32, 0.85, 0.35), 0, 1.9, 3.75, 0, 0.5));
    proto.add('horse', place(box(0.28, 0.3, 0.65), 0, 2.25, 4.05, 0, 0.5));
    const coach = proto.build(M);
    for (const [x, z, ry] of [[-9.5, 11.5, Math.PI / 2 + 0.1], [6.5, 14, -Math.PI / 2 + 0.15], [16, 19.5, Math.PI * 0.85], [-17, 18, 0.4]]) {
      const c = coach.clone();
      const w = new THREE.Group();
      w.position.set(x, 0.08, z);
      w.rotation.y = ry;
      w.add(c);
      g.add(w);
    }
  }
  // Деревья (сквер на площади)
  {
    const g = featGroup('trees');
    const r = rng(7);
    const spotsT = [[-27, 6], [-27, 14], [-27, 22], [27, 6], [27, 14], [27, 22], [-19, 28], [-11, 28], [11, 28], [19, 28]];
    for (const [x, z] of spotsT) {
      const tb = new Batch();
      const h = 4 + r() * 2;
      tb.add('trunk', place(cyl(0.16, 0.22, h * 0.5, 6), 0, h * 0.25, 0));
      tb.add('tree', place(new THREE.IcosahedronGeometry(1.8 + r() * 0.6, 0), 0, h * 0.62, 0));
      tb.add('tree', place(new THREE.IcosahedronGeometry(1.3, 0), 0.5, h * 0.85, 0.3));
      const t = new THREE.Group();
      t.position.set(x, 0.08, z);
      t.add(tb.build(M));
      g.add(t);
    }
  }
  // Флагшток на башне (2026)
  {
    const g = featGroup('flag');
    const inner = new THREE.Group();
    const fb = new Batch();
    fb.add('steel', place(cyl(0.05, 0.08, 5.2, 8), 0, 2.6, 0));
    fb.add('gold', place(sphere(0.16, 10, 8), 0, 5.3, 0));
    inner.add(fb.build(M));
    inner.position.set(TOWER.x, 20.3, TOWER.z);
    g.add(inner);
  }
  // Контактная сеть (2009, 2026)
  {
    const g = featGroup('catenary');
    const inner = new THREE.Group();
    const cb = new Batch();
    for (let z = -10; z > -200; z -= 16) {
      cb.add('steel', place(cyl(0.12, 0.16, 7.6, 6), 25.4, 3.8, z));
      cb.add('steel', place(box(10.6, 0.14, 0.14), 20.2, 7.2, z));
    }
    for (const tx of [17, 22.5]) cb.add('dark', place(box(0.04, 0.04, 192), tx, 6.6, -104));
    inner.add(cb.build(M, { cast: false }));
    g.add(inner);
  }
  // Стеклянный дебаркадер (2026)
  let canopyInner;
  {
    const g = featGroup('canopy');
    canopyInner = new THREE.Group();
    const steel = new Batch();
    const glass = new Batch();
    const LEN = 66, Z0 = -5, ZC = Z0 - LEN / 2, R = 5.5, SPRING = 7.2, RISE = 0.48;
    for (const px of PLATFORMS) {
      glass.add('canopyGlass', place(
        new THREE.CylinderGeometry(R, R, LEN, 24, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
        px, SPRING, ZC, 0, 0, 0, 1, RISE, 1));
      for (let z = Z0; z >= Z0 - LEN; z -= 6) {
        steel.add('steel', place(new THREE.TorusGeometry(R, 0.09, 4, 24, Math.PI), px, SPRING, z, 0, 0, 0, 1, RISE, 1));
      }
      for (let z = Z0 - 1; z >= Z0 - LEN; z -= 12) {
        for (const sx of [-R, R]) steel.add('steel', place(cyl(0.16, 0.2, SPRING, 8), px + sx, SPRING / 2, z));
      }
      for (const sx of [-R, R]) steel.add('steel', place(box(0.3, 0.3, LEN), px + sx, SPRING, ZC));
      steel.add('steel', place(box(0.2, 0.2, LEN), px, SPRING + R * RISE, ZC));
    }
    canopyInner.add(steel.build(M, { receive: false }));
    const gm = glass.build(M, { cast: false, receive: false });
    gm.children.forEach((m) => { m.renderOrder = 2; });
    canopyInner.add(gm);
    g.add(canopyInner);
  }

  /* ---------- Поезда ---------- */
  const STOP_Z = -6.4;
  const FAR_Z = -330;
  const trains = {};

  function wheelsUnder(b, key, zs, r, gauge = 0.82) {
    for (const z of zs) {
      b.add(key, place(wheel(r), gauge, r, z));
      b.add(key, place(wheel(r), -gauge, r, z));
    }
  }

  function carRow(b, n, zStart, len, opts) {
    const { body, roof, win, belt, w = 2.4, y0 = 1.15, h = 1.7, wins = 5, winH = 0.6, winW = 0.7 } = opts;
    for (let i = 0; i < n; i++) {
      const zc = zStart - i * (len + 0.8) - len / 2;
      const key = Array.isArray(body) ? body[i % body.length] : body;
      b.add(key, place(box(w, h, len), 0, y0 + h / 2, zc));
      b.add(roof, place(cylZ(w / 2 + 0.04, len + 0.1, 14), 0, y0 + h, zc, 0, 0, 0, 1, 0.3, 1));
      b.add('dark', place(box(w * 0.8, 0.3, len - 0.6), 0, y0 - 0.1, zc));
      b.add('dark', place(box(0.3, 0.3, 0.9), 0, y0 - 0.05, zc + len / 2 + 0.35));
      if (belt) b.add(belt, place(box(w + 0.02, 0.1, len + 0.01), 0, y0 + h * 0.3, zc));
      for (let k = 0; k < wins; k++) {
        const zz = zc + (k - (wins - 1) / 2) * (len / (wins + 0.6));
        b.add(win, place(box(w + 0.04, winH, winW), 0, y0 + h * 0.62, zz));
      }
      wheelsUnder(b, 'wheel', [zc + len / 2 - 1.1, zc - len / 2 + 1.1], 0.45, w / 2 - 0.3);
    }
  }

  function buildTrain(type) {
    const b = new Batch();
    let stack = null;
    let smokeColor = '#e9e4da';
    let mats;
    if (type === 'steam51' || type === 'steam55') {
      const v55 = type === 'steam55';
      mats = {
        body: std(v55 ? '#6e2a24' : '#2f5236', 0.5, 0.3), dark: std('#1f1d1b', 0.6, 0.4),
        brass: std('#c39a45', 0.3, 0.8), red: std('#8e2a22', 0.6), wheel: std(v55 ? '#2a2420' : '#7a2a20', 0.6, 0.3),
        wood: std(v55 ? '#2f4f39' : '#7a4b2a', 0.85), wood2: std(v55 ? '#a8823c' : '#9a6a35', 0.85),
        roofc: std('#3a3631', 0.8), win: std('#2a2622', 0.4, 0, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.15 }),
        trimc: std('#d9c79a', 0.7),
      };
      b.add('dark', place(box(1.7, 0.3, 5.4), 0, 1.0, -2.8));
      b.add('red', place(box(2.1, 0.38, 0.2), 0, 0.95, -0.1));
      b.add('dark', place(cylZ(0.12, 0.35), 0.65, 0.95, 0.1));
      b.add('dark', place(cylZ(0.12, 0.35), -0.65, 0.95, 0.1));
      b.add('body', place(cylZ(0.6, 3.4), 0, 2.0, -2.4));
      b.add('dark', place(cylZ(0.64, 0.7), 0, 2.0, -0.6));
      for (const z of [-1.3, -2.4, -3.6]) b.add('brass', place(cylZ(0.63, 0.08), 0, 2.0, z));
      b.add('dark', place(cyl(0.15, 0.19, 1.3, 10), 0, 3.15, -0.6));
      b.add('dark', place(cyl(0.52, 0.16, 0.85, 12), 0, 4.2, -0.6));
      b.add('brass', place(cyl(0.54, 0.54, 0.08, 12), 0, 4.64, -0.6));
      stack = new THREE.Vector3(0, 4.8, -0.6);
      b.add('brass', place(sphere(0.3, 10, 8), 0, 2.65, -2.4, 0, 0, 0, 1, 1.3, 1));
      b.add('brass', place(cyl(0.08, 0.1, 0.5, 6), 0, 2.8, -3.4));
      // будка машиниста (открытая)
      b.add('body', place(box(1.9, 1.3, 0.08), 0, 2.15, -4.15));
      for (const [px, pz] of [[0.85, -4.2], [-0.85, -4.2], [0.85, -5.3], [-0.85, -5.3]]) {
        b.add('dark', place(box(0.08, 1.7, 0.08), px, 2.1, pz));
      }
      b.add('roofc', place(box(2.1, 0.1, 1.5), 0, 3.0, -4.75));
      wheelsUnder(b, 'wheel', [-1.0, -4.4], 0.45, 0.88);
      wheelsUnder(b, 'wheel', [-2.7], 0.88, 0.88);
      b.add('body', place(box(0.2, 0.5, 2.2), 0.9, 1.15, -2.7)); // кожух колеса
      b.add('body', place(box(0.2, 0.5, 2.2), -0.9, 1.15, -2.7));
      // тендер
      b.add('body', place(box(1.9, 1.0, 2.6), 0, 1.55, -7.0));
      b.add('wood', place(box(1.6, 0.4, 2.0), 0, 2.2, -7.0));
      b.add('dark', place(box(1.7, 0.25, 2.8), 0, 0.95, -7.0));
      wheelsUnder(b, 'wheel', [-6.2, -7.8], 0.45, 0.88);
      carRow(b, 3, -8.8, 5.8, { body: ['wood', 'wood2', 'wood'], roof: 'roofc', win: 'win', belt: 'trimc', w: 2.2, h: 1.6, wins: 4 });
      if (v55) smokeColor = '#e2ddd2';
    } else if (type === 'soviet' || type === 'p36') {
      const p36 = type === 'p36';
      mats = {
        body: std(p36 ? '#2c5a40' : '#1d1c1b', 0.45, 0.35), dark: std('#161515', 0.6, 0.4),
        red: std('#a32a22', 0.55), wheel: std('#a32a22', 0.55, 0.2), steel: std('#7b8288', 0.4, 0.7),
        cream: std('#e8dcb8', 0.6), car: std(p36 ? '#2d5543' : '#6b3e2b', 0.75), car2: std(p36 ? '#2a4e3e' : '#5f3626', 0.75),
        roofc: std('#3b3d3c', 0.8), win: std('#24282a', 0.35, 0.2, { emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0.12 }),
      };
      b.add('dark', place(box(2.3, 0.4, 9.6), 0, 1.15, -4.8));
      b.add('red', place(box(2.8, 0.45, 0.22), 0, 1.1, -0.1));
      b.add('dark', place(box(2.2, 0.5, 0.7), 0, 0.5, 0.1, 0, -0.5)); // путеочиститель
      b.add('dark', place(cylZ(0.14, 0.4), 0.95, 1.1, 0.15));
      b.add('dark', place(cylZ(0.14, 0.4), -0.95, 1.1, 0.15));
      b.add('body', place(cylZ(0.9, 6.0), 0, 2.45, -4.0));
      b.add('dark', place(cylZ(0.96, 1.2), 0, 2.45, -1.0));
      b.add('steel', place(cylZ(0.72, 0.06), 0, 2.45, -0.38));
      b.add('red', new THREE.ShapeGeometry(starShape(0.36, 0.15)).translate(0, 2.5, -0.33));
      b.add('dark', place(cyl(0.27, 0.32, 0.7, 12), 0, 3.6, -1.2));
      stack = new THREE.Vector3(0, 4.05, -1.2);
      b.add(p36 ? 'body' : 'dark', place(sphere(0.42, 12, 8), 0, 3.3, -3.0, 0, 0, 0, 1, 0.7, 1.3));
      b.add(p36 ? 'body' : 'dark', place(sphere(0.4, 12, 8), 0, 3.28, -4.6, 0, 0, 0, 1, 0.7, 1.2));
      b.add('dark', place(box(2.9, 0.07, 7.2), 0, 1.75, -4.2)); // площадки
      b.add('red', place(box(2.92, 0.12, 7.2), 0, 1.68, -4.2));
      if (p36) {
        b.add('cream', place(box(1.86, 0.14, 6.0), 0, 2.45, -4.0));
        b.add('body', place(box(0.06, 1.4, 1.9), 1.2, 2.6, -1.4));
        b.add('body', place(box(0.06, 1.4, 1.9), -1.2, 2.6, -1.4));
      }
      wheelsUnder(b, 'wheel', [-1.1], 0.45, 0.95);
      wheelsUnder(b, 'wheel', [-2.6, -4.0, -5.4, -6.8], 0.68, 0.95);
      b.add('steel', place(box(0.06, 0.12, 4.4), 1.08, 0.75, -4.7));
      b.add('steel', place(box(0.06, 0.12, 4.4), -1.08, 0.75, -4.7));
      // будка
      b.add('body', place(box(2.9, 2.1, 2.1), 0, 2.85, -8.5));
      b.add('roofc', place(box(3.2, 0.14, 2.6), 0, 3.95, -8.5));
      b.add('win', place(box(2.94, 0.6, 0.7), 0, 3.2, -8.3));
      if (p36) b.add('cream', place(box(2.94, 0.14, 2.12), 0, 2.45, -8.5));
      // тендер
      b.add('body', place(box(2.8, 2.0, 5.0), 0, 2.15, -12.4));
      b.add('dark', place(box(2.5, 0.35, 4.6), 0, 3.25, -12.6));
      if (p36) b.add('cream', place(box(2.82, 0.14, 5.02), 0, 2.45, -12.4));
      wheelsUnder(b, 'wheel', [-10.7, -11.7, -13.1, -14.1], 0.45, 0.95);
      carRow(b, 4, -15.4, 8.5, {
        body: ['car', 'car2'], roof: 'roofc', win: 'win', belt: p36 ? 'cream' : null,
        w: 2.9, y0: 1.15, h: 2.45, wins: 6, winH: 0.75, winW: 0.85,
      });
      smokeColor = p36 ? '#dedad2' : '#bdb7ad';
    } else {
      // «Сапсан»
      mats = {
        white: std('#eef0f2', 0.32, 0.25), grey: std('#9aa1a8', 0.45, 0.4), grey2: std('#6c737a', 0.5, 0.4),
        red: std('#c8102e', 0.4, 0.1), glassD: std('#1a2430', 0.15, 0.6, { emissive: new THREE.Color('#fff4e0'), emissiveIntensity: 0.05 }),
        dark: std('#1e2124', 0.6, 0.4), wheel: std('#2a2c2e', 0.5, 0.6),
      };
      const NOSE = 3.8, LEN = 10, GAP = 0.45, NC = 5;
      const y0 = 1.05, h = 3.0, w = 2.9, yc = y0 + h / 2;
      for (let i = 0; i < NC; i++) {
        const zf = -i * (LEN + GAP);
        const lead = i === 0, tail = i === NC - 1;
        const zA = lead ? zf - NOSE : zf;
        const zB = tail ? zf - LEN + NOSE : zf - LEN;
        const len = zA - zB, zc = (zA + zB) / 2;
        b.add('white', place(box(w, h, len), 0, yc, zc));
        b.add('white', place(cylZ(w / 2, len, 18), 0, y0 + h, zc, 0, 0, 0, 1, 0.2, 1));
        b.add('glassD', place(box(w + 0.02, 0.55, len - 0.8), 0, 3.05, zc));
        b.add('red', place(box(w + 0.02, 0.2, len), 0, 1.62, zc));
        b.add('grey2', place(box(w + 0.02, 0.32, len), 0, 1.25, zc));
        b.add('grey', place(box(w - 0.2, 0.55, len - 0.2), 0, 0.82, zc));
        for (const dz of [len / 2 - 1.2, -len / 2 + 1.2]) {
          b.add('grey', place(box(w + 0.03, 1.95, 0.9), 0, 2.2, zc + dz));
        }
        wheelsUnder(b, 'wheel', [zf - 1.6, zf - 3.6, zf - LEN + 1.6, zf - LEN + 3.6], 0.42, 1.0);
        b.add('dark', place(box(2.4, 0.5, 2.8), 0, 0.6, zf - 2.6));
        b.add('dark', place(box(2.4, 0.5, 2.8), 0, 0.6, zf - LEN + 2.6));
        if (!tail) b.add('dark', place(box(2.4, 2.6, GAP + 0.1), 0, yc, zf - LEN - GAP / 2));
        for (const [end, dir] of lead ? [[zA, 1]] : tail ? [[zB, -1]] : []) {
          const zz = end;
          b.add('white', place(sphere(1, 28, 16), 0, yc, zz, 0, 0, 0, w / 2, h / 2, NOSE));
          b.add('glassD', place(sphere(1, 24, 14), 0, 3.15, zz + dir * 0.55, 0, 0, 0, 1.18, 0.62, 2.55));
          b.add('red', place(sphere(1, 24, 10), 0, 1.62, zz, 0, 0, 0, w / 2 + 0.015, 0.2, NOSE + 0.02));
          b.add('grey2', place(sphere(1, 24, 10), 0, 1.25, zz - dir * 0.05, 0, 0, 0, w / 2 + 0.01, 0.3, NOSE - 0.05));
          b.add('dark', place(box(1.2, 0.4, 0.4), 0, 0.85, zz + dir * (NOSE - 0.6)));
        }
      }
      // токоприёмник
      const pz = -(LEN + GAP) - 5;
      b.add('dark', place(box(1.4, 0.18, 1.0), 0, 4.45, pz));
      b.add('grey2', place(box(0.08, 0.08, 1.9), 0, 5.0, pz - 0.2, 0, 0.75));
      b.add('grey2', place(box(0.08, 0.08, 1.9), 0, 5.0, pz + 0.2, 0, -0.75));
      b.add('grey2', place(box(1.8, 0.07, 0.12), 0, 5.62, pz));
    }
    const mesh = b.build(mats);
    const group = new THREE.Group();
    group.add(mesh);
    group.visible = false;
    scene.add(group);
    return { group, stack, smokeColor, type, z: FAR_Z, mode: 'hidden', t0: 0, dur: 1, zFrom: FAR_Z, speed: 0 };
  }
  const TRACK_OF = { steam51: 22.5, steam55: 17, soviet: 22.5, p36: 17, sapsan: 22.5 };
  for (const t of Object.keys(TRACK_OF)) {
    trains[t] = buildTrain(t);
    trains[t].group.position.set(TRACK_OF[t], 0.4, FAR_Z);
  }
  let currentTrain = null;
  const LEAVE_DUR = 2.6, ARRIVE_DUR = 3.8;

  function leave(tr, now) {
    if (tr.mode === 'hidden' || (tr.mode === 'arriving' && now < tr.t0)) {
      tr.mode = 'hidden';
      tr.group.visible = false;
      return 0;
    }
    tr.mode = 'leaving';
    tr.zFrom = tr.z;
    tr.t0 = now;
    tr.dur = LEAVE_DUR;
    return LEAVE_DUR;
  }
  function arrive(tr, now, delay) {
    if (tr.mode === 'leaving' || tr.mode === 'idle') {
      tr.zFrom = tr.z;
      tr.t0 = now;
      tr.dur = Math.max(1.2, ARRIVE_DUR * Math.min(1, (STOP_Z - tr.z) / (STOP_Z - FAR_Z)));
    } else {
      tr.zFrom = FAR_Z;
      tr.t0 = now + delay;
      tr.dur = ARRIVE_DUR;
    }
    tr.mode = 'arriving';
  }
  function setTrain(type, instant, now) {
    const next = trains[type];
    if (instant) {
      for (const t of Object.values(trains)) {
        t.mode = t === next ? 'idle' : 'hidden';
        t.z = t === next ? STOP_Z : FAR_Z;
        t.group.visible = t === next;
        t.group.position.z = t.z;
      }
      currentTrain = next;
      return;
    }
    if (currentTrain === next) {
      if (next.mode === 'leaving') arrive(next, now, 0);
      return;
    }
    let wait = 0.5;
    if (currentTrain) {
      const left = leave(currentTrain, now);
      if (TRACK_OF[currentTrain.type] === TRACK_OF[type] && left > 0) wait = left + 0.2;
    }
    // другие уходящие поезда на этом же пути
    for (const t of Object.values(trains)) {
      if (t !== next && t.mode === 'leaving' && TRACK_OF[t.type] === TRACK_OF[type]) {
        wait = Math.max(wait, t.t0 + t.dur - now + 0.2);
      }
    }
    arrive(next, now, wait);
    currentTrain = next;
  }
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeIn = (p) => p * p * p;
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  function updateTrains(now, dt) {
    for (const t of Object.values(trains)) {
      const prev = t.z;
      if (t.mode === 'arriving') {
        if (now < t.t0) { t.group.visible = false; continue; }
        const p = Math.min((now - t.t0) / t.dur, 1);
        t.z = THREE.MathUtils.lerp(t.zFrom, STOP_Z, easeOut(p));
        t.group.visible = true;
        if (p >= 1) t.mode = 'idle';
      } else if (t.mode === 'leaving') {
        const p = Math.min((now - t.t0) / t.dur, 1);
        t.z = THREE.MathUtils.lerp(t.zFrom, FAR_Z, easeIn(p));
        if (p >= 1) { t.mode = 'hidden'; t.group.visible = false; }
      }
      t.group.position.z = t.z;
      t.speed = dt > 0 ? Math.abs(t.z - prev) / dt : 0;
    }
  }

  /* ---------- Дым паровозов ---------- */
  const puffs = [];
  const puffGeo = new THREE.IcosahedronGeometry(0.6, 1);
  for (let i = 0; i < 26; i++) {
    const m = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const p = new THREE.Mesh(puffGeo, m);
    p.visible = false;
    p.userData = { life: 1, vx: 0, vy: 0, vz: 0, spin: 0 };
    scene.add(p);
    puffs.push(p);
  }
  let puffIdx = 0;
  let emitAcc = 0;
  function updateSmoke(dt) {
    if (!reduce) {
      for (const t of Object.values(trains)) {
        if (!t.stack || !t.group.visible) continue;
        const rate = t.speed > 0.5 ? 9 : 1.8;
        emitAcc += dt * rate;
        while (emitAcc >= 1) {
          emitAcc -= 1;
          const p = puffs[puffIdx++ % puffs.length];
          p.position.copy(t.stack).add(t.group.position);
          p.position.x += (Math.random() - 0.5) * 0.2;
          p.userData.life = 0;
          p.userData.vx = (Math.random() - 0.5) * 0.4 + 0.25;
          p.userData.vy = 1.6 + Math.random() * 0.6;
          p.userData.vz = (Math.random() - 0.5) * 0.4;
          p.userData.spin = Math.random() * 2;
          p.material.color.set(t.smokeColor);
          p.visible = true;
        }
      }
    }
    for (const p of puffs) {
      if (!p.visible) continue;
      const u = p.userData;
      u.life += dt / 3.2;
      if (u.life >= 1) { p.visible = false; continue; }
      p.position.x += u.vx * dt;
      p.position.y += u.vy * dt * (1 - u.life * 0.6);
      p.position.z += u.vz * dt;
      p.rotation.y += u.spin * dt;
      p.scale.setScalar(0.6 + u.life * 2.8);
      p.material.opacity = 0.55 * (1 - u.life) * Math.min(1, u.life * 8);
    }
  }

  /* ---------- Переходы «вида» эпохи ---------- */
  function lookOf(i) {
    const e = ERAS[i];
    const o = {};
    for (const k of COLOR_KEYS) o[k] = new THREE.Color(e.look[k]);
    for (const k of NUM_KEYS) o[k] = e.look[k];
    for (const f of FEATS) o['f_' + f] = e.feat[f] ? 1 : 0;
    return o;
  }
  function cloneLook(l) {
    const o = {};
    for (const k in l) o[k] = l[k] instanceof THREE.Color ? l[k].clone() : l[k];
    return o;
  }
  let cur = lookOf(0);
  let from = cloneLook(cur);
  let to = cloneLook(cur);
  let tStart = 0;
  const LOOK_DUR = 2.2;

  const tmpV = new THREE.Vector3();
  function applyLook(l) {
    skyU.top.value.copy(l.skyTop);
    skyU.horizon.value.copy(l.skyHorizon);
    skyU.bottom.value.copy(l.skyBottom);
    skyU.fogC.value.copy(l.fog);
    skyU.sunColor.value.copy(l.sun);
    skyU.sunGlow.value = l.sunGlow;
    scene.fog.color.copy(l.fog);
    scene.fog.near = l.fogNear;
    scene.fog.far = l.fogFar;
    renderer.setClearColor(l.fog);
    renderer.toneMappingExposure = l.exposure;

    const ce = Math.cos(l.sunEl);
    tmpV.set(ce * Math.cos(l.sunAz), Math.sin(l.sunEl), ce * Math.sin(l.sunAz));
    skyU.sunDir.value.copy(tmpV);
    sun.position.copy(TARGET).addScaledVector(tmpV.normalize(), 120);
    if (sun.position.y < 8) sun.position.y = 8; // тени не «ложатся» бесконечно
    sun.color.copy(l.sun);
    sun.intensity = l.sunInt;
    hemi.color.copy(l.hemiSky);
    hemi.groundColor.copy(l.hemiGround);
    hemi.intensity = l.hemiInt;

    M.ground.color.copy(l.ground);
    M.paving.color.copy(l.paving);
    M.wallA.color.copy(l.wallA);
    M.wallB.color.copy(l.wallB);
    M.trim.color.copy(l.trim);
    M.plinth.color.copy(l.plinth);
    M.roof.color.copy(l.roof);
    M.city.color.copy(l.city);
    M.glass.emissive.copy(l.winGlow);
    M.glass.emissiveIntensity = l.win;
    M.door.emissive.copy(l.winGlow);
    M.door.emissiveIntensity = l.win * 0.6;
    M.clockFace.emissiveIntensity = l.win * 0.35;
    M.lampGlass.emissive.copy(l.lampColor);
    M.lampGlass.emissiveIntensity = l.lamp;
    for (const m of haloMats) { m.color.copy(l.lampColor); }
    M.seams.opacity = l.seams * 0.85;
    seamsGroup.visible = l.seams > 0.01;
    spots.forEach((s, k) => { s.intensity = l.facade * (k === 5 ? 380 : 170); });

    for (const f of FEATS) {
      const v = l['f_' + f];
      const g = feats[f];
      g.visible = v > 0.01;
      if (!g.visible) continue;
      const s = Math.max(v, 0.001);
      if (f === 'canopy' || f === 'flag' || f === 'catenary') {
        g.children[0].scale.set(1, s, 1);
      } else {
        g.children.forEach((c) => c.scale.setScalar(s));
      }
      if (f === 'canopy') M.canopyGlass.opacity = 0.3 * v;
    }
    // ореолы фонарей: только у видимых групп
    for (const f of ['gas', 'electric', 'modern']) {
      const v = l['f_' + f];
      feats[f].traverse((o) => { if (o.isSprite) o.material.opacity = Math.min(1, l.halo * v); });
    }
  }

  let targetIdx = 0;
  function setEra(i, instant) {
    const now = performance.now() / 1000;
    targetIdx = i;
    to = lookOf(i);
    if (instant) {
      cur = cloneLook(to);
      from = cloneLook(to);
      tStart = -1e9;
      applyLook(cur);
    } else {
      from = cloneLook(cur);
      tStart = now;
    }
    setTrain(ERAS[i].train, instant, now);
  }

  function stepLook(now) {
    const p = Math.min((now - tStart) / LOOK_DUR, 1);
    if (p >= 1 && tStart < 0) return;
    const k = easeInOut(p);
    for (const key in to) {
      if (to[key] instanceof THREE.Color) cur[key].copy(from[key]).lerp(to[key], k);
      else {
        let fk = k;
        // элементы появляются чуть позже, исчезают чуть раньше — читается как «смена декораций»
        if (key.startsWith('f_')) fk = to[key] > from[key] ? easeInOut(Math.max(0, (p - 0.35) / 0.65)) : easeInOut(Math.min(1, p / 0.65));
        cur[key] = from[key] + (to[key] - from[key]) * fk;
      }
    }
    applyLook(cur);
    if (p >= 1) tStart = -1;
  }

  /* ---------- Камера и управление ---------- */
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 26;
  controls.maxDistance = 125;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.42;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.autoRotateSpeed = -0.35;
  controls.autoRotate = !reduce;
  canvas.style.touchAction = 'pan-y'; // вертикальный свайп прокручивает страницу-хост
  let lastUser = -1e9;
  controls.addEventListener('start', () => { controls.autoRotate = false; lastUser = performance.now(); interact(); });
  controls.addEventListener('end', () => { lastUser = performance.now(); });

  function initialCamera(aspect) {
    const r = aspect < 0.8 ? 86 : aspect < 1.2 ? 84 : 68;
    const sph = new THREE.Spherical(r, 1.36, 0.74);
    camera.position.copy(TARGET).add(new THREE.Vector3().setFromSpherical(sph));
    controls.update();
  }

  let W = 1, H = 1;
  function resize() {
    const rect = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const narrow = W < 721;
    camera.fov = W / H < 0.8 ? 48 : 36;
    // сдвигаем кадр так, чтобы здание не пряталось под карточкой
    if (narrow) camera.setViewOffset(W, H, -Math.round(W * 0.04), Math.round(H * 0.15), W, H);
    else camera.setViewOffset(W, H, -Math.round(W * 0.1), Math.round(H * 0.06), W, H);
    camera.updateProjectionMatrix();
    const ms = narrow ? 1024 : 2048;
    if (sun.shadow.mapSize.x !== ms) {
      sun.shadow.mapSize.set(ms, ms);
      if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
    }
  }
  resize();
  initialCamera(W / H);
  new ResizeObserver(resize).observe(stage);

  /* ---------- Цикл рендера ---------- */
  let inView = true;
  new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; }, { threshold: 0.01 }).observe(stage);
  let lastT = performance.now() / 1000;
  let clockMin = -1;
  let prevSmoke = lastT;

  function updateClock() {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    const key = Math.floor(m * 4);
    if (key === clockMin) return;
    clockMin = key;
    const hA = (((d.getHours() % 12) + m / 60) / 12) * Math.PI * 2;
    const mA = (m / 60) * Math.PI * 2;
    for (const h of clockHands) { h.hourH.rotation.z = -hA; h.minH.rotation.z = -mA; }
  }

  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    const dt = Math.min(now - lastT, 0.05);
    lastT = now;
    if (document.hidden || !inView) return;
    if (!reduce && !controls.autoRotate && performance.now() - lastUser > 9000) controls.autoRotate = true;
    controls.update();
    sky.position.copy(camera.position);
    stepLook(now);
    updateTrains(now, dt);
    updateSmoke(Math.min(now - prevSmoke, 0.25));
    prevSmoke = now;
    updateClock();
    renderer.render(scene, camera);
  }

  applyLook(cur);
  setEra(0, true);
  requestAnimationFrame(frame);

  return {
    setEra,
    setReduce(r) {
      controls.autoRotate = !r;
      if (r) setEra(targetIdx, true);
    },
    renderer,
  };
}

/* ------------------------------------------------------------------ */
/* Запуск                                                               */
/* ------------------------------------------------------------------ */
function showFallback() {
  document.body.classList.add('no-webgl');
  $('fallback').hidden = false;
  canvas.removeAttribute('role');
  canvas.setAttribute('aria-hidden', 'true');
  $('hint').hidden = true;
}

if (webglAvailable()) {
  try {
    world = createWorld();
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
  } catch (err) {
    world = null;
    showFallback();
  }
} else {
  showFallback();
}

setPaused(ui.userPaused);
goTo(0, { instant: true });
requestAnimationFrame(uiTick);

// Небольшой хук для встраивания/тестов: window.leningradCarousel.goTo(3)
window.leningradCarousel = {
  goTo: (i) => goTo(i, { user: true }),
  pause: () => setPaused(true),
  play: () => setPaused(false),
  get index() { return ui.idx; },
  get webgl() { return !!world; },
};
