/*
 * «Историческая карусель» — Ленинградский вокзал (Москва), три эпохи.
 * Процедурная модель здания К. Тона в реальном масштабе (метры), перроны тупикового вокзала,
 * поезда по эпохам, люди для масштаба, соседние вокзалы и город.
 * Three.js r160 подключён локально из ./vendor.
 */
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

/* Внешние модели (необязательно). Чтобы подключить готовую модель «Сапсана», положите файл
 * в carousel/models/sapsan.glb и укажите путь ниже. По умолчанию запросов нет — без 404 в консоли.
 * sapsanFlip: true, если нос модели смотрит в −Z. */
const MODELS = { sapsan: null /* 'models/sapsan.glb' */, sapsanFlip: false };

/* ------------------------------------------------------------------ */
/* Данные эпох                                                          */
/* ------------------------------------------------------------------ */
const ERAS = [
  {
    era: 'Царская', short: '1851', year: '1851', period: '1851–1917',
    title: 'Царская эпоха',
    text: 'Петербургский вокзал — первый вокзал Москвы — открыт в 1851 году по проекту архитектора Константина Тона. С 1855 года он называется Николаевским. Поезда водили американские паровозы типа 2-2-0 Александровского завода.',
    desc: 'тёплое утро на пустом Каланчёвском поле, булыжная мостовая, масляные фонари и извозчики, паровоз 2-2-0 с трубой-воронкой и вагоны трёх классов под деревянным дебаркадером, флагшток на башне',
    train: 'steam51',
    filter: 'sepia(0.22) saturate(0.92) contrast(1.02)',
    vignette: 0.32,
    fb: { sky: '#eadcc0', wall: '#d6bb90', wall2: '#b98a5e', glow: '#4a3d30' },
    look: {
      skyTop: '#7fa2c4', skyHorizon: '#f3e2c2', skyBottom: '#cdbb9a', fog: '#eadcbe', fogNear: 140, fogFar: 560, cloudC: '#fbf3e4', cloud: 0.55,
      sun: '#ffdcae', sunInt: 3.0, sunAz: 0.75, sunEl: 0.42,
      hemiSky: '#e8eef2', hemiGround: '#7a6a50', hemiInt: 0.85,
      ground: '#8f7e62', paving: '#b5a58a', road: '#8f7e62', edgeC: '#d8d0bf',
      wallA: '#dcc39a', wallB: '#b98a5e', trim: '#f1e9d8', plinth: '#8f8a80', roof: '#5f7a68',
      city: '#d2c4a8', winGlow: '#ffcf8a', win: 0.06, lampColor: '#ffc070', lamp: 0.6, halo: 0.15,
      facade: 0, exposure: 1.0, sunGlow: 0.55, env: 0.55, cityGlow: 0,
    },
    feat: { gasSq: 1, gasLow: 1, carriages: 1, pole: 1, shed: 1, platLow: 1, cityLow: 1, people1: 1 },
  },
  {
    era: 'Советская', short: 'XX век', year: 'XX век', period: '1920–1970-е',
    title: 'Советская эпоха',
    text: 'В 1923 году вокзал переименовали в Октябрьский, затем — в Ленинградский. На рубеже 1940–1950-х интерьеры реставрировали по проекту Алексея Душкина. В 1960-е слева появилась трёхэтажная пристройка, а в 1970-е вокзал расширили.',
    desc: 'пасмурный день, асфальт, легковые машины и автобус на площади, Ярославский и Казанский вокзалы рядом, трёхэтажная пристройка слева, башня без флагштока, контактная сеть, электровоз и тёмно-красные вагоны',
    train: 'electro',
    filter: 'sepia(0.1) saturate(0.78) contrast(1.02)',
    vignette: 0.16,
    fb: { sky: '#d9dcd6', wall: '#d6b673', wall2: '#cfae6c', glow: '#3e3a33' },
    look: {
      skyTop: '#8d9db0', skyHorizon: '#dcdcd6', skyBottom: '#b9b5aa', fog: '#d5d4cd', fogNear: 120, fogFar: 520, cloudC: '#eeeeec', cloud: 0.95,
      sun: '#fdf4e4', sunInt: 1.5, sunAz: 0.5, sunEl: 0.75,
      hemiSky: '#e4e8ec', hemiGround: '#6a6458', hemiInt: 1.5,
      ground: '#76736c', paving: '#8e8b84', road: '#55555a', edgeC: '#ece7da',
      wallA: '#d8b874', wallB: '#d2b06c', trim: '#f0e8d4', plinth: '#8a857c', roof: '#6b746f',
      city: '#c6c0b4', winGlow: '#fff0c8', win: 0.08, lampColor: '#fff3d8', lamp: 0.5, halo: 0.12,
      facade: 0, exposure: 1.0, sunGlow: 0.15, env: 0.7, cityGlow: 0.05,
    },
    feat: {
      electric: 1, cars: 1, trees: 1, annex: 1, superstr: 1, sign: 1, catenary: 1, platHigh: 1, tracksX: 1,
      cityMid: 1, neighbors: 1, people2: 1,
    },
  },
  {
    era: 'Настоящее', short: '2026', year: '2026', period: 'после реконструкции 2024–2026',
    title: 'Настоящее',
    text: 'Закрытый 11 августа 2024 года вокзал вновь открылся 22 мая 2026-го. Фасаду вернули цвета, зафиксированные на снимке 1873 года, на башне восстановили исторический флагшток. Выходы к поездам — под новым стеклянным дебаркадером.',
    desc: 'синие сумерки, тёплая подсветка фасада и фонари в стиле масляных, двухцветный оштукатуренный фасад со светлыми тягами и наличниками, флагшток с флагом, стеклянный дебаркадер и «Сапсан»',
    train: 'sapsan',
    filter: 'sepia(0) saturate(1.04) contrast(1.03)',
    vignette: 0.26,
    fb: { sky: '#3a3f63', wall: '#d9bd90', wall2: '#b4835a', glow: '#ffbf73' },
    look: {
      skyTop: '#1b2c5c', skyHorizon: '#f09a68', skyBottom: '#3a3240', fog: '#7a6478', fogNear: 120, fogFar: 560, cloudC: '#c98a86', cloud: 0.45,
      sun: '#ff9b5e', sunInt: 0.8, sunAz: -2.2, sunEl: 0.06,
      hemiSky: '#7488c0', hemiGround: '#40332e', hemiInt: 1.25,
      ground: '#4a4950', paving: '#9a958c', road: '#3f3f44', edgeC: '#e3c13a',
      wallA: '#dcc39a', wallB: '#b98a5e', trim: '#f6efe0', plinth: '#7f786f', roof: '#5d6a62',
      city: '#4a4658', winGlow: '#ffb35c', win: 0.85, lampColor: '#ffb45a', lamp: 3.0, halo: 0.9,
      facade: 1, exposure: 1.2, sunGlow: 1.0, env: 0.3, cityGlow: 1.0,
    },
    feat: {
      gasSq: 1, gasHigh: 1, canopy: 1, pole: 1, flag: 1, catenary: 1, trees: 1, annex: 1, superstr: 1,
      sign: 1, platHigh: 1, tracksX: 1, cityMid: 1, cityHigh: 1, neighbors: 1, people3: 1,
    },
  },
];
const N = ERAS.length;
const FEATS = ['gasSq', 'gasLow', 'gasHigh', 'electric', 'carriages', 'cars', 'trees', 'annex', 'superstr', 'sign',
  'pole', 'flag', 'catenary', 'shed', 'canopy', 'platLow', 'platHigh', 'tracksX', 'cityLow', 'cityMid',
  'cityHigh', 'neighbors', 'people1', 'people2', 'people3'];
const COLOR_KEYS = ['skyTop', 'skyHorizon', 'skyBottom', 'fog', 'cloudC', 'sun', 'hemiSky', 'hemiGround', 'ground',
  'paving', 'road', 'edgeC', 'wallA', 'wallB', 'trim', 'plinth', 'roof', 'city', 'winGlow', 'lampColor'];
const NUM_KEYS = ['fogNear', 'fogFar', 'cloud', 'sunInt', 'sunAz', 'sunEl', 'hemiInt', 'win', 'lamp', 'halo', 'facade',
  'exposure', 'sunGlow', 'env', 'cityGlow'];

/* ------------------------------------------------------------------ */
/* UI карусели (работает и без WebGL)                                   */
/* ------------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const canvas = $('scene');
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches;
const SMALL = window.matchMedia('(max-width: 720px)').matches;

const AUTOPLAY_MS = 7000;
const HOLD_MS = 15000;
const ui = { idx: 0, userPaused: reduce, holdUntil: 0, hoverHold: false, focusHold: false, elapsed: 0, last: performance.now() };
let world = null;

const timeline = $('timeline');
const yearBtns = ERAS.map((e, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'year-btn';
  const nm = document.createElement('span');
  nm.className = 'yb-name';
  nm.textContent = e.era;
  const dot = document.createElement('span');
  dot.className = 'visually-hidden';
  dot.textContent = ' · ';
  const yr = document.createElement('span');
  yr.className = 'yb-years';
  yr.textContent = e.short;
  b.append(nm, dot, yr);
  b.addEventListener('click', () => { interact(); goTo(i, { user: true }); });
  li.appendChild(b);
  timeline.appendChild(li);
  return b;
});
$('eraTotal').textContent = String(N);

function canvasLabel(e) {
  return `Трёхмерная модель Ленинградского вокзала. ${e.title}, ${e.period}. На сцене: ${e.desc}.`;
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
  $('eraPeriod').textContent = e.period;
  $('eraTitle').textContent = e.title;
  $('eraText').textContent = e.text;
  if (changed && !reduce) {
    card.classList.remove('is-changing');
    void card.offsetWidth;
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
  if (user) $('announcer').textContent = `${e.title}, ${e.period}. ${e.text}`;
  if (world) world.setEra(i, instant || reduce);
}

function scrollTimelineTo(btn) {
  const wrap = timeline.parentElement;
  if (wrap.scrollWidth <= wrap.clientWidth) return;
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

const moreBtn = $('moreBtn');
moreBtn.addEventListener('click', () => {
  const open = moreBtn.getAttribute('aria-expanded') !== 'true';
  moreBtn.setAttribute('aria-expanded', String(open));
  moreBtn.textContent = open ? 'Скрыть' : 'Подробнее';
  $('card').classList.toggle('is-open', open);
  interact();
});

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
  const dt = Math.min(Math.max(now - ui.last, 0), 10000);
  ui.last = now;
  const holding = ui.userPaused || reduce || ui.hoverHold || ui.focusHold || now < ui.holdUntil || document.hidden;
  if (!holding) {
    ui.elapsed += dt;
    if (ui.elapsed >= AUTOPLAY_MS) goTo(ui.idx + 1);
  }
  progressBar.style.transform = `scaleX(${holding ? 0 : Math.min(ui.elapsed / AUTOPLAY_MS, 1)})`;
  requestAnimationFrame(uiTick);
}

// после возврата во вкладку не «догоняем» пропущенное время
document.addEventListener('visibilitychange', () => { ui.last = performance.now(); });

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
const wheel = (r, t = 0.14) => new THREE.CylinderGeometry(r, r, t, 16).rotateZ(Math.PI / 2);
const sphere = (r, w = 16, h = 10) => new THREE.SphereGeometry(r, w, h);

/** Сливает неиндексированные геометрии; переносит color, если он есть у всех. */
function merge(list) {
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const withColor = list.every((g) => g.attributes.color);
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const col = withColor ? new Float32Array(n * 3) : null;
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    if (col) col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}
/** UV по мировым координатам (box-проекция) — текстуры в метрах, без растяжений. */
function worldUV(geo, s) {
  const p = geo.attributes.position.array;
  const nn = geo.attributes.normal.array;
  const uv = new Float32Array((p.length / 3) * 2);
  for (let i = 0, j = 0; i < p.length; i += 3, j += 2) {
    const ax = Math.abs(nn[i]), ay = Math.abs(nn[i + 1]), az = Math.abs(nn[i + 2]);
    if (ay >= ax && ay >= az) { uv[j] = p[i] / s; uv[j + 1] = p[i + 2] / s; }
    else if (ax >= az) { uv[j] = p[i + 2] / s; uv[j + 1] = p[i + 1] / s; }
    else { uv[j] = p[i] / s; uv[j + 1] = p[i + 1] / s; }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Собирает геометрию по ключам материалов и сливает в несколько мешей. */
class Batch {
  constructor() { this.m = new Map(); }
  add(key, geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    if (g.attributes.uv) g.deleteAttribute('uv');
    if (!this.m.has(key)) this.m.set(key, []);
    this.m.get(key).push(g);
    return this;
  }
  /** Элемент на плоскости фасада: u — вдоль фасада, v — высота, d — от стены наружу. */
  face(key, geo, f, u, v, d) {
    const c = Math.cos(f.ry), s = Math.sin(f.ry);
    return this.add(key, place(geo, f.x + u * c + d * s, v, f.z - u * s + d * c, f.ry));
  }
  build(mats, { cast = true, receive = true, noShadow = [] } = {}) {
    const grp = new THREE.Group();
    for (const [key, list] of this.m) {
      const mat = mats[key];
      const geo = merge(list);
      if (mat.map || mat.bumpMap || mat.emissiveMap) worldUV(geo, mat.userData.uvs || 4);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = cast && !noShadow.includes(key);
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

/** Вальмовая крыша: основание w×d на y=0, высота h, конёк вдоль длинной стороны. */
function hipRoof(w, d, h) {
  if (w < d) return hipRoof(d, w, h).rotateY(Math.PI / 2);
  const hw = w / 2, hd = d / 2, r = Math.max(0.01, hw - hd);
  const A = [-hw, 0, -hd], B = [hw, 0, -hd], C = [hw, 0, hd], D = [-hw, 0, hd];
  const R1 = [-r, h, 0], R2 = [r, h, 0];
  const tris = [D, C, R2, D, R2, R1, B, A, R1, B, R1, R2, C, B, R2, A, D, R1];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat()), 3));
  g.computeVertexNormals();
  return g;
}

/**
 * «Лофт» по поперечному сечению: profile — замкнутый контур [x, y, colorKey] (против часовой при взгляде с +Z),
 * rings — [{z, sx, sy, dy, t}], yb — базовая линия масштабирования по высоте. Цвета — атрибут color.
 */
function loft(profile, rings, yb, colorFn, { capFront = false, tip = 0.2, closed = true } = {}) {
  const M = profile.length, R = rings.length;
  const pos = [], col = [], idx = [];
  for (let r = 0; r < R; r++) {
    const ring = rings[r];
    for (let i = 0; i < M; i++) {
      const [x, y, k] = profile[i];
      pos.push(x * ring.sx, yb + (y - yb) * ring.sy + (ring.dy || 0), ring.z);
      const c = colorFn(k, ring.t || 0, y, x);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let r = 0; r < R - 1; r++) {
    for (let i = 0; i < (closed ? M : M - 1); i++) {
      const a = r * M + i, b = r * M + ((i + 1) % M), cc = (r + 1) * M + i, d = (r + 1) * M + ((i + 1) % M);
      idx.push(a, b, cc, b, d, cc);
    }
  }
  if (capFront) {
    const r = R - 1, ring = rings[r];
    let cy = 0;
    for (let i = 0; i < M; i++) cy += pos[(r * M + i) * 3 + 1];
    cy /= M;
    const ci = pos.length / 3;
    pos.push(0, cy, ring.z + tip);
    const c = colorFn(profile[0][2], 1, profile[0][1], 0);
    col.push(c.r, c.g, c.b);
    for (let i = 0; i < M; i++) idx.push(r * M + i, r * M + ((i + 1) % M), ci);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function std(color, rough = 0.85, metal = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ------------------------------------------------------------------ */
/* Процедурные canvas-текстуры                                          */
/* ------------------------------------------------------------------ */
const TEX = SMALL ? 256 : 512;
function canvasTex(draw, { size = TEX, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d', { willReadFrequently: true });
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
function noise(g, S, base, ampCoarse, ampFine, seed, cells = 16) {
  const r = rng(seed);
  const sm = document.createElement('canvas');
  sm.width = sm.height = cells;
  const sg = sm.getContext('2d');
  const id = sg.createImageData(cells, cells);
  for (let i = 0; i < cells * cells; i++) {
    const v = base + (r() - 0.5) * 2 * ampCoarse;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
    id.data[i * 4 + 3] = 255;
  }
  sg.putImageData(id, 0, 0);
  g.imageSmoothingEnabled = true;
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) g.drawImage(sm, dx * S, dy * S, S, S);
  const im = g.getImageData(0, 0, S, S);
  for (let i = 0; i < S * S; i++) {
    const f = (r() - 0.5) * 2 * ampFine;
    im.data[i * 4] += f; im.data[i * 4 + 1] += f; im.data[i * 4 + 2] += f;
  }
  g.putImageData(im, 0, 0);
}
const T = {
  plaster: () => canvasTex((g, S) => noise(g, S, 236, 9, 7, 11)),
  roof: () => canvasTex((g, S) => {
    noise(g, S, 220, 6, 5, 21);
    const step = S / 6.6; // фальц через ~0,6 м при тайле 4 м
    for (let x = 0; x < S; x += step) {
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x, 0, Math.max(1, S / 170), S);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + S / 170, 0, Math.max(1, S / 256), S);
    }
  }),
  rust: () => canvasTex((g, S) => {
    noise(g, S, 236, 8, 6, 13);
    const n = 5, c = S / n; // горизонтальные русты через 0,6 м при тайле 3 м
    for (let k = 0; k < n; k++) {
      const y = k * c;
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, y, S, Math.max(2, S / 120));
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, y + Math.max(2, S / 120), S, Math.max(1, S / 256));
    }
  }),
  cobble: () => canvasTex((g, S) => {
    const r = rng(9);
    g.fillStyle = '#5e5547'; g.fillRect(0, 0, S, S);
    const n = 22, c = S / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const l = 52 + r() * 22;
      g.fillStyle = `hsl(35 12% ${l}%)`;
      g.beginPath();
      g.ellipse((x + 0.5 + (r() - 0.5) * 0.25) * c, (y + 0.5 + (r() - 0.5) * 0.25) * c, c * 0.44, c * 0.4, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
  }),
  asphalt: () => canvasTex((g, S) => noise(g, S, 200, 10, 14, 31, 24)),
  granite: () => canvasTex((g, S) => {
    const r = rng(41);
    noise(g, S, 222, 4, 9, 41);
    const n = 5, c = S / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.03 + r() * 0.06})`;
      g.fillRect(x * c, y * c, c, c);
    }
    g.fillStyle = 'rgba(40,40,40,0.35)';
    for (let i = 0; i <= n; i++) { g.fillRect(i * c - 1, 0, 2, S); g.fillRect(0, i * c - 1, S, 2); }
  }),
  cityWalls: () => canvasTex((g, S) => {
    g.fillStyle = '#e9e5dc'; g.fillRect(0, 0, S, S);
    const n = 4, c = S / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = '#4a5058';
      g.fillRect(x * c + c * 0.28, y * c + c * 0.22, c * 0.44, c * 0.5);
    }
    g.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < n; y++) g.fillRect(0, y * c + c * 0.9, S, c * 0.05);
  }),
  cityLit: () => canvasTex((g, S) => {
    const r = rng(77);
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    const n = 4, c = S / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (r() < 0.55) {
        g.fillStyle = r() < 0.7 ? '#ffd28a' : '#fff1d8';
        g.fillRect(x * c + c * 0.28, y * c + c * 0.22, c * 0.44, c * 0.5);
      }
    }
  }),
  contact: () => canvasTex((g, S) => {
    const gr = g.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
  }, { size: 128, srgb: false }),
};
function signTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = '#6b1d24';
  g.font = '700 74px "PT Sans", Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('ЛЕНИНГРАДСКИЙ ВОКЗАЛ', 512, 68, 990);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
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
  scene.fog = new THREE.Fog(0xeadcbe, 140, 560);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(36, 1, 1, 3000);
  const TARGET = new THREE.Vector3(2, 11.5, -8);

  /* ---------- Текстуры и материалы ---------- */
  const tx = {
    plaster: T.plaster(), roof: T.roof(), rust: T.rust(), cobble: T.cobble(), asphalt: T.asphalt(),
    granite: T.granite(), cityWalls: T.cityWalls(), cityLit: T.cityLit(), contact: T.contact(),
  };
  const ENV = []; // [материал, базовая envMapIntensity]
  function M_(color, rough, metal, extra = {}, env = 0.5, uvs) {
    const m = std(color, rough, metal, extra);
    m.envMapIntensity = env;
    if (uvs) m.userData.uvs = uvs;
    ENV.push([m, env]);
    return m;
  }
  const M = {
    wallA: M_('#dcc39a', 0.92, 0, { map: tx.plaster, bumpMap: tx.plaster, bumpScale: 0.6 }, 0.45, 3),
    wallB: M_('#b98a5e', 0.92, 0, { map: tx.plaster, bumpMap: tx.plaster, bumpScale: 0.6 }, 0.45, 3),
    trim: M_('#f1e9d8', 0.8, 0, { map: tx.plaster, bumpMap: tx.plaster, bumpScale: 0.4 }, 0.5, 2),
    plinth: M_('#8f8a80', 0.9, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 1.2 }, 0.4, 2),
    roof: M_('#5f7a68', 0.55, 0.3, { map: tx.roof, bumpMap: tx.roof, bumpScale: 0.8 }, 0.6, 4),
    dome: M_('#5c7d68', 0.55, 0.25, {}, 0.8),
    glass: M_('#1d2833', 0.08, 0.0, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.05 }, 1.2),
    door: M_('#3b2a1e', 0.5, 0.0, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.03 }, 0.6),
    dark: M_('#2b2a28', 0.6, 0.3, {}, 0.5),
    gold: M_('#c9a24a', 0.35, 0.8, {}, 1.0),
    bronze: M_('#6b5a3a', 0.45, 0.7, {}, 0.9),
    clockFace: M_('#f4eedf', 0.5, 0, { emissive: new THREE.Color('#fff1cf'), emissiveIntensity: 0 }, 0.5),
    rustA: M_('#dcc39a', 0.92, 0, { map: tx.rust, bumpMap: tx.rust, bumpScale: 1.2 }, 0.45, 3),
    rustB: M_('#b98a5e', 0.92, 0, { map: tx.rust, bumpMap: tx.rust, bumpScale: 1.2 }, 0.45, 3),
    ground: M_('#8f7e62', 1, 0, {}, 0.3),
    paving: M_('#b5a58a', 0.95, 0, { map: tx.cobble, bumpMap: tx.cobble, bumpScale: 1.2 }, 0.35, 3),
    road: M_('#55555a', 0.95, 0, { map: tx.asphalt }, 0.3, 6),
    platform: M_('#a29c90', 0.95, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 0.6 }, 0.35, 4),
    platWood: M_('#7a6a55', 0.9, 0, {}, 0.3),
    edge: M_('#e3c13a', 0.8, 0, {}, 0.4),
    ballast: M_('#5a5249', 1, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 2 }, 0.2, 1.5),
    rail: M_('#7a7a7a', 0.4, 0.8, {}, 0.8),
    sleeper: M_('#4a3b2e', 1, 0, {}, 0.2),
    city: M_('#c6c0b4', 0.9, 0, { map: tx.cityWalls, emissive: new THREE.Color('#ffffff'), emissiveMap: tx.cityLit, emissiveIntensity: 0 }, 0.3, 12),
    cityRoof: M_('#6e6a66', 0.9, 0, {}, 0.3),
    tree: M_('#55703f', 0.95, 0, {}, 0.3),
    trunk: M_('#5a4632', 1, 0, {}, 0.2),
    lampGlass: M_('#fff1d0', 0.4, 0, { emissive: new THREE.Color('#ffc070'), emissiveIntensity: 0.8 }, 0.5),
    iron: M_('#26262a', 0.55, 0.5, {}, 0.6),
    steel: M_('#9aa2a8', 0.4, 0.75, {}, 1.0),
    wood: M_('#5b4636', 0.85, 0, {}, 0.3),
    canopyGlass: new THREE.MeshStandardMaterial({
      color: '#c8dbe6', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18,
      side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5,
    }),
    strip: M_('#fff6e2', 0.4, 0, { emissive: new THREE.Color('#ffe2b0'), emissiveIntensity: 1 }, 0.3),
    horse: M_('#5b3a24', 0.9, 0, {}, 0.3),
    coach: M_('#2f1d1a', 0.5, 0.1, {}, 0.6),
    wheelW: M_('#2a211b', 0.8, 0, {}, 0.3),
    sign: new THREE.MeshStandardMaterial({ map: signTexture(), roughness: 0.6 }),
    contact: new THREE.MeshBasicMaterial({ alphaMap: tx.contact, transparent: true, opacity: 0.45, depthWrite: false, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2 }),
    flagW: new THREE.MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.8, side: THREE.DoubleSide }),
    flagB: new THREE.MeshStandardMaterial({ color: '#1c3f94', roughness: 0.8, side: THREE.DoubleSide }),
    flagR: new THREE.MeshStandardMaterial({ color: '#c01c28', roughness: 0.8, side: THREE.DoubleSide }),
    car1: M_('#e6e1d4', 0.4, 0.3, {}, 0.9), car2: M_('#2f4f7a', 0.4, 0.3, {}, 0.9), car3: M_('#7a2a24', 0.4, 0.3, {}, 0.9),
    car4: M_('#c9b37a', 0.4, 0.3, {}, 0.9), busC: M_('#d9b23a', 0.5, 0.2, {}, 0.8),
  };
  ENV.push([M.canopyGlass, 1.5]);
  // trimN/wallN* — мелкие детали без теней (нет «лесенок» shadow acne)
  const MK = { ...M, trimN: M.trim, wallN: M.wallA, wallNB: M.wallB };

  /* ---------- Небо с облаками ---------- */
  const skyU = {
    top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
    fogC: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: new THREE.Color() }, sunGlow: { value: 0.5 }, cloudC: { value: new THREE.Color() }, cloud: { value: 0.5 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1400, 32, 16),
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
        uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunGlow; uniform vec3 cloudC; uniform float cloud;
        varying vec3 vDir;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.07; a *= 0.5; } return s; }
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.6));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          if (h > 0.0) {
            vec2 cp = d.xz / (h + 0.18) * 1.4;
            float n = fbm(cp + vec2(3.1, 7.7));
            float cl = smoothstep(0.62 - cloud * 0.22, 0.95, n) * smoothstep(0.0, 0.18, h) * min(cloud * 1.4, 1.0);
            vec3 cc = cloudC * (0.82 + 0.25 * n) + sunColor * pow(s, 6.0) * 0.25 * sunGlow;
            c = mix(c, cc, cl * 0.85);
          }
          c = mix(fogC, c, smoothstep(-0.02, 0.1, h));
          if (h < -0.02) c = mix(fogC, bottom, clamp(-h * 3.0, 0.0, 1.0));
          c += sunColor * (pow(s, 700.0) * 2.0 + pow(s, 14.0) * 0.3 + pow(s, 3.0) * 0.1) * sunGlow * step(-0.05, h);
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
  const SH = SMALL ? 1024 : 2048;
  sun.shadow.mapSize.set(SH, SH);
  const sc = sun.shadow.camera;
  sc.left = -95; sc.right = 95; sc.top = 95; sc.bottom = -95; sc.near = 20; sc.far = 600;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  const SUN_T = new THREE.Vector3(0, 0, -10);
  sun.target.position.copy(SUN_T);
  scene.add(sun, sun.target);

  // Тёплая архитектурная подсветка (только «Настоящее»), без теней
  const spots = [];
  for (const [x, y, z, tx2, ty, tz, base] of [
    [-24, 0.6, 34, -14, 7, 10, 900], [24, 0.6, 34, 14, 7, 10, 900], [0, 14, 34, 0, 24, 3.3, 1300],
  ]) {
    const s = new THREE.SpotLight(0xffb066, 0, 90, 0.55, 0.9, 1.4);
    s.position.set(x, y, z);
    s.target.position.set(tx2, ty, tz);
    s.userData.base = base;
    scene.add(s, s.target);
    spots.push(s);
  }

  /* ---------- Эпоховые группы с плавным появлением (прозрачностью) ---------- */
  const feats = {};
  const fadeLists = {};
  function featGroup(name) {
    const g = new THREE.Group();
    g.name = name;
    feats[name] = g;
    scene.add(g);
    return g;
  }
  /** Клонирует материалы группы, чтобы растворять её независимо от остальной сцены. */
  function makeFadeable(name) {
    const cache = new Map();
    const list = [];
    feats[name].traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      if (!cache.has(m)) {
        const c = m.clone();
        cache.set(m, c);
        list.push({ orig: m, clone: c, baseOpacity: m.opacity, baseTransparent: m.transparent, baseDW: m.depthWrite });
      }
      o.material = cache.get(m);
    });
    fadeLists[name] = list;
  }
  function applyFade(name, v) {
    const g = feats[name];
    g.visible = v > 0.004;
    if (!g.visible) return;
    const fading = v < 0.995;
    for (const e of fadeLists[name]) {
      const { orig: o, clone: c } = e;
      if (o.color) c.color.copy(o.color);
      if (o.emissive) { c.emissive.copy(o.emissive); c.emissiveIntensity = o.emissiveIntensity; }
      c.envMapIntensity = o.envMapIntensity;
      const tr = e.baseTransparent || fading;
      if (c.transparent !== tr) { c.transparent = tr; c.needsUpdate = true; }
      c.opacity = e.baseOpacity * (fading ? v : 1);
      c.depthWrite = e.baseDW && v > 0.5;
    }
  }

  /* ---------- Земля, площадь, дороги ---------- */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1500, 48).rotateX(-Math.PI / 2), M.ground);
  ground.receiveShadow = true;
  scene.add(ground);
  {
    const b = new Batch();
    b.add('paving', place(box(124, 0.08, 46), 0, 0.04, 34.5));
    b.add('road', place(box(260, 0.06, 16), 0, 0.03, 66));
    b.add('road', place(box(16, 0.06, 140), 70, 0.03, 0));
    scene.add(b.build(MK, { cast: false }));
  }
  const PAVE = [tx.cobble, tx.asphalt, tx.granite];

  /* ---------- Здание вокзала (≈54 × 22 м, этажи ≈6 и ≈5,4 м) ---------- */
  const bld = new Batch();
  const clockHands = [];

  const Y_MID = 6.6, Y_TOP = 12.0;
  function addArch(f, u, v, w, h, glassKey = 'glass') {
    const fw = 0.2;
    bld.face('trimN', new THREE.ShapeGeometry(archShape(w + fw * 2, h + fw), 12), f, u, v, 0.03);
    bld.face(glassKey, new THREE.ShapeGeometry(archShape(w, h), 12), f, u, v, 0.05);
    bld.face('trimN', box(0.08, h - w / 2, 0.04), f, u, v + (h - w / 2) / 2, 0.07);
    bld.face('trimN', box(w, 0.08, 0.04), f, u, v + h - w / 2, 0.07);
    bld.face('trimN', box(w + 0.6, 0.14, 0.3), f, u, v - 0.07, 0.15); // подоконник
    bld.face('trimN', box(0.34, 0.5, 0.18), f, u, v + h + fw - 0.12, 0.1); // замковый камень
  }
  /** Сдвоенное окно под общей архивольтой с «гирькой» между арками. */
  function addPaired(f, u, v, w, h, wallKey = 'wallN') {
    const fw = 0.22;
    bld.face('trimN', new THREE.ShapeGeometry(archShape(w + fw * 2, h + fw), 14), f, u, v, 0.03);
    bld.face(wallKey, new THREE.ShapeGeometry(archShape(w, h), 14), f, u, v, 0.045);
    const sw = w * 0.4, sh = h - w / 2 - 0.15;
    for (const s of [-1, 1]) {
      bld.face('glass', new THREE.ShapeGeometry(archShape(sw, sh), 10), f, u + s * w * 0.26, v, 0.06);
      bld.face('trimN', box(0.06, sh - sw / 2, 0.03), f, u + s * w * 0.26, v + (sh - sw / 2) / 2, 0.075);
    }
    bld.face('glass', new THREE.CircleGeometry(w * 0.15, 14), f, u, v + h - w * 0.38, 0.06); // окулюс
    bld.face('trimN', box(0.16, sh - 0.05, 0.12), f, u, v + (sh - 0.05) / 2, 0.08); // средний столбик
    bld.face('trimN', cyl(0.07, 0.11, 0.4, 8), f, u, v + sh - 0.1, 0.16); // «гирька»
    bld.face('trimN', box(w + 0.7, 0.14, 0.3), f, u, v - 0.07, 0.15);
    bld.face('trimN', box(0.36, 0.5, 0.18), f, u, v + h + fw - 0.12, 0.1);
  }
  /** Приставная колонка: база, ствол, капитель. */
  function column(f, u, v0, v1, r) {
    bld.face('trim', box(r * 2.8, 0.35, r * 2.4), f, u, v0 + 0.175, r * 1.1);
    bld.face('trim', cyl(r * 0.92, r, v1 - v0 - 0.75, 12), f, u, (v0 + v1) / 2, r * 1.0);
    bld.face('trim', box(r * 2.9, 0.18, r * 2.5), f, u, v1 - 0.29, r * 1.1);
    bld.face('trim', box(r * 3.3, 0.22, r * 2.8), f, u, v1 - 0.11, r * 1.2);
  }
  function quoins(f, u, v0, v1) {
    let alt = false;
    const dir = u > 0 ? -1 : 1;
    for (let v = v0; v < v1 - 0.3; v += 0.62) {
      const w = alt ? 0.95 : 0.62;
      bld.face('trimN', box(w, 0.54, 0.12), f, u + dir * w / 2, v + 0.3, 0.06);
      alt = !alt;
    }
  }
  /** Рустовка 1-го этажа: горизонтальные русты по окрашенной штукатурке (не кирпич). */
  function rustSkin(f, u, len, key = 'rustA', v0 = 0.9, v1 = Y_MID - 0.2) {
    bld.face(key, box(len, v1 - v0, 0.02), f, u, (v0 + v1) / 2, 0.012);
  }
  /** Объём с цоколем, тягой, фризом, сухариками и двухступенчатым карнизом. */
  function volume(key, cx, cz, w, d, h, { parapet = true } = {}) {
    bld.add(key, place(box(w, h, d), cx, h / 2, cz));
    bld.add('plinth', place(box(w + 0.24, 0.9, d + 0.24), cx, 0.45, cz));
    bld.add('trim', place(box(w + 0.5, 0.36, d + 0.5), cx, Y_MID, cz));
    bld.add('trimN', place(box(w + 0.14, 0.7, d + 0.14), cx, Y_TOP - 0.45, cz));
    for (const [ax, len, fixed] of [['x', w, d / 2], ['x', w, -d / 2], ['z', d, w / 2], ['z', d, -w / 2]]) {
      for (let s = -len / 2 + 0.3; s <= len / 2 - 0.3; s += 0.5) {
        if (ax === 'x') bld.add('trimN', place(box(0.2, 0.2, 0.32), cx + s, Y_TOP - 0.02, cz + fixed + Math.sign(fixed) * 0.16));
        else bld.add('trimN', place(box(0.32, 0.2, 0.2), cx + fixed + Math.sign(fixed) * 0.16, Y_TOP - 0.02, cz + s));
      }
    }
    bld.add('trim', place(box(w + 0.75, 0.26, d + 0.75), cx, Y_TOP + 0.21, cz));
    bld.add('trim', place(box(w + 1.35, 0.3, d + 1.35), cx, Y_TOP + 0.48, cz));
    if (parapet && h <= Y_TOP + 0.01) {
      bld.add(key, place(box(w - 0.1, 0.85, d - 0.1), cx, Y_TOP + 1.05, cz));
      bld.add('trim', place(box(w + 0.1, 0.14, d + 0.1), cx, Y_TOP + 1.54, cz));
    }
  }

  // крылья (единый корпус)
  volume('wallA', 0, 0, 42, 20, Y_TOP);
  bld.add('roof', place(hipRoof(41, 19, 3.6), 0, Y_TOP + 1.0, 0));
  const front = { x: 0, z: 10, ry: 0 };
  const back = { x: 0, z: -10, ry: Math.PI };
  const AX = [7.5, 10.5, 13.5, 16.5, 19.5];
  const COLS = [6.45, 9, 12, 15, 18, 20.55];
  for (const f of [front, back]) {
    for (const sgn of [-1, 1]) {
      for (const x of AX) {
        addArch(f, x * sgn, 1.6, 1.9, 4.0);
        addPaired(f, x * sgn, 7.3, 2.1, 3.6);
      }
      for (const x of COLS) {
        column(f, x * sgn, 0.9, Y_MID - 0.18, 0.2);
        column(f, x * sgn, Y_MID + 0.18, Y_TOP - 0.8, 0.16);
        bld.face('trim', box(0.7, 1.1, 0.5), f, x * sgn, Y_TOP + 1.2, 0.0); // тумбы парапета
      }
      rustSkin(f, 13.5 * sgn, 15);
    }
  }

  // торцевые ризалиты
  for (const sx of [-1, 1]) {
    const cx = 24 * sx;
    volume('wallB', cx, 0, 6, 21.2, Y_TOP);
    bld.add('wallB', place(box(6, 0.9, 21.2), cx, Y_TOP + 1.05, 0));
    bld.add('roof', place(hipRoof(5.8, 21, 2.4), cx, Y_TOP + 1.6, 0));
    for (const f of [{ x: cx, z: 10.6, ry: 0 }, { x: cx, z: -10.6, ry: Math.PI }]) {
      for (const u of [-1.5, 1.5]) {
        addArch(f, u, 1.6, 1.9, 4.0);
        addPaired(f, u, 7.3, 2.1, 3.6, 'wallNB');
      }
      quoins(f, 2.95, 0.9, Y_TOP - 0.8);
      quoins(f, -2.95, 0.9, Y_TOP - 0.8);
      rustSkin(f, 0, 6, 'rustB');
    }
    const side = { x: 27 * sx, z: 0, ry: (sx * Math.PI) / 2 };
    for (const u of [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5]) {
      addArch(side, u, 1.6, 1.9, 4.0);
      addPaired(side, u, 7.3, 2.1, 3.6, 'wallNB');
    }
    quoins(side, 10.55, 0.9, Y_TOP - 0.8);
    quoins(side, -10.55, 0.9, Y_TOP - 0.8);
    rustSkin(side, 0, 21.2, 'rustB');
  }

  // центральный ризалит с аттиком
  {
    const w = 12, d = 22.4, H = 15.5;
    volume('wallB', 0, 0, w, d, H, { parapet: false });
    bld.add('trim', place(box(w + 0.6, 0.3, d + 0.6), 0, H + 0.15, 0));
    bld.add('trim', place(box(w + 1.1, 0.3, d + 1.1), 0, H + 0.45, 0));
    bld.add('roof', place(box(w - 0.6, 0.6, d - 0.6), 0, H + 0.6, 0));
    for (const f of [{ x: 0, z: d / 2, ry: 0 }, { x: 0, z: -d / 2, ry: Math.PI }]) {
      const isFront = f.z > 0;
      for (const u of [-3.6, 0, 3.6]) {
        if (isFront) addArch(f, u, 0.9, 2.6, 4.7, 'door');
        else addArch(f, u, 1.5, 2.2, 4.1);
        addPaired(f, u, 7.2, 2.6, 3.9, 'wallNB');
      }
      for (const u of [-5.55, -1.8, 1.8, 5.55]) {
        column(f, u, 0.9, Y_MID - 0.18, 0.26);
        column(f, u, Y_MID + 0.18, Y_TOP - 0.8, 0.2);
        if (Math.abs(u) > 3) bld.face('trim', box(0.8, 2.9, 0.3), f, u, 14.1, 0.15); // пилоны аттика
      }
      bld.face('trim', box(8.6, 1.9, 0.14), f, 0, 14.05, 0.08); // доска аттика
      bld.face('bronze', box(8.2, 0.08, 0.05), f, 0, 13.2, 0.17);
      bld.face('bronze', box(8.2, 0.08, 0.05), f, 0, 14.9, 0.17);
      rustSkin(f, 0, 12, 'rustB');
    }
    for (const x of [-5.55, -1.8, 1.8, 5.55]) {
      for (const z of [d / 2 - 0.2, -d / 2 + 0.2]) {
        bld.add('trim', place(box(0.7, 0.55, 0.7), x, H + 0.88, z));
        bld.add('trim', place(sphere(0.34, 12, 8), x, H + 1.45, z, 0, 0, 0, 1, 1.25, 1));
      }
    }
  }

  // башня с часами на 4 стороны и зелёной главкой со шпилем
  const TOWER = { x: 0, z: 0 };
  const POLE_Y = 34.7;
  {
    const { x, z } = TOWER;
    bld.add('wallA', place(box(8, 5.5, 8), x, 15.5 + 2.75, z));
    bld.add('trim', place(box(8.8, 0.3, 8.8), x, 21.05, z));
    bld.add('trim', place(box(8.4, 0.22, 8.4), x, 20.8, z));
    bld.add('wallB', place(box(6.6, 5.0, 6.6), x, 21.2 + 2.5, z));
    bld.add('trim', place(box(7.4, 0.32, 7.4), x, 26.36, z));
    bld.add('trim', place(box(7.0, 0.22, 7.0), x, 26.1, z));
    bld.add('wallA', place(box(3.8, 1.9, 3.8), x, 26.5 + 0.95, z));
    bld.add('trim', place(box(4.3, 0.26, 4.3), x, 28.5, z));
    const prof = [[0.01, 0], [2.95, 0], [3.0, 0.35], [2.7, 1.2], [2.05, 2.25], [1.2, 3.05], [0.55, 3.55], [0.25, 3.85], [0.01, 4.0]].map(([r, y]) => new THREE.Vector2(r, y));
    bld.add('dome', place(new THREE.LatheGeometry(prof, 4).rotateY(Math.PI / 4), x, 28.6, z));
    bld.add('gold', place(sphere(0.3, 12, 8), x, 32.85, z));
    bld.add('gold', place(cyl(0.05, 0.1, 2.2, 6), x, 33.9, z));

    for (let k = 0; k < 4; k++) {
      const ry = (k * Math.PI) / 2;
      const c = Math.cos(ry), s = Math.sin(ry);
      const f1 = { x: x + 4 * s, z: z + 4 * c, ry };
      addArch(f1, 0, 16.3, 2.2, 3.4);
      for (const u of [-3.5, 3.5]) column(f1, u, 15.5, 20.7, 0.22);
      const f2 = { x: x + 3.3 * s, z: z + 3.3 * c, ry };
      for (const u of [-2.85, 2.85]) bld.face('trim', box(0.55, 5.0, 0.2), f2, u, 23.7, 0.1);
      const f3 = { x: x + 1.9 * s, z: z + 1.9 * c, ry };
      for (const u of [-0.8, 0.8]) bld.face('glass', new THREE.ShapeGeometry(archShape(0.6, 1.2), 8), f3, u, 26.85, 0.03);
      bld.face('clockFace', new THREE.CircleGeometry(1.9, 48), f2, 0, 23.85, 0.05);
      bld.face('bronze', new THREE.TorusGeometry(1.96, 0.1, 6, 48), f2, 0, 23.85, 0.08);
      for (let hh = 0; hh < 12; hh++) {
        const a = (hh / 12) * Math.PI * 2;
        const len = hh % 3 === 0 ? 0.4 : 0.22;
        const g = box(0.09, len, 0.02).rotateZ(-a).translate(Math.sin(a) * 1.6, 23.85 + Math.cos(a) * 1.6, 0);
        bld.face('dark', g, f2, 0, 0, 0.08);
      }
      const pivot = new THREE.Group();
      pivot.position.set(f2.x + 0.13 * s, 23.85, f2.z + 0.13 * c);
      pivot.rotation.y = ry;
      const hourH = new THREE.Mesh(box(0.16, 1.0, 0.04).translate(0, 0.42, 0), M.dark);
      const minH = new THREE.Mesh(box(0.1, 1.5, 0.04).translate(0, 0.65, 0.03), M.dark);
      const cap = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12), M.bronze);
      cap.position.z = 0.06;
      pivot.add(hourH, minH, cap);
      scene.add(pivot);
      clockHands.push({ hourH, minH });
    }
  }
  scene.add(bld.build(MK, { noShadow: ['trimN', 'wallN', 'wallNB', 'rustA', 'rustB', 'glass', 'door', 'clockFace'] }));

  // контактная тень под зданием
  {
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(66, 36).rotateX(-Math.PI / 2), M.contact);
    cs.position.set(0, 0.1, 0);
    cs.renderOrder = 1;
    scene.add(cs);
  }


  /* ---------- Пути и перроны (тупиковый вокзал: пути заканчиваются у задней стороны) ---------- */
  const TRACKS = [-16.1, -7.9, -0.1, 8.1, 13.9, 22.1];
  const MAIN_TRACKS = [13.9, 22.1];
  const STOP_Z = -21;
  function trackSet(xs, parent, len = 680) {
    const b = new Batch();
    for (const t of xs) {
      b.add('ballast', place(box(3.2, 0.3, len), t, 0.15, -19.5 - len / 2));
      b.add('rail', place(box(0.08, 0.16, len), t - 0.76, 0.38, -19.5 - len / 2));
      b.add('rail', place(box(0.08, 0.16, len), t + 0.76, 0.38, -19.5 - len / 2));
      b.add('dark', place(box(2.6, 1.0, 0.6), t, 0.8, -19.8)); // упор
      b.add('edge', place(box(2.62, 0.16, 0.62), t, 1.1, -19.8));
    }
    parent.add(b.build(MK, { cast: false }));
    const per = 230;
    const sl = new THREE.InstancedMesh(box(2.6, 0.1, 0.26), M.sleeper, per * xs.length);
    let k = 0;
    for (const t of xs) for (let i = 0; i < per; i++) {
      _o.position.set(t, 0.32, -20.5 - i * 0.9); _o.rotation.set(0, 0, 0); _o.scale.set(1, 1, 1); _o.updateMatrix();
      sl.setMatrixAt(k++, _o.matrix);
    }
    sl.receiveShadow = true;
    parent.add(sl);
  }
  {
    const g = new THREE.Group();
    scene.add(g);
    trackSet(MAIN_TRACKS, g);
    trackSet(TRACKS.filter((t) => !MAIN_TRACKS.includes(t)), featGroup('tracksX'));
  }
  const PLAT_X = [-12, 4, 18];
  {
    const g = featGroup('platHigh');
    const b = new Batch();
    b.add('platform', place(box(56, 1.1, 8.6), 0, 0.55, -14.6));
    for (const px of PLAT_X) {
      b.add('platform', place(box(5, 1.1, 240), px, 0.55, -138.9));
      b.add('edge', place(box(0.3, 0.03, 240), px - 2.3, 1.11, -138.9));
      b.add('edge', place(box(0.3, 0.03, 240), px + 2.3, 1.11, -138.9));
    }
    g.add(b.build(MK));
  }
  {
    const g = featGroup('platLow');
    const b = new Batch();
    b.add('platWood', place(box(56, 0.4, 8.6), 0, 0.2, -14.6));
    b.add('platWood', place(box(4.6, 0.4, 100), 18, 0.2, -69));
    g.add(b.build(MK));
  }

  /* ---------- Деревянный дебаркадер 1851 (двускатная крыша над путями) ---------- */
  {
    const g = featGroup('shed');
    const b = new Batch();
    const Z0 = -19, LEN = 84, ZC = Z0 - LEN / 2, CX = 18, HALF = 8.6, EAVE = 7.0, RISE = 4.0;
    const slope = Math.atan2(RISE, HALF), sl = Math.hypot(HALF, RISE) + 0.6;
    for (const s of [-1, 1]) {
      b.add('roof', place(box(sl, 0.22, LEN), CX + s * HALF / 2, EAVE + RISE / 2 + 0.1, ZC, 0, 0, -s * slope));
      for (let z = Z0 - 1; z >= Z0 - LEN; z -= 7) b.add('wood', place(box(0.35, EAVE, 0.35), CX + s * (HALF - 0.4), EAVE / 2, z));
      b.add('wood', place(box(0.3, 0.4, LEN), CX + s * (HALF - 0.4), EAVE, ZC));
    }
    for (let z = Z0 - 1; z >= Z0 - LEN; z -= 7) b.add('wood', place(box(HALF * 2, 0.25, 0.25), CX, EAVE, z));
    g.add(b.build(MK));
  }

  /* ---------- Единый стеклянный дебаркадер 2026 ---------- */
  {
    const g = featGroup('canopy');
    const steel = new Batch();
    const glass = new Batch();
    const Z0 = -19, LEN = 152, ZC = Z0 - LEN / 2, CX = 3, R = 23.5, SPRING = 9, RISE = 0.3;
    const vaultY = (x) => SPRING + RISE * Math.sqrt(Math.max(0, R * R - (x - CX) * (x - CX)));
    glass.add('canopyGlass', place(
      new THREE.CylinderGeometry(R, R, LEN, 40, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
      CX, SPRING, ZC, 0, 0, 0, 1, RISE, 1));
    for (let z = Z0; z >= Z0 - LEN; z -= 6) {
      steel.add('steel', place(new THREE.TorusGeometry(R, 0.14, 4, 40, Math.PI), CX, SPRING, z, 0, 0, 0, 1, RISE, 1));
    }
    for (const x of [CX - R, CX + R, ...PLAT_X]) {
      const h = vaultY(x);
      for (let z = Z0 - 2; z >= Z0 - LEN; z -= 12) steel.add('steel', place(cyl(0.2, 0.26, h, 8), x, h / 2, z));
      steel.add('steel', place(box(0.35, 0.4, LEN), x, h - 0.1, ZC));
    }
    for (const px of PLAT_X) steel.add('strip', place(box(0.3, 0.12, LEN - 4), px, vaultY(px) - 0.55, ZC));
    g.add(steel.build(MK, { receive: false }));
    const gm = glass.build(MK, { cast: false, receive: false });
    gm.children.forEach((m) => { m.renderOrder = 3; });
    g.add(gm);
  }

  /* ---------- Контактная сеть (Советская, Настоящее) ---------- */
  {
    const g = featGroup('catenary');
    const b = new Batch();
    for (let z = -26; z > -420; z -= 30) {
      for (const x of [-21, 27]) b.add('steel', place(cyl(0.16, 0.22, 10, 6), x, 5, z));
      b.add('steel', place(box(48.4, 0.3, 0.3), 3, 9.6, z));
      for (const t of TRACKS) b.add('steel', place(box(0.05, 2.8, 0.05), t, 8.1, z));
    }
    for (const t of TRACKS) {
      b.add('dark', place(box(0.04, 0.04, 400), t, 6.7, -220));
      b.add('dark', place(box(0.04, 0.04, 400), t, 8.0, -220));
    }
    g.add(b.build(MK, { cast: false }));
  }

  /* ---------- Пристройка 1960-х слева: простой объём, прямоугольные окна ---------- */
  {
    const g = featGroup('annex');
    const ab = new Batch();
    const x0 = -55, x1 = -27.05, d = 20, H = 12.6;
    const w = x1 - x0, cx = (x0 + x1) / 2;
    ab.add('wallA', place(box(w, H, d), cx, H / 2, 0));
    ab.add('plinth', place(box(w + 0.2, 0.9, d + 0.2), cx, 0.45, 0));
    ab.add('trim', place(box(w + 0.5, 0.4, d + 0.5), cx, H + 0.2, 0));
    ab.add('roof', place(box(w - 1, 0.6, d - 1), cx, H + 0.3, 0));
    const wins = [];
    for (let x = x0 + 2.5; x < x1 - 1.5; x += 3.0) wins.push(x);
    for (const y of [1.5, 5.5, 9.3]) {
      for (const zf of [d / 2, -d / 2]) {
        const sg = zf > 0 ? 1 : -1;
        for (const x of wins) {
          ab.add('trimN', place(box(2.0, 2.6, 0.06), x, y + 1.2, zf + sg * 0.03));
          ab.add('glass', place(box(1.7, 2.3, 0.08), x, y + 1.2, zf + sg * 0.05));
        }
      }
      for (let z = -d / 2 + 2.5; z < d / 2 - 1.5; z += 3.0) {
        ab.add('trimN', place(box(0.06, 2.6, 2.0), x0 - 0.03, y + 1.2, z));
        ab.add('glass', place(box(0.08, 2.3, 1.7), x0 - 0.05, y + 1.2, z));
      }
    }
    ab.add('door', place(box(3.4, 2.8, 0.12), cx + 4, 1.4, d / 2 + 0.06));
    ab.add('trim', place(box(5, 0.2, 2.0), cx + 4, 3.1, d / 2 + 1.0));
    g.add(ab.build(MK, { noShadow: ['trimN', 'glass', 'door'] }));
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(w + 8, d + 8).rotateX(-Math.PI / 2), M.contact);
    cs.position.set(cx, 0.1, 0);
    cs.renderOrder = 1;
    g.add(cs);
  }

  /* ---------- Надстройка 3-го этажа над крыльями (утоплена от фасада) ---------- */
  {
    const g = featGroup('superstr');
    const b = new Batch();
    for (const s of [-1, 1]) {
      const cx = 13.5 * s, w = 14.2, d = 15, y0 = Y_TOP + 0.6, H = 3.2;
      b.add('wallA', place(box(w, H, d), cx, y0 + H / 2, 0));
      b.add('trim', place(box(w + 0.3, 0.2, d + 0.3), cx, y0 + H + 0.1, 0));
      b.add('roof', place(box(w - 0.4, 0.3, d - 0.4), cx, y0 + H + 0.3, 0));
      for (const x of AX) {
        for (const zf of [d / 2, -d / 2]) {
          const sg = zf > 0 ? 1 : -1;
          b.add('glass', place(box(1.5, 1.6, 0.08), x * s, y0 + 1.6, zf + sg * 0.04));
        }
      }
    }
    g.add(b.build(MK, { noShadow: ['glass'] }));
  }

  /* ---------- Вывеска (образец середины 1970-х; Советская и Настоящее) ---------- */
  {
    const g = featGroup('sign');
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 1.0), M.sign);
    m.position.set(0, 14.05, 11.2 + 0.17);
    g.add(m);
  }

  /* ---------- Флагшток (Царская, Настоящее) и флаг (Настоящее) ---------- */
  {
    const g = featGroup('pole');
    const b = new Batch();
    b.add('steel', place(cyl(0.06, 0.1, 7.2, 8), TOWER.x, POLE_Y + 3.6, TOWER.z));
    b.add('gold', place(sphere(0.2, 10, 8), TOWER.x, POLE_Y + 7.3, TOWER.z));
    g.add(b.build(MK));
  }
  const flagGeos = [];
  {
    const g = featGroup('flag');
    const cols = [M.flagW, M.flagB, M.flagR];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(2.7, 0.6, 12, 1);
      geo.translate(1.35 + 0.08, POLE_Y + 6.9 - i * 0.6, 0);
      geo.userData.base = geo.attributes.position.array.slice();
      flagGeos.push(geo);
      const m = new THREE.Mesh(geo, cols[i]);
      m.position.set(TOWER.x, 0, TOWER.z);
      m.castShadow = true;
      g.add(m);
    }
  }

  /* ---------- Фонари ---------- */
  const haloTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const gx = c.getContext('2d');
    const gr = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    gx.fillStyle = gr;
    gx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const haloMats = [];
  function halo(scale) {
    const m = new THREE.SpriteMaterial({ map: haloTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
    haloMats.push(m);
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    return s;
  }
  const SQ_LAMPS = [];
  for (const x of [-42, -34, -26, -18, -10, 10, 18, 26, 34, 42]) SQ_LAMPS.push([x, 15]);
  for (const x of [-40, -15, 15, 40]) SQ_LAMPS.push([x, 52]);
  const PL_LAMPS = [];
  for (const px of PLAT_X) for (const z of [-32, -56, -80, -104]) PL_LAMPS.push([px, z]);
  const gasProto = (() => {
    const p = new Batch();
    p.add('iron', place(box(0.4, 0.5, 0.4), 0, 0.25, 0));
    p.add('iron', place(cyl(0.07, 0.1, 3.0, 8), 0, 2.0, 0));
    p.add('iron', place(box(0.6, 0.05, 0.05), 0, 3.2, 0));
    p.add('lampGlass', place(cyl(0.24, 0.16, 0.55, 6), 0, 3.6, 0));
    p.add('iron', place(new THREE.ConeGeometry(0.33, 0.35, 6), 0, 4.05, 0));
    return p.build(MK, { receive: false });
  })();
  const elecProto = (() => {
    const p = new Batch();
    p.add('iron', place(box(0.45, 0.6, 0.45), 0, 0.3, 0));
    p.add('iron', place(cyl(0.08, 0.13, 5.6, 8), 0, 3.0, 0));
    p.add('iron', place(box(1.5, 0.08, 0.08), 0, 5.6, 0));
    p.add('lampGlass', place(sphere(0.3, 12, 8), -0.72, 5.9, 0));
    p.add('lampGlass', place(sphere(0.3, 12, 8), 0.72, 5.9, 0));
    p.add('lampGlass', place(sphere(0.34, 12, 8), 0, 6.3, 0));
    return p.build(MK, { receive: false });
  })();
  function lampSet(name, proto, list, haloY, haloS) {
    const g = featGroup(name);
    for (const [x, z, y] of list) {
      const l = new THREE.Group();
      l.position.set(x, y, z);
      l.add(proto.clone());
      const h = halo(haloS);
      h.position.y = haloY;
      l.add(h);
      g.add(l);
    }
  }
  const sq = SQ_LAMPS.map(([x, z]) => [x, z, 0.08]);
  const plHigh = PL_LAMPS.map(([x, z]) => [x, z, 1.1]);
  lampSet('gasSq', gasProto, sq, 3.6, 2.8);
  lampSet('gasLow', gasProto, PL_LAMPS.filter(([x]) => x === 18).slice(0, 3).map(([x, z]) => [x, z, 0.4]), 3.6, 2.8);
  lampSet('gasHigh', gasProto, plHigh, 3.6, 2.8);
  lampSet('electric', elecProto, [...sq, ...plHigh], 6.0, 3.6);

  /* ---------- Извозчики (1851) ---------- */
  {
    const g = featGroup('carriages');
    const p = new Batch();
    p.add('coach', place(box(1.5, 1.05, 2.0), 0, 1.25, 0));
    p.add('dark', place(box(1.6, 0.1, 2.2), 0, 1.82, 0));
    p.add('dark', place(box(1.3, 0.12, 0.9), 0, 1.5, 1.5));
    p.add('glass', place(box(1.52, 0.4, 0.8), 0, 1.45, 0));
    for (const [zz, r] of [[0.75, 0.42], [-0.75, 0.55]]) {
      p.add('wheelW', place(wheel(r, 0.08), 0.8, r, zz));
      p.add('wheelW', place(wheel(r, 0.08), -0.8, r, zz));
    }
    p.add('dark', place(box(0.05, 0.05, 2.0), 0.35, 0.95, 2.6));
    p.add('dark', place(box(0.05, 0.05, 2.0), -0.35, 0.95, 2.6));
    p.add('horse', place(box(0.55, 0.65, 1.5), 0, 1.35, 3.0));
    for (const [lx, lz] of [[0.18, 2.5], [-0.18, 2.5], [0.18, 3.55], [-0.18, 3.55]]) p.add('horse', place(box(0.13, 1.05, 0.13), lx, 0.52, lz));
    p.add('horse', place(box(0.32, 0.85, 0.35), 0, 1.9, 3.75, 0, 0.5));
    p.add('horse', place(box(0.28, 0.3, 0.65), 0, 2.25, 4.05, 0, 0.5));
    const coach = p.build(MK);
    for (const [x, z, ry] of [[-22, 22, 1.7], [9, 30, -1.4], [31, 21, 2.7], [-36, 40, 0.4], [20, 46, 1.2], [-5, 38, -0.3]]) {
      const w = new THREE.Group();
      w.position.set(x, 0.08, z);
      w.rotation.y = ry;
      w.add(coach.clone());
      g.add(w);
    }
  }

  /* ---------- Легковые машины и автобус (Советская) ---------- */
  {
    const g = featGroup('cars');
    const b = new Batch();
    const auto = (x, z, ry, key) => {
      const c = Math.cos(ry), s = Math.sin(ry);
      b.add(key, place(box(1.8, 0.75, 4.8), x, 0.62, z, ry));
      b.add(key, place(box(1.62, 0.55, 2.5), x - 0.2 * s, 1.27, z - 0.2 * c, ry));
      b.add('glass', place(box(1.66, 0.36, 2.3), x - 0.2 * s, 1.27, z - 0.2 * c, ry));
      for (const [dx, dz] of [[0.82, 1.5], [-0.82, 1.5], [0.82, -1.5], [-0.82, -1.5]]) {
        b.add('dark', place(wheel(0.34, 0.2), x + dx * c + dz * s, 0.34, z - dx * s + dz * c, ry));
      }
    };
    auto(-30, 62, Math.PI / 2, 'car1');
    auto(-12, 69.5, -Math.PI / 2, 'car2');
    auto(8, 62, Math.PI / 2, 'car3');
    auto(26, 69.5, -Math.PI / 2, 'car4');
    auto(-46, 69.5, -Math.PI / 2, 'car2');
    auto(40, 62, Math.PI / 2, 'car1');
    b.add('busC', place(box(2.5, 2.4, 11), -2, 1.6, 62, Math.PI / 2));
    b.add('glass', place(box(2.54, 0.9, 9.6), -2, 2.15, 62, Math.PI / 2));
    for (const dx of [-3.5, 3.5]) for (const dz of [-1.1, 1.1]) b.add('dark', place(wheel(0.5, 0.3), -2 + dx, 0.5, 62 + dz, Math.PI / 2));
    g.add(b.build(MK));
  }

  /* ---------- Деревья ---------- */
  {
    const g = featGroup('trees');
    const r = rng(7);
    const spotsT = [];
    for (const z of [16, 26, 36, 46]) spotsT.push([-56, z], [56, z]);
    for (const x of [-50, -30, 30, 50]) spotsT.push([x, 56]);
    for (const [x, z] of spotsT) {
      const tb = new Batch();
      const h = 7 + r() * 3;
      tb.add('trunk', place(cyl(0.22, 0.32, h * 0.5, 6), 0, h * 0.25, 0));
      tb.add('tree', place(new THREE.IcosahedronGeometry(2.8 + r() * 0.8, 1), 0, h * 0.62, 0, 0, 0, 0, 1, 1.15, 1));
      tb.add('tree', place(new THREE.IcosahedronGeometry(2.0, 1), 0.8, h * 0.85, 0.5));
      const t = new THREE.Group();
      t.position.set(x, 0.08, z);
      t.add(tb.build(MK));
      g.add(t);
    }
  }

  /* ---------- Город: дома с текстурой окон (по эпохам) ---------- */
  function avoid(x, z) {
    if (x > -40 && x < 50 && z < 30) return true; // вокзал и пути
    if (x > -70 && x < 70 && z > -10 && z < 80) return true; // площадь
    if (x > 55 && x < 135 && z > -25 && z < 30) return true; // Ярославский
    if (x > -85 && x < 65 && z > 195 && z < 245) return true; // Казанский
    return false;
  }
  function cityBlocks(name, seed, count, rMin, rMax, hMin, hMax, roofs) {
    const g = featGroup(name);
    const r = rng(seed);
    const b = new Batch();
    let n = 0, guard = 0;
    while (n < count && guard++ < 2000) {
      const a = r() * Math.PI * 2, d = rMin + r() * (rMax - rMin);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (avoid(x, z)) continue;
      const w = 14 + r() * 26, dd = 12 + r() * 16, h = hMin + r() * (hMax - hMin);
      const ry = Math.round(r() * 3) * (Math.PI / 2) + (r() - 0.5) * 0.2;
      b.add('city', place(box(w, h, dd), x, h / 2, z, ry));
      if (roofs) b.add('cityRoof', place(hipRoof(w + 0.6, dd + 0.6, Math.min(w, dd) * 0.3), x, h, z, ry));
      n++;
    }
    g.add(b.build(MK, { cast: false, receive: false }));
  }
  cityBlocks('cityLow', 1851, SMALL ? 10 : 16, 190, 380, 6, 10, true);
  cityBlocks('cityMid', 1960, SMALL ? 22 : 32, 170, 420, 15, 28, false);
  cityBlocks('cityHigh', 2026, 3, 330, 480, 70, 110, false);

  /* ---------- Соседи: Ярославский и Казанский вокзалы (схематично) ---------- */
  {
    const g = featGroup('neighbors');
    const b = new Batch();
    // Ярославский — справа при взгляде с площади: светлые стены, высокая шатровая кровля
    b.add('trim', place(box(48, 14, 22), 96, 7, 2));
    b.add('roof', place(hipRoof(30, 18, 11), 100, 14, 2));
    b.add('wallB', place(box(48.4, 1.2, 22.4), 96, 9.5, 2));
    b.add('trim', place(box(9, 13, 9), 74, 13.5, 6));
    b.add('roof', place(new THREE.ConeGeometry(7, 14, 4).rotateY(Math.PI / 4), 74, 27, 6));
    // Казанский — напротив через площадь, с ярусной башней
    b.add('trim', place(box(120, 13, 22), -8, 6.5, 222));
    b.add('wallB', place(box(120.4, 1.0, 22.4), -8, 11.5, 222));
    b.add('roof', place(hipRoof(118, 20, 5), -8, 13, 222));
    b.add('trim', place(box(14, 22, 14), -26, 11, 214));
    b.add('trim', place(box(10, 14, 10), -26, 29, 214));
    b.add('trim', place(box(7, 10, 7), -26, 41, 214));
    b.add('roof', place(new THREE.ConeGeometry(4.6, 16, 8), -26, 54, 214));
    g.add(b.build(MK, { cast: false }));
  }

  /* ---------- Люди (InstancedMesh, по эпохам) ---------- */
  function peopleGeo(female) {
    const parts = [];
    if (female) {
      parts.push(new THREE.ConeGeometry(0.42, 0.95, 8).translate(0, 0.475, 0));
      parts.push(new THREE.CapsuleGeometry(0.15, 0.4, 2, 6).translate(0, 1.2, 0));
      parts.push(new THREE.SphereGeometry(0.11, 8, 6).translate(0, 1.6, 0));
    } else {
      parts.push(new THREE.CapsuleGeometry(0.2, 1.0, 2, 6).translate(0, 0.7, 0));
      parts.push(new THREE.SphereGeometry(0.12, 8, 6).translate(0, 1.6, 0));
    }
    return merge(parts.map((p) => { const q = p.toNonIndexed(); p.dispose(); return q; }));
  }
  const PEOPLE_N = SMALL ? 60 : 110;
  function peopleSet(name, seed, palette, femalePal, platY) {
    const g = featGroup(name);
    const r = rng(seed);
    const make = (geo, count, pal) => {
      const m = new THREE.InstancedMesh(geo, M_('#ffffff', 0.9, 0, {}, 0.3), count);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        let x, z, y = 0.08;
        if (r() < 0.72) { x = -55 + r() * 110; z = 14 + r() * 40; }
        else {
          const px = platY > 0.5 ? PLAT_X[Math.floor(r() * 3)] : 18;
          x = px + (r() - 0.5) * 3.2; z = -24 - r() * (platY > 0.5 ? 110 : 60); y = platY;
        }
        const s = 0.92 + r() * 0.14;
        _o.position.set(x, y, z); _o.rotation.set(0, r() * 6.28, 0); _o.scale.set(s, s, s); _o.updateMatrix();
        m.setMatrixAt(i, _o.matrix);
        m.setColorAt(i, c.set(pal[Math.floor(r() * pal.length)]));
      }
      m.castShadow = true;
      g.add(m);
    };
    const nf = femalePal ? Math.round(PEOPLE_N * 0.4) : 0;
    make(peopleGeo(false), PEOPLE_N - nf, palette);
    if (nf) make(peopleGeo(true), nf, femalePal);
  }
  peopleSet('people1', 1, ['#2a2622', '#3a3028', '#4a3b2c', '#26303a', '#5a4a38'], ['#5c2a2e', '#2f3a52', '#6b5a3e', '#3b2f2a', '#7a6650'], 0.4);
  peopleSet('people2', 2, ['#3c4250', '#4a4d52', '#5a5048', '#2f3540', '#6a6458', '#56423a'], null, 1.1);
  peopleSet('people3', 3, ['#2b2f38', '#c23b3b', '#3f6aa8', '#e2d9c6', '#4b6b4a', '#d9a441', '#6a4a7a', '#1f1f22'], null, 1.1);

  for (const f of FEATS) makeFadeable(f);

  /* ---------- Поезда ---------- */
  const FAR_Z = -720;
  const trains = {};

  function wheelsUnder(b, key, zs, r, gauge = 0.82) {
    for (const z of zs) {
      b.add(key, place(wheel(r), gauge, r, z));
      b.add(key, place(wheel(r), -gauge, r, z));
    }
  }
  function bogie(b, z, r = 0.45, base = 2.0, gauge = 0.82) {
    b.add('dark', place(box(2.3, 0.45, base + 1.2), 0, r + 0.15, z));
    wheelsUnder(b, 'wheel', [z - base / 2, z + base / 2], r, gauge);
  }
  function pantograph(b, z, y) {
    b.add('dark', place(box(1.4, 0.2, 1.0), 0, y + 0.1, z));
    b.add('steel', place(box(0.07, 0.07, 1.9), 0, y + 0.65, z - 0.25, 0, 0.8));
    b.add('steel', place(box(0.07, 0.07, 1.9), 0, y + 0.65, z + 0.25, 0, -0.8));
    b.add('steel', place(box(1.8, 0.06, 0.14), 0, y + 1.3, z));
  }
  /** Ряд пассажирских вагонов на тележках. */
  function carRow(b, n, zStart, len, o) {
    const { body, roof, win, belt, w = 2.9, y0 = 1.2, h = 2.8, wins = 10, winH = 0.8, winW = 0.9, clerestory = false, gap = 1.0 } = o;
    for (let i = 0; i < n; i++) {
      const zc = zStart - i * (len + gap) - len / 2;
      const key = Array.isArray(body) ? body[i % body.length] : body;
      b.add(key, place(box(w, h, len), 0, y0 + h / 2, zc));
      b.add(roof, place(cylZ(w / 2 + 0.03, len + 0.05, 16), 0, y0 + h, zc, 0, 0, 0, 1, 0.22, 1));
      if (clerestory) b.add(roof, place(box(w * 0.42, 0.42, len - 1.2), 0, y0 + h + 0.38, zc));
      if (belt) b.add(belt, place(box(w + 0.02, 0.12, len + 0.01), 0, y0 + h * 0.42, zc));
      for (let k = 0; k < wins; k++) {
        const zz = zc + (k - (wins - 1) / 2) * ((len - 2.4) / Math.max(1, wins - 1));
        b.add(win, place(box(w + 0.04, winH, winW), 0, y0 + h * 0.64, zz));
      }
      b.add('dark', place(box(w * 0.85, 2.3, gap + 0.1), 0, y0 + 1.25, zc - len / 2 - gap / 2));
      bogie(b, zc + len / 2 - 2.3);
      bogie(b, zc - len / 2 + 2.3);
    }
  }

  // Американский паровоз 2-2-0 (4-4-0 по Уайту) + вагоны 1/2/3 классов
  function buildSteam() {
    const b = new Batch();
    const mats = {
      body: M_('#2f5236', 0.45, 0.3, {}, 0.9), dark: M_('#1f1d1b', 0.6, 0.4, {}, 0.6),
      brass: M_('#c39a45', 0.3, 0.85, {}, 1.0), red: M_('#8e2a22', 0.55, 0.1, {}, 0.6), wheel: M_('#7a2a20', 0.6, 0.3, {}, 0.5),
      steel: M_('#8b949c', 0.4, 0.75, {}, 1.0), cab: M_('#6b4a2e', 0.7, 0, {}, 0.4),
      c1: M_('#2f4a78', 0.55, 0, {}, 0.6), c2: M_('#c9a64a', 0.55, 0, {}, 0.6), c3: M_('#3f6b47', 0.55, 0, {}, 0.6),
      roofc: M_('#3a3631', 0.8, 0, {}, 0.3), win: M_('#2a2622', 0.3, 0, { emissive: new THREE.Color('#ffcf8a'), emissiveIntensity: 0.12 }, 0.9),
      lamp: M_('#fff6dc', 0.3, 0, { emissive: new THREE.Color('#ffe2a8'), emissiveIntensity: 1.5 }, 0.3), wood: M_('#6b5034', 0.9, 0, {}, 0.2),
    };
    b.add('red', place(box(2.2, 0.75, 1.2), 0, 0.55, -0.4, 0, -0.55)); // путеочиститель
    b.add('red', place(box(2.6, 0.35, 0.2), 0, 1.1, -1.0));
    b.add('dark', place(cylZ(0.74, 1.3), 0, 2.15, -1.8));
    b.add('body', place(cylZ(0.66, 4.4), 0, 2.15, -4.6));
    for (const z of [-3.0, -4.4, -5.8]) b.add('brass', place(cylZ(0.685, 0.08), 0, 2.15, z));
    b.add('dark', place(cylZ(0.62, 0.05), 0, 2.15, -1.13));
    b.add('cab', place(box(0.62, 0.7, 0.62), 0, 3.25, -1.55)); // фонарь-прожектор
    b.add('lamp', place(sphere(0.22, 10, 8), 0, 3.25, -1.23, 0, 0, 0, 1, 1, 0.4));
    b.add('dark', place(cyl(0.2, 0.24, 1.1, 10), 0, 3.35, -2.0)); // труба-«воронка»
    b.add('dark', place(cyl(0.62, 0.2, 1.05, 14), 0, 4.4, -2.0));
    b.add('brass', place(cyl(0.64, 0.64, 0.09, 14), 0, 4.95, -2.0));
    const stack = new THREE.Vector3(0, 5.1, -2.0);
    b.add('brass', place(sphere(0.32, 10, 8), 0, 2.95, -4.4, 0, 0, 0, 1, 1.3, 1));
    b.add('brass', place(sphere(0.26, 10, 8), 0, 2.9, -3.3, 0, 0, 0, 1, 1.2, 1));
    for (const s of [-1, 1]) b.add('dark', place(cylZ(0.3, 1.1), s * 1.05, 1.3, -2.9));
    b.add('dark', place(box(2.7, 0.07, 5.4), 0, 1.5, -4.8));
    wheelsUnder(b, 'wheel', [-2.4, -3.4], 0.45, 0.88); // передняя тележка
    wheelsUnder(b, 'wheel', [-5.3, -7.6], 0.69, 0.9); // две сцепные оси Ø1371 мм
    for (const s of [-1, 1]) {
      b.add('steel', place(box(0.06, 0.12, 2.5), s * 1.02, 0.69, -6.45)); // спарник
      b.add('body', place(box(0.22, 0.4, 1.6), s * 0.92, 1.35, -5.3));
      b.add('body', place(box(0.22, 0.4, 1.6), s * 0.92, 1.35, -7.6));
    }
    b.add('dark', place(box(1.7, 0.35, 6.6), 0, 1.0, -5.2));
    b.add('cab', place(box(2.6, 2.2, 2.4), 0, 2.7, -8.9)); // закрытая деревянная будка
    b.add('roofc', place(box(3.0, 0.14, 2.9), 0, 3.88, -8.9));
    for (const s of [-1, 1]) b.add('win', place(box(0.04, 0.7, 0.8), s * 1.31, 3.05, -8.6));
    b.add('win', place(box(0.7, 0.6, 0.04), 0.65, 3.1, -7.68));
    b.add('win', place(box(0.7, 0.6, 0.04), -0.65, 3.1, -7.68));
    b.add('body', place(box(2.5, 1.5, 4.6), 0, 1.95, -12.6)); // тендер
    b.add('wood', place(box(2.2, 0.55, 3.6), 0, 2.95, -12.8));
    b.add('dark', place(box(2.2, 0.3, 4.6), 0, 1.05, -12.6));
    wheelsUnder(b, 'wheel', [-10.9, -11.9, -13.3, -14.3], 0.45, 0.88);
    carRow(b, 3, -15.6, 13.5, { body: ['c1', 'c2', 'c3'], roof: 'roofc', win: 'win', belt: null, w: 2.8, y0: 1.05, h: 2.3, wins: 9, winH: 0.75, winW: 0.7, clerestory: true });
    const grp = new THREE.Group();
    grp.add(b.build(mats));
    return { group: grp, stack, smokeColor: '#ebe6dc' };
  }

  // Пассажирский электровоз с округлыми кабинами + тёмно-красные вагоны (после электрификации 1962 г.)
  function buildElectro() {
    const b = new Batch();
    const mats = {
      body: M_('#2d5a8c', 0.4, 0.2, {}, 0.9), cream: M_('#e3d3a0', 0.5, 0, {}, 0.6), dark: M_('#1c1b1a', 0.6, 0.4, {}, 0.5),
      steel: M_('#8b949c', 0.4, 0.75, {}, 1.0), wheel: M_('#2a2624', 0.55, 0.4, {}, 0.5), roofc: M_('#4a4c4b', 0.6, 0.3, {}, 0.6),
      car: M_('#7a1e1e', 0.5, 0.1, {}, 0.8), carRoof: M_('#3a3a3a', 0.7, 0.2, {}, 0.5), belt: M_('#d9c9a0', 0.5, 0, {}, 0.6),
      win: M_('#20262b', 0.15, 0.2, { emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0.1 }, 1.2),
      lamp: M_('#fff6dc', 0.3, 0, { emissive: new THREE.Color('#fff2cc'), emissiveIntensity: 1.5 }, 0.3),
    };
    const L = 18.9, w = 3.1, y0 = 1.25, h = 3.0, yc = y0 + h / 2, ends = 1.5;
    b.add('body', place(box(w, h, L - 2 * ends), 0, yc, -L / 2));
    for (const [zc, dir] of [[-ends, 1], [-L + ends, -1]]) {
      const ry = dir > 0 ? 0 : Math.PI;
      b.add('body', place(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI), 0, yc, zc, ry, 0, 0, w / 2, h / 2, ends * 1.05));
      b.add('win', place(new THREE.SphereGeometry(1, 20, 8, Math.PI / 2 - 0.85, 1.7, 0.55, 0.5), 0, yc, zc, ry, 0, 0, w / 2 + 0.02, h / 2 + 0.02, ends * 1.05 + 0.02));
      b.add('cream', place(new THREE.SphereGeometry(1, 24, 3, 0, Math.PI, 1.68, 0.12), 0, yc, zc, ry, 0, 0, w / 2 + 0.015, h / 2 + 0.015, ends * 1.05 + 0.015));
      b.add('lamp', place(sphere(0.14, 8, 6), 0, yc + 1.25, zc + dir * ends * 0.92));
      b.add('dark', place(box(2.6, 0.4, 0.3), 0, 1.05, zc + dir * (ends + 0.05)));
    }
    b.add('cream', place(box(w + 0.02, 0.18, L - 2 * ends), 0, yc - 0.25, -L / 2));
    b.add('roofc', place(cylZ(w / 2, L - 2 * ends, 16), 0, y0 + h, -L / 2, 0, 0, 0, 1, 0.16, 1));
    for (let k = 0; k < 5; k++) b.add('win', place(box(w + 0.04, 0.55, 0.9), 0, yc + 0.55, -4.0 - k * 2.6));
    b.add('steel', place(box(1.4, 0.4, 6.0), 0, y0 + h + 0.35, -L / 2));
    pantograph(b, -4.0, y0 + h + 0.2);
    pantograph(b, -L + 4.0, y0 + h + 0.2);
    for (const bz of [-4.6, -L + 4.6]) {
      b.add('dark', place(box(2.6, 0.7, 4.4), 0, 0.75, bz));
      wheelsUnder(b, 'wheel', [bz - 1.6, bz, bz + 1.6], 0.6, 1.0);
    }
    carRow(b, 6, -L - 1.0, 24, { body: 'car', roof: 'carRoof', win: 'win', belt: 'belt', w: 3.1, y0: 1.2, h: 3.0, wins: 10, winH: 0.85, winW: 1.0 });
    const grp = new THREE.Group();
    grp.add(b.build(mats));
    return { group: grp, stack: null, smokeColor: '#fff' };
  }

  // «Сапсан» (Velaro RUS): скруглённое сечение, длинный клиновидный нос, сплошная лента окон
  const SAP = { NOSE: 7.6, YB: 0.78 };
  function sapNoseRing(t) {
    return { t, sx: 1 - 0.6 * Math.pow(t, 1.6), sy: 1 - 0.63 * Math.pow(t, 1.25), dy: 0.14 * t * t };
  }
  function buildSapsan() {
    const LIV = {
      g: new THREE.Color('#3b4046'), w: new THREE.Color('#eef0f2'), r: new THREE.Color('#c8102e'),
      k: new THREE.Color('#1a222b'), roof: new THREE.Color('#dfe2e5'),
    };
    const half = [
      [0, 0.78, 'g'], [1.30, 0.78, 'g'], [1.48, 0.86, 'g'], [1.56, 1.05, 'g'], [1.585, 1.18, 'g'], [1.585, 1.18, 'w'],
      [1.60, 1.42, 'w'], [1.60, 1.42, 'r'], [1.612, 1.64, 'r'], [1.612, 1.64, 'w'], [1.632, 2.2, 'w'], [1.627, 2.6, 'w'],
      [1.627, 2.6, 'k'], [1.606, 3.0, 'k'], [1.578, 3.34, 'k'], [1.578, 3.34, 'w'], [1.50, 3.62, 'w'], [1.32, 3.86, 'roof'],
      [1.0, 3.99, 'roof'], [0.5, 4.06, 'roof'], [0, 4.08, 'roof'],
    ];
    const profile = [...half];
    for (let i = half.length - 2; i >= 1; i--) profile.push([-half[i][0], half[i][1], half[i][2]]);
    const { NOSE, YB } = SAP;
    const bodyCol = (k) => LIV[k];
    const noseCol = (k, t) => (k === 'k' && t > 0.3 ? LIV.w : k === 'roof' ? LIV.w : LIV[k]);
    const NR = 18;
    const noseGeo = () => {
      const rings = [];
      for (let k = 0; k <= NR; k++) {
        const t = k / NR;
        const r = sapNoseRing(t);
        r.z = t * NOSE;
        rings.push(r);
      }
      return loft(profile, rings, YB, noseCol, { capFront: true, tip: 0.35 });
    };
    // лобовое стекло — отдельная гладкая «накладка» по форме носа
    const wsProfile = [];
    for (let y = 2.45; y <= 4.08; y += 0.12) {
      // интерполяция x по правой половине профиля
      let x = 0;
      for (let i = 0; i < half.length - 1; i++) {
        const [x0, y0] = half[i], [x1, y1] = half[i + 1];
        if (y >= y0 && y <= y1 && y1 > y0) { x = x0 + (x1 - x0) * (y - y0) / (y1 - y0); break; }
      }
      wsProfile.push([x, y]);
    }
    const ws = [...wsProfile.map(([x, y]) => [x, y, 'k']), ...wsProfile.slice(0, -1).reverse().map(([x, y]) => [-x, y, 'k'])];
    const wsGeo = () => {
      const rings = [];
      const T0 = 0.2, T1 = 0.86, NRW = 12;
      for (let k = 0; k <= NRW; k++) {
        const t = T0 + (T1 - T0) * (k / NRW);
        const r = sapNoseRing(t);
        // слегка «надуваем» над поверхностью и сужаем к краям участка
        rings.push({ t, z: t * NOSE + 0.02, sx: r.sx * 1.012, sy: r.sy * 1.008, dy: r.dy + 0.012 });
      }
      // профиль идёт против часовой (вверх по правой стороне, вниз по левой) — нормали наружу
      return loft(ws, rings, YB, () => LIV.k, { closed: false });
    };
    const bodyGeo = (len) => loft(profile, [{ z: -len, sx: 1, sy: 1 }, { z: 0, sx: 1, sy: 1 }], YB, bodyCol);
    const gangGeo = (len) => loft(profile, [{ z: -len, sx: 0.9, sy: 0.92 }, { z: 0, sx: 0.9, sy: 0.92 }], YB, () => LIV.g);
    const paint = M_('#ffffff', 0.25, 0.12, { vertexColors: true }, 1.0);
    const mats = {
      dark: M_('#1e2124', 0.6, 0.4, {}, 0.5), wheel: M_('#2a2c2e', 0.5, 0.6, {}, 0.6), steel: M_('#9aa1a8', 0.4, 0.75, {}, 1.0),
      grey: M_('#c9cdd1', 0.35, 0.2, {}, 0.9),
      lamp: M_('#ffffff', 0.2, 0, { emissive: new THREE.Color('#f4f8ff'), emissiveIntensity: 2.2 }, 0.3),
    };
    const CARS = 10, CL = 25.0, GAP = 0.8;
    const parts = [];
    const push = (g) => { parts.push(g.toNonIndexed()); g.dispose(); };
    const b = new Batch();
    for (let i = 0; i < CARS; i++) {
      const zf = -i * (CL + GAP);
      const lead = i === 0, tail = i === CARS - 1;
      const zA = lead ? zf - NOSE : zf;
      const zB = tail ? zf - CL + NOSE : zf - CL;
      push(bodyGeo(zA - zB).translate(0, 0, zA));
      if (lead) { push(noseGeo().translate(0, 0, zA)); push(wsGeo().translate(0, 0, zA)); }
      if (tail) { push(noseGeo().rotateY(Math.PI).translate(0, 0, zB)); push(wsGeo().rotateY(Math.PI).translate(0, 0, zB)); }
      if (!tail) push(gangGeo(GAP).translate(0, 0, zf - CL));
      for (const bz of [zf - (lead ? 4.6 : 2.8), zf - CL + (tail ? 4.6 : 2.8)]) {
        b.add('dark', place(box(2.5, 0.5, 3.2), 0, 0.62, bz));
        wheelsUnder(b, 'wheel', [bz - 1.25, bz + 1.25], 0.46, 0.8);
      }
      for (const dz of [zf - (lead ? NOSE + 1.2 : 1.6), zf - CL + (tail ? NOSE + 1.2 : 1.6)]) {
        for (const s of [-1, 1]) {
          b.add('grey', place(box(0.03, 2.0, 0.05), s * 1.636, 2.2, dz - 0.5));
          b.add('grey', place(box(0.03, 2.0, 0.05), s * 1.636, 2.2, dz + 0.5));
        }
      }
    }
    pantograph(b, -(CL + GAP) - 6, 4.05);
    pantograph(b, -6 * (CL + GAP) - 6, 4.05);
    for (const s of [-1, 1]) { // фары-полосы
      const t = 0.8, r = sapNoseRing(t);
      const y = YB + (1.32 - YB) * r.sy + r.dy;
      b.add('lamp', place(box(0.5, 0.07, 0.6), s * 1.45 * r.sx * 0.86, y, -NOSE + t * NOSE - 0.1, s * 0.5));
    }
    const bodyMesh = new THREE.Mesh(merge(parts), paint);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    const grp = new THREE.Group();
    grp.add(bodyMesh, b.build(mats));
    return { group: grp, stack: null, smokeColor: '#fff' };
  }

  const BUILDERS = { steam51: buildSteam, electro: buildElectro, sapsan: buildSapsan };
  const TRACK_OF = { steam51: 22.1, electro: 13.9, sapsan: 22.1 };
  for (const t of Object.keys(BUILDERS)) {
    const tr = BUILDERS[t]();
    Object.assign(tr, { type: t, z: FAR_Z, mode: 'hidden', t0: 0, dur: 1, zFrom: FAR_Z, speed: 0 });
    tr.group.position.set(TRACK_OF[t], 0.46, FAR_Z);
    tr.group.visible = false;
    scene.add(tr.group);
    trains[t] = tr;
  }
  // необязательная внешняя модель «Сапсана» (только если путь задан в MODELS)
  if (MODELS.sapsan) {
    import('./vendor/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync(MODELS.sapsan)).then((gltf) => {
      const obj = gltf.scene;
      obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const bb = new THREE.Box3();
      const size = new THREE.Vector3();
      obj.updateMatrixWorld(true);
      bb.setFromObject(obj).getSize(size);
      if (size.x > size.z) obj.rotation.y = Math.PI / 2;
      if (MODELS.sapsanFlip) obj.rotation.y += Math.PI;
      obj.updateMatrixWorld(true);
      bb.setFromObject(obj).getSize(size);
      obj.scale.multiplyScalar(3.265 / size.x); // ширина кузова 3265 мм
      obj.updateMatrixWorld(true);
      bb.setFromObject(obj);
      obj.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -bb.max.z);
      const g = trains.sapsan.group;
      g.clear();
      g.add(obj);
    }).catch(() => { /* остаётся процедурная модель */ });
  }

  let currentTrain = null;
  const LEAVE_DUR = 3.0, ARRIVE_DUR = 4.4;
  function leave(tr, now) {
    if (tr.mode === 'hidden' || (tr.mode === 'arriving' && now < tr.t0)) { tr.mode = 'hidden'; tr.group.visible = false; return 0; }
    tr.mode = 'leaving'; tr.zFrom = tr.z; tr.t0 = now; tr.dur = LEAVE_DUR;
    return LEAVE_DUR;
  }
  function arrive(tr, now, delay) {
    if (tr.mode === 'leaving' || tr.mode === 'idle') {
      tr.zFrom = tr.z; tr.t0 = now;
      tr.dur = Math.max(1.2, ARRIVE_DUR * Math.min(1, (STOP_Z - tr.z) / (STOP_Z - FAR_Z)));
    } else { tr.zFrom = FAR_Z; tr.t0 = now + delay; tr.dur = ARRIVE_DUR; }
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
    if (currentTrain === next) { if (next.mode === 'leaving') arrive(next, now, 0); return; }
    let wait = 0.5;
    if (currentTrain) {
      const left = leave(currentTrain, now);
      if (TRACK_OF[currentTrain.type] === TRACK_OF[type] && left > 0) wait = left + 0.2;
    }
    for (const t of Object.values(trains)) {
      if (t !== next && t.mode === 'leaving' && TRACK_OF[t.type] === TRACK_OF[type]) wait = Math.max(wait, t.t0 + t.dur - now + 0.2);
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

  /* ---------- Дым паровоза ---------- */
  const puffs = [];
  const puffGeo = new THREE.IcosahedronGeometry(0.7, 1);
  for (let i = 0; i < 26; i++) {
    const m = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 1, transparent: true, opacity: 0, depthWrite: false });
    const p = new THREE.Mesh(puffGeo, m);
    p.visible = false;
    p.userData = { life: 1, vx: 0, vy: 0, vz: 0, spin: 0 };
    scene.add(p);
    puffs.push(p);
  }
  let puffIdx = 0, emitAcc = 0;
  function updateSmoke(dt) {
    if (!reduce) {
      for (const t of Object.values(trains)) {
        if (!t.stack || !t.group.visible) continue;
        emitAcc += dt * (t.speed > 0.5 ? 9 : 1.8);
        while (emitAcc >= 1) {
          emitAcc -= 1;
          const p = puffs[puffIdx++ % puffs.length];
          p.position.copy(t.stack).add(t.group.position);
          p.userData.life = 0;
          p.userData.vx = (Math.random() - 0.5) * 0.4 + 0.3;
          p.userData.vy = 1.8 + Math.random() * 0.6;
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
      u.life += dt / 3.4;
      if (u.life >= 1) { p.visible = false; continue; }
      p.position.x += u.vx * dt;
      p.position.y += u.vy * dt * (1 - u.life * 0.6);
      p.position.z += u.vz * dt;
      p.rotation.y += u.spin * dt;
      p.scale.setScalar(0.6 + u.life * 3.2);
      p.material.opacity = 0.5 * (1 - u.life) * Math.min(1, u.life * 8);
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
  const LOOK_DUR = 2.4;
  const tmpV = new THREE.Vector3();
  const haloFeats = ['gasSq', 'gasLow', 'gasHigh', 'electric'];

  function applyLook(l) {
    skyU.top.value.copy(l.skyTop);
    skyU.horizon.value.copy(l.skyHorizon);
    skyU.bottom.value.copy(l.skyBottom);
    skyU.fogC.value.copy(l.fog);
    skyU.sunColor.value.copy(l.sun);
    skyU.sunGlow.value = l.sunGlow;
    skyU.cloudC.value.copy(l.cloudC);
    skyU.cloud.value = l.cloud;
    scene.fog.color.copy(l.fog);
    scene.fog.near = l.fogNear;
    scene.fog.far = l.fogFar;
    renderer.setClearColor(l.fog);
    renderer.toneMappingExposure = l.exposure;

    const ce = Math.cos(l.sunEl);
    tmpV.set(ce * Math.cos(l.sunAz), Math.sin(l.sunEl), ce * Math.sin(l.sunAz));
    skyU.sunDir.value.copy(tmpV);
    sun.position.copy(SUN_T).addScaledVector(tmpV.normalize(), 280);
    if (sun.position.y < 25) sun.position.y = 25;
    sun.color.copy(l.sun);
    sun.intensity = l.sunInt;
    hemi.color.copy(l.hemiSky);
    hemi.groundColor.copy(l.hemiGround);
    hemi.intensity = l.hemiInt;

    for (const k of ['ground', 'paving', 'road', 'wallA', 'wallB', 'trim', 'plinth', 'roof', 'city']) M[k].color.copy(l[k]);
    M.rustA.color.copy(l.wallA);
    M.rustB.color.copy(l.wallB);
    M.edge.color.copy(l.edgeC);
    M.cityRoof.color.copy(l.roof).multiplyScalar(0.9);
    M.city.emissiveIntensity = l.cityGlow * 0.9;
    M.glass.emissive.copy(l.winGlow);
    M.glass.emissiveIntensity = l.win;
    M.door.emissive.copy(l.winGlow);
    M.door.emissiveIntensity = l.win * 0.7;
    M.clockFace.emissiveIntensity = l.win * 0.8;
    M.lampGlass.emissive.copy(l.lampColor);
    M.lampGlass.emissiveIntensity = l.lamp;
    M.strip.emissiveIntensity = l.lamp * 0.5;
    for (const m of haloMats) m.color.copy(l.lampColor);
    for (const [m, base] of ENV) m.envMapIntensity = base * l.env * 1.6;
    spots.forEach((s) => { s.intensity = l.facade * s.userData.base; });

    for (const f of FEATS) applyFade(f, l['f_' + f]);
    for (const f of haloFeats) {
      if (!feats[f].visible) continue;
      const v = l['f_' + f];
      feats[f].traverse((o) => { if (o.isSprite) o.material.opacity = Math.min(1, l.halo * v); });
    }
  }

  let targetIdx = 0;
  let paveIdx = -1;
  function setPave(i) {
    paveIdx = i;
    M.paving.map = PAVE[i];
    M.paving.bumpMap = PAVE[i];
  }
  function setEra(i, instant) {
    const now = performance.now() / 1000;
    targetIdx = i;
    to = lookOf(i);
    if (instant) {
      cur = cloneLook(to);
      from = cloneLook(to);
      tStart = -1e9;
      setPave(i);
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
        if (key.startsWith('f_')) fk = to[key] > from[key] ? easeInOut(Math.max(0, (p - 0.3) / 0.7)) : easeInOut(Math.min(1, p / 0.7));
        cur[key] = from[key] + (to[key] - from[key]) * fk;
      }
    }
    if (p >= 0.5 && paveIdx !== targetIdx) setPave(targetIdx);
    applyLook(cur);
    if (p >= 1) tStart = -1;
  }

  /* ---------- Камера ---------- */
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 40;
  controls.maxDistance = 260;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.45;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.autoRotateSpeed = -0.3;
  controls.autoRotate = !reduce;
  canvas.style.touchAction = 'pan-y';
  let lastUser = -1e9;
  let viewLocked = false;
  controls.addEventListener('start', () => { controls.autoRotate = false; lastUser = performance.now(); interact(); });
  controls.addEventListener('end', () => { lastUser = performance.now(); });

  function initialCamera(aspect) {
    const portrait = aspect < 0.8;
    if (portrait) controls.target.set(4, 8, -16);
    const r = portrait ? 168 : aspect < 1.2 ? 150 : 118;
    const sph = new THREE.Spherical(r, portrait ? 1.3 : 1.38, portrait ? 0.95 : 0.74);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
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
    camera.fov = W / H < 0.8 ? 46 : 36;
    if (!viewLocked) {
      if (W < 721) camera.setViewOffset(W, H, 0, Math.round(H * 0.12), W, H);
      else camera.setViewOffset(W, H, -Math.round(W * 0.1), Math.round(H * 0.06), W, H);
    }
    camera.updateProjectionMatrix();
  }
  resize();
  initialCamera(W / H);
  new ResizeObserver(resize).observe(stage);

  /* ---------- Цикл ---------- */
  let inView = true;
  new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; }, { threshold: 0.01 }).observe(stage);
  let lastT = performance.now() / 1000;
  let prevSmoke = lastT;
  let clockKey = -1;
  function updateClock() {
    const d = new Date();
    const m = d.getMinutes() + d.getSeconds() / 60;
    const key = Math.floor(m * 4);
    if (key === clockKey) return;
    clockKey = key;
    const hA = (((d.getHours() % 12) + m / 60) / 12) * Math.PI * 2;
    const mA = (m / 60) * Math.PI * 2;
    for (const h of clockHands) { h.hourH.rotation.z = -hA; h.minH.rotation.z = -mA; }
  }
  function waveFlag(t) {
    if (!feats.flag.visible) return;
    for (const g of flagGeos) {
      const p = g.attributes.position.array, b = g.userData.base;
      for (let i = 0; i < p.length; i += 3) {
        const x = b[i] - 0.08;
        p[i + 2] = b[i + 2] + Math.sin(x * 2.2 - t * (reduce ? 0 : 3.2)) * 0.12 * x / 2.7;
      }
      g.attributes.position.needsUpdate = true;
      g.computeVertexNormals();
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    const dt = Math.min(now - lastT, 0.05);
    lastT = now;
    if (document.hidden || !inView) return;
    if (!reduce && !viewLocked && !controls.autoRotate && performance.now() - lastUser > 9000) controls.autoRotate = true;
    controls.update();
    sky.position.copy(camera.position);
    stepLook(now);
    updateTrains(now, dt);
    updateSmoke(Math.min(now - prevSmoke, 0.25));
    prevSmoke = now;
    updateClock();
    waveFlag(now);
    renderer.render(scene, camera);
  }

  setEra(0, true);
  requestAnimationFrame(frame);

  return {
    setEra,
    setReduce(r) { controls.autoRotate = !r && !viewLocked; if (r) setEra(targetIdx, true); },
    /** Для тестов/скриншотов: зафиксировать ракурс. */
    view(px, py, pz, tx2, ty, tz) {
      viewLocked = true;
      controls.autoRotate = false;
      controls.minDistance = 2;
      controls.maxPolarAngle = 1.56;
      camera.clearViewOffset();
      camera.position.set(px, py, pz);
      controls.target.set(tx2, ty, tz);
      controls.update();
    },
    stats() { return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
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
    window.__carouselError = String(err && err.stack || err);
    showFallback();
  }
} else {
  showFallback();
}

setPaused(ui.userPaused);
goTo(0, { instant: true });
requestAnimationFrame(uiTick);

window.leningradCarousel = {
  goTo: (i) => goTo(i, { user: true }),
  pause: () => setPaused(true),
  play: () => setPaused(false),
  view: (...a) => world && world.view(...a),
  stats: () => world && world.stats(),
  get index() { return ui.idx; },
  get webgl() { return !!world; },
};
