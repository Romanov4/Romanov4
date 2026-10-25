/*
 * «Историческая карусель» — Ленинградский вокзал (Москва), три эпохи.
 * Процедурная модель здания К. А. Тона в реальном масштабе (метры) по фото заказчика и docs/RESEARCH-ARCH.md:
 * цельный объём 53 × 25,6 м, 9 осей фасада, башня 7,5 × 7,5 м; окружение и планировка — по «ТЗ для 3D».
 * Система координат: x — вдоль площади (влево −), z — к площади (+), фасад Тона z = +10, ось x = 0, y — высота.
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
    text: 'Петербургский вокзал — первый вокзал Москвы — открыт в 1851 году по проекту архитектора Константина Тона; с 1855 года он называется Николаевским. Двухэтажное здание в девять осей с башней-часами стоит на немощёной площади. За ним — дебаркадер с каменными стенами-аркадами и металлической кровлей, по бокам — ограды с арочными воротами, слева — здание таможни того же Тона.',
    desc: 'утро на немощёной площади, ряды извозчиков и чугунные фонари, двухэтажное здание Тона в девять осей с коринфским ордером, башней-часами и шпилем, за ним — дебаркадер с каменными аркадами и двускатной металлической кровлей, под ним паровоз 2-2-0 и вагоны трёх классов, по бокам — ограды с арочными воротами и полосатая будка, слева — трёхэтажное здание таможни',
    train: 'steam51',
    filter: 'sepia(0.2) saturate(0.9) contrast(1.02)',
    vignette: 0.3,
    fb: { sky: '#eadcc0', wall: '#e2d2a6', wall2: '#f3ecdb', glow: '#4a3d30', dome: '#a9b2b2' },
    look: {
      skyTop: '#86a3c0', skyHorizon: '#f0e4c8', skyBottom: '#cdbb9a', fog: '#e8dcc2', fogNear: 170, fogFar: 640, cloudC: '#fbf3e4', cloud: 0.4,
      sun: '#ffe2b8', sunInt: 3.0, sunAz: 0.95, sunEl: 0.5,
      hemiSky: '#e8eef2', hemiGround: '#7a6a50', hemiInt: 0.9,
      ground: '#a8987a', paving: '#b9a88a', road: '#8e8476', edgeC: '#d8d0bf',
      wallA: '#e8d9ae', trim: '#f3f0e6', plinth: '#cfc6b0', roof: '#aeb8b6', dome: '#b4bdbd', debWall: '#d9c9a4', customsRoof: '#8c9496', signC: '#1f3e8c',
      city: '#d2c4a8', winGlow: '#ffcf8a', win: 0.04, glassUp: 0.03, lampColor: '#ffc070', lamp: 0.6, halo: 0.12,
      facade: 0, wallGlow: 0, colLit: 0, signGlow: 0, signHalo: 0, clock: 0, led: 0,
      exposure: 1.0, sunGlow: 0.55, env: 0.55, cityGlow: 0,
    },
    feat: { tsarSite: 1, carriages: 1, gasSq: 1, gasLow: 1, people1: 1, cityLow: 1, oldNeighbors: 1, tracks51: 1, platLow: 1, debark: 1 },
  },
  {
    era: 'Советская', short: '1960-е', year: '1960-е', period: '1960-е — начало 1970-х',
    title: 'Советская эпоха',
    text: 'В 1923 году вокзал переименовали в Октябрьский, затем — в Ленинградский. В 1960-е фасад окрашен в белый цвет, на кровле стоят буквы «ЛЕНИНГРАДСКИЙ», шпиль башни венчает звезда. За зданием ещё стоит старый дебаркадер: его торец к путям — охристый щипец с надписью «МОСКВА». Справа — наземный вестибюль метро «Комсомольская» (1952, архитектор А. В. Щусев), слева за проездом вдоль путей — длинный белый трёхэтажный корпус.',
    desc: 'ясный осенний день, асфальт, «Волги», трамваи и автобус на площади, белый фасад здания Тона, буквы «ЛЕНИНГРАДСКИЙ» на кровле, звезда на шпиле башни, за зданием — старый дебаркадер с охристым щипцом «МОСКВА» к путям, низкие навесы над платформами и контактная сеть, электровоз и тёмно-красные вагоны, справа — купольный вестибюль метро с шестиколонным портиком и шпилем со звездой, дальше — небольшое двухэтажное здание касс и Ярославский вокзал, слева за проездом с пилонами — длинный белый трёхэтажный корпус, на углу — таможня',
    train: 'electro',
    filter: 'sepia(0.05) saturate(0.86) contrast(1.02)',
    vignette: 0.16,
    fb: { sky: '#d3dfe8', wall: '#dcdfd8', wall2: '#eef0ec', glow: '#3e3a33', dome: '#aeb9be' },
    look: {
      skyTop: '#7f9fc0', skyHorizon: '#dfe4e4', skyBottom: '#b9b5aa', fog: '#d9dcda', fogNear: 150, fogFar: 600, cloudC: '#f2f2f0', cloud: 0.3,
      sun: '#fff1dc', sunInt: 2.7, sunAz: 2.05, sunEl: 0.55,
      hemiSky: '#e4e8ec', hemiGround: '#6a6458', hemiInt: 1.05,
      ground: '#6b7550', paving: '#77787a', road: '#58595c', edgeC: '#ece7da',
      wallA: '#dcdfd8', trim: '#eaece7', plinth: '#c9ccc6', roof: '#b5bbb8', dome: '#b4bdbd', debWall: '#c9a77a', customsRoof: '#8a5a44', signC: '#2f3f6a',
      city: '#c6c0b4', winGlow: '#fff0c8', win: 0.05, glassUp: 0.04, lampColor: '#fff3d8', lamp: 0.4, halo: 0.08,
      facade: 0, wallGlow: 0, colLit: 0, signGlow: 0, signHalo: 0, clock: 0, led: 0,
      exposure: 1.0, sunGlow: 0.3, env: 0.7, cityGlow: 0.05,
    },
    feat: {
      debark: 1, moskva: 1, tracks51: 1, platLow: 1, sovSite: 1, tracksSov: 1, platSov: 1, canopySov: 1, catSov: 1, cars: 1, electric: 1,
      people2: 1, mzha: 1, modernSite: 1, metro: 1, neighbors: 1, trees: 1, cityMid: 1, longSov: 1,
    },
  },
  {
    era: 'Настоящее', short: '2026', year: '2026', period: 'после реконструкции 2024–2026',
    title: 'Настоящее',
    text: 'Закрытый 11 августа 2024 года вокзал вновь открылся 22 мая 2026-го. Фасаду вернули кремовый цвет с белыми деталями по снимку 1873 года, на башне снова флагшток с флагом, на кровле — новая вывеска с логотипами. За зданием — зал 1970-х со световыми люками и высокий тёмный объём, справа — новый гранёный дебаркадер из металла и стекла, к поездам на 12 путях ведут навесы платформ.',
    desc: 'ночь, тёплая белая подсветка колонн снизу, светящиеся окна и циферблаты, бело-голубые буквы «ЛЕНИНГРАДСКИЙ ВОКЗАЛ» с логотипами РЖД и «Московского транспорта», флаг России на башне, кремовый фасад с белыми деталями, за зданием — зал с рядами световых люков и тёмный высокий объём, справа — гранёный дебаркадер с точечными огнями и свод над головами платформ, двенадцать путей с навесами и «Сапсан», справа — купольный вестибюль метро, слева — длинный корпус с серой кровлей и таможня',
    train: 'sapsan',
    filter: 'sepia(0) saturate(1.04) contrast(1.03)',
    vignette: 0.28,
    fb: { sky: '#17172c', wall: '#e8d9ae', wall2: '#f6f0dc', glow: '#f6d9a0', dome: '#6e9a86' },
    look: {
      skyTop: '#0b0c20', skyHorizon: '#2a2948', skyBottom: '#141320', fog: '#1c1b2e', fogNear: 150, fogFar: 640, cloudC: '#34324a', cloud: 0.22,
      sun: '#a9b8ff', sunInt: 0.35, sunAz: -2.3, sunEl: 0.6,
      hemiSky: '#56628f', hemiGround: '#2a2622', hemiInt: 0.55,
      ground: '#3a3a40', paving: '#8a7f72', road: '#2f2f34', edgeC: '#e3c13a',
      wallA: '#e8d9ae', trim: '#f3f0e6', plinth: '#cfc6b0', roof: '#aeb8b6', dome: '#6e9a86', debWall: '#d9c9a4', customsRoof: '#8c9496', signC: '#1f3e8c',
      city: '#4a4658', winGlow: '#f6d9a0', win: 0.55, glassUp: 1.25, lampColor: '#ffe2b4', lamp: 2.6, halo: 0.75,
      facade: 1, wallGlow: 0.16, colLit: 1.9, signGlow: 2.6, signHalo: 1.0, clock: 1.3, led: 1,
      exposure: 1.05, sunGlow: 0, env: 0.3, cityGlow: 1.0,
    },
    feat: {
      modernSite: 1, metro: 1, neighbors: 1, trees: 1, cityMid: 1, cityHigh: 1, long26: 1, nowSite: 1, flag: 1, sign26: 1, complex26: 1,
      tracks26: 1, plat26: 1, canopy26: 1, cat26: 1, lamp26: 1, wallLamps: 1, people3: 1,
    },
  },
];
/* Дневной свет для «Настоящего» — только для сравнительных снимков (window.leningradCarousel.day(true)). */
const DAY26 = {
  skyTop: '#7f9fc0', skyHorizon: '#e4e6e2', skyBottom: '#b9b5aa', fog: '#d6dade', fogNear: 170, fogFar: 700, cloudC: '#f4f4f2', cloud: 0.45,
  sun: '#fff4e2', sunInt: 2.8, sunAz: 1.2, sunEl: 0.75, hemiSky: '#e4e8ec', hemiGround: '#6a6458', hemiInt: 1.0,
  ground: '#6f6c62', road: '#58595c', city: '#c6c0b4', win: 0.03, glassUp: 0.03, lamp: 0.3, halo: 0, facade: 0, wallGlow: 0, colLit: 0,
  signGlow: 0, signHalo: 0, clock: 0, led: 0, exposure: 1.0, sunGlow: 0.3, env: 0.7, cityGlow: 0,
};
const N = ERAS.length;
const FEATS = [
  'tsarSite', 'carriages', 'gasSq', 'gasLow', 'people1', 'cityLow', 'oldNeighbors', 'tracks51', 'platLow', 'debark', 'moskva',
  'sovSite', 'tracksSov', 'platSov', 'canopySov', 'catSov', 'cars', 'electric', 'people2', 'mzha',
  'modernSite', 'metro', 'neighbors', 'trees', 'cityMid', 'longSov', 'long26',
  'nowSite', 'flag', 'sign26', 'complex26', 'tracks26', 'plat26', 'canopy26', 'cat26', 'lamp26', 'wallLamps', 'people3', 'cityHigh',
];
const COLOR_KEYS = ['skyTop', 'skyHorizon', 'skyBottom', 'fog', 'cloudC', 'sun', 'hemiSky', 'hemiGround', 'ground',
  'paving', 'road', 'edgeC', 'wallA', 'trim', 'plinth', 'roof', 'dome', 'debWall', 'customsRoof', 'signC', 'city', 'winGlow', 'lampColor'];
const NUM_KEYS = ['fogNear', 'fogFar', 'cloud', 'sunInt', 'sunAz', 'sunEl', 'hemiInt', 'win', 'glassUp', 'lamp', 'halo', 'facade',
  'wallGlow', 'colLit', 'signGlow', 'signHalo', 'clock', 'led', 'exposure', 'sunGlow', 'env', 'cityGlow'];

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
  fbs.setProperty('--fb-dome', e.fb.dome);
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

/** UV для подсветки колонн снизу: v = 0 у основания ствола, 1 — у капители (по ярусам здания Тона и башни). */
function floorUV(geo) {
  const p = geo.attributes.position.array;
  const uv = new Float32Array((p.length / 3) * 2);
  for (let i = 0, j = 0; i < p.length; i += 3, j += 2) {
    const y = p[i + 1];
    let v;
    if (y < 8.55) v = (y - 2.1) / 5.6;
    else if (y < 16.5) v = (y - 9.8) / 5.1;
    else if (y < 25.1) v = (y - 18.4) / 6.4;
    else v = (y - 25.3) / 6.2;
    uv[j] = 0.5; uv[j + 1] = Math.min(1, Math.max(0, v));
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
      if (mat.userData.floorUV) floorUV(geo);
      else if (mat.map || mat.bumpMap || mat.emissiveMap) worldUV(geo, mat.userData.uvs || 4);
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
  dirt: () => canvasTex((g, S) => {
    noise(g, S, 214, 14, 16, 5, 12);
    const r = rng(17);
    for (let i = 0; i < 70; i++) { // колеи и камешки
      g.fillStyle = `rgba(${r() > 0.5 ? '90,80,60' : '255,250,235'},${0.05 + r() * 0.08})`;
      g.beginPath(); g.ellipse(r() * S, r() * S, 2 + r() * S * 0.05, 1 + r() * S * 0.02, r() * 3, 0, Math.PI * 2); g.fill();
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
  /** Подсветка колонн снизу: яркий низ, мягкий верх, пятно под капителью (v = 0 — низ ствола). */
  colGrad: () => {
    const t = canvasTex((g, S) => {
      const gr = g.createLinearGradient(0, S, 0, 0);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.3, '#d2d2d2');
      gr.addColorStop(0.75, '#8c8c8c');
      gr.addColorStop(1, '#b4b4b4');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
    }, { size: 64 });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  },
};

/* ---------- Надписи (canvas-текстуры; перерисовываются после загрузки шрифта) ---------- */
const SERIF = '"Cormorant Garamond", "PT Serif", Georgia, "Times New Roman", serif';
const SANS = '"PT Sans", Arial, sans-serif';
const TEXT_TEX = [];
function textTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.redraw = () => { g.clearRect(0, 0, w, h); g.filter = 'none'; draw(g, w, h); t.needsUpdate = true; };
  t.userData.redraw();
  TEXT_TEX.push(t);
  return t;
}
/** Буквы вывески (белые на прозрачном; цвет и свечение задаёт материал). blur — для ореола. */
function wordTex(word, w, h, blur = 0) {
  return textTex(w, h, (g) => {
    if (blur) g.filter = `blur(${blur}px)`;
    g.fillStyle = '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.86)}px ${SERIF}`;
    g.fillText(word, w / 2, h * 0.54, w * 0.98);
    g.strokeStyle = '#fff'; g.lineWidth = h * 0.07; g.lineJoin = 'round';
    g.strokeText(word, w / 2, h * 0.54, w * 0.98);
  });
}
/** Правая часть вывески 2026: «ВОКЗАЛ» + логотип РЖД + «Московский транспорт» (x +5…+22 м). */
function rightSignTex(w, h, blur = 0) {
  return textTex(w, h, (g) => {
    if (blur) g.filter = `blur(${blur}px)`;
    const pxm = w / 17; // пикселей на метр
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.86)}px ${SERIF}`;
    g.fillText('ВОКЗАЛ', pxm * 4, h * 0.54, pxm * 7.8);
    g.lineWidth = h * 0.07; g.lineJoin = 'round';
    g.strokeText('ВОКЗАЛ', pxm * 4, h * 0.54, pxm * 7.8);
    // РЖД: курсивные слитные буквы
    g.save();
    g.translate(pxm * 10, h * 0.55);
    g.transform(1, 0, -0.25, 1, 0, 0);
    g.font = `700 ${Math.round(h * 0.78)}px ${SANS}`;
    g.fillText('РЖД', 0, 0, pxm * 2.9);
    g.lineWidth = h * 0.05; g.strokeText('РЖД', 0, 0, pxm * 2.9);
    g.restore();
    // «Московский транспорт»: знак-капля и две строки
    const cx = pxm * 12.9, cy = h * 0.5, r = h * 0.4;
    g.lineWidth = r * 0.32;
    g.beginPath(); g.arc(cx, cy, r * 0.8, -Math.PI * 0.35, Math.PI * 1.5); g.stroke();
    g.beginPath(); g.arc(cx, cy, r * 0.22, 0, Math.PI * 2); g.fill();
    g.textAlign = 'left';
    g.font = `700 ${Math.round(h * 0.3)}px ${SANS}`;
    g.fillText('Московский', cx + r * 1.2, h * 0.32, pxm * 3.6);
    g.fillText('транспорт', cx + r * 1.2, h * 0.7, pxm * 3.6);
  });
}
function moskvaTex() {
  return textTex(1024, 192, (g, w, h) => {
    g.fillStyle = '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.86)}px ${SERIF}`;
    g.fillText('МОСКВА', w / 2, h * 0.54, w * 0.98);
  });
}
function boardTex() {
  return textTex(512, 128, (g, w, h) => {
    g.fillStyle = '#0d0f10'; g.fillRect(0, 0, w, h);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#b9d6c0';
    g.font = `400 ${Math.round(h * 0.2)}px ${SANS}`;
    g.fillText('Московское время', w / 2, h * 0.2);
    g.fillStyle = '#ffb02e';
    g.font = `700 ${Math.round(h * 0.6)}px "Courier New", monospace`;
    g.fillText('08 53', w / 2, h * 0.64);
  });
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
    plaster: T.plaster(), roof: T.roof(), rust: T.rust(), cobble: T.cobble(), asphalt: T.asphalt(), dirt: T.dirt(),
    granite: T.granite(), cityWalls: T.cityWalls(), cityLit: T.cityLit(), contact: T.contact(), colGrad: T.colGrad(),
  };
  const ENV = []; // [материал, базовая envMapIntensity]
  function M_(color, rough, metal, extra = {}, env = 0.5, uvs) {
    const m = std(color, rough, metal, extra);
    m.envMapIntensity = env;
    if (uvs) m.userData.uvs = uvs;
    ENV.push([m, env]);
    return m;
  }
  const WARM = '#ffe6bf'; // тёплый белый ≈3000 K (ночная подсветка 2026)
  const C = (c) => new THREE.Color(c);
  const plasterMap = (bump = 0.5) => ({ map: tx.plaster, bumpMap: tx.plaster, bumpScale: bump });
  const M = {
    // здание Тона: цвета стен/деталей/кровли меняются по эпохам (look)
    wallA: M_('#e8d9ae', 0.92, 0, { ...plasterMap(0.5), emissive: C(WARM), emissiveIntensity: 0 }, 0.45, 3),
    trim: M_('#f3f0e6', 0.8, 0, { ...plasterMap(0.35), emissive: C(WARM), emissiveIntensity: 0 }, 0.5, 2),
    colLit: M_('#f3f0e6', 0.75, 0, { emissive: C(WARM), emissiveMap: tx.colGrad, emissiveIntensity: 0 }, 0.5),
    plinth: M_('#cfc6b0', 0.9, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 0.8 }, 0.4, 2),
    roof: M_('#aeb8b6', 0.5, 0.45, { map: tx.roof, bumpMap: tx.roof, bumpScale: 0.6 }, 0.7, 4),
    dome: M_('#6e9a86', 0.5, 0.35, {}, 0.8),
    glass: M_('#2e3a40', 0.1, 0.1, { emissive: C('#f6d9a0'), emissiveIntensity: 0.05 }, 1.2),
    glassUp: M_('#2e3a40', 0.1, 0.1, { emissive: C('#f6d9a0'), emissiveIntensity: 0.05 }, 1.2),
    frame: M_('#5a3e2b', 0.6, 0, {}, 0.4),
    door: M_('#6b4a30', 0.55, 0, { emissive: C('#f6d9a0'), emissiveIntensity: 0.03 }, 0.5),
    dark: M_('#2b2a28', 0.6, 0.3, {}, 0.5),
    gold: M_('#c9a24a', 0.35, 0.8, {}, 1.0),
    bronze: M_('#6b5a3a', 0.45, 0.7, {}, 0.9),
    clockFace: M_('#f2f4f2', 0.5, 0, { emissive: C('#eaf2ff'), emissiveIntensity: 0 }, 0.5),
    ground: M_('#8f7e62', 1, 0, {}, 0.3),
    paving: M_('#b5a58a', 0.95, 0, { map: tx.dirt, bumpMap: tx.dirt, bumpScale: 1.2 }, 0.35, 3),
    road: M_('#55555a', 0.95, 0, { map: tx.asphalt }, 0.3, 6),
    platform: M_('#a29c90', 0.95, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 0.6 }, 0.35, 4),
    edge: M_('#e3c13a', 0.8, 0, {}, 0.4),
    ballast: M_('#6f675e', 1, 0, { map: tx.asphalt, bumpMap: tx.asphalt, bumpScale: 2 }, 0.2, 1.5),
    rail: M_('#5c5650', 0.4, 0.8, {}, 0.8),
    sleeper: M_('#4a3b2e', 1, 0, {}, 0.2),
    city: M_('#c6c0b4', 0.9, 0, { map: tx.cityWalls, emissive: C('#ffffff'), emissiveMap: tx.cityLit, emissiveIntensity: 0 }, 0.3, 12),
    cityRoof: M_('#6e6a66', 0.9, 0, {}, 0.3),
    tree: M_('#55703f', 0.95, 0, {}, 0.3),
    trunk: M_('#5a4632', 1, 0, {}, 0.2),
    lampGlass: M_('#fff1d0', 0.4, 0, { emissive: C('#ffc070'), emissiveIntensity: 0.8 }, 0.5),
    iron: M_('#2e2e30', 0.55, 0.5, {}, 0.6),
    steel: M_('#9aa2a8', 0.4, 0.75, {}, 1.0),
    // дебаркадер 1851 (царская, советская)
    debWall: M_('#d9c9a4', 0.92, 0, plasterMap(0.5), 0.4, 3),
    debTrim: M_('#f0ede4', 0.85, 0, {}, 0.4),
    debRoof: M_('#7d7f7b', 0.55, 0.5, { map: tx.roof, bumpMap: tx.roof, bumpScale: 0.6 }, 0.6, 4),
    // соседи
    customs: M_('#e3cf9a', 0.92, 0, plasterMap(0.4), 0.45, 3),
    customsRust: M_('#e3cf9a', 0.92, 0, { map: tx.rust, bumpMap: tx.rust, bumpScale: 1.0 }, 0.45, 3),
    customsTrim: M_('#f2eee2', 0.85, 0, {}, 0.45),
    customsRoof: M_('#8c9496', 0.6, 0.3, { map: tx.roof, bumpMap: tx.roof, bumpScale: 0.5 }, 0.5, 4),
    white: M_('#ecedea', 0.9, 0, plasterMap(0.3), 0.45, 3),
    cream: M_('#e6ddb5', 0.92, 0, plasterMap(0.4), 0.45, 3),
    creamTrim: M_('#f2efe4', 0.85, 0, {}, 0.45),
    mansard: M_('#8ea3b3', 0.55, 0.4, { map: tx.roof, bumpMap: tx.roof, bumpScale: 0.5 }, 0.6, 4),
    flatRoof: M_('#6a6c6e', 0.85, 0.1, {}, 0.4),
    block: M_('#e2d6b2', 0.92, 0, plasterMap(0.3), 0.4, 3),
    brick: M_('#8a4a3a', 0.95, 0, plasterMap(0.6), 0.3, 3),
    blockRoof: M_('#8296a5', 0.6, 0.3, {}, 0.5),
    metroWall: M_('#eef0ec', 0.85, 0, { ...plasterMap(0.3), emissive: C(WARM), emissiveIntensity: 0 }, 0.5, 3),
    metroDome: M_('#aeb9be', 0.42, 0.55, {}, 0.9),
    star: M_('#c8302a', 0.4, 0.3, { emissive: C('#c8302a'), emissiveIntensity: 0.15 }, 0.6),
    mzhaWall: M_('#f2f0ea', 0.9, 0, plasterMap(0.3), 0.45, 3),
    yar: M_('#e9e4d6', 0.9, 0, plasterMap(0.3), 0.4, 3),
    yarGreen: M_('#3e7a5c', 0.7, 0, {}, 0.4),
    yarRoof: M_('#5a6a5c', 0.6, 0.3, {}, 0.5),
    // 2026: комплекс за зданием
    hallWall: M_('#d8d6ce', 0.9, 0, plasterMap(0.2), 0.4, 3),
    hallRoof: M_('#3f474b', 0.85, 0.1, {}, 0.4),
    skylight: M_('#e8ecec', 0.4, 0.1, { emissive: C('#fff3dc'), emissiveIntensity: 0 }, 0.7),
    darkWall: M_('#8f8f88', 0.85, 0.1, {}, 0.4),
    darkRoof: M_('#4a5357', 0.7, 0.3, {}, 0.5),
    lowWall: M_('#cfcfc8', 0.9, 0, {}, 0.4),
    lowRoof: M_('#5a6064', 0.8, 0.2, {}, 0.4),
    brown: M_('#6a4b33', 0.85, 0.05, {}, 0.4),
    brownGlass: M_('#9fb3bf', 0.15, 0.3, { emissive: C('#f6d9a0'), emissiveIntensity: 0 }, 1.0),
    facet: M_('#2a2a32', 0.22, 0.65, { flatShading: true, emissive: C('#b4c6ea'), emissiveIntensity: 0 }, 1.2),
    whiteSteel: M_('#e9ecee', 0.35, 0.55, {}, 0.9),
    vaultSteel: M_('#e9ecee', 0.35, 0.55, { emissive: C('#dfeaff'), emissiveIntensity: 0 }, 0.9),
    canopy26: M_('#dadddc', 0.6, 0.3, {}, 0.6),
    truss: M_('#9aa0a2', 0.5, 0.6, {}, 0.7),
    canopySov: M_('#4e5250', 0.8, 0.2, {}, 0.4),
    colSov: M_('#dad6c8', 0.8, 0, {}, 0.4),
    fence: M_('#e6dcc4', 0.92, 0, plasterMap(0.4), 0.4, 3),
    balcony: M_('#ede6d0', 0.8, 0, { side: THREE.DoubleSide, emissive: C(WARM), emissiveIntensity: 0 }, 0.5),
    blueSign: M_('#1d4fd8', 0.4, 0, { emissive: C('#3d6bff'), emissiveIntensity: 0 }, 0.3),
    rose: M_('#6a625a', 0.9, 0, {}, 0.3),
    glassRoof: new THREE.MeshStandardMaterial({
      color: '#b9d2e2', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.34,
      side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6,
    }),
    strip: M_('#fff6e2', 0.4, 0, { emissive: C('#ffe2b0'), emissiveIntensity: 0 }, 0.3),
    horse: M_('#5b3a24', 0.9, 0, {}, 0.3),
    coach: M_('#2f1d1a', 0.5, 0.1, {}, 0.6),
    wheelW: M_('#2a211b', 0.8, 0, {}, 0.3),
    stripeB: M_('#151515', 0.7, 0, {}, 0.3),
    stripeW: M_('#eeeeea', 0.7, 0, {}, 0.3),
    contact: new THREE.MeshBasicMaterial({ alphaMap: tx.contact, transparent: true, opacity: 0.45, depthWrite: false, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2 }),
    flagW: new THREE.MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.8, side: THREE.DoubleSide, emissive: C('#ffffff'), emissiveIntensity: 0 }),
    flagB: new THREE.MeshStandardMaterial({ color: '#1c3f94', roughness: 0.8, side: THREE.DoubleSide, emissive: C('#1c3f94'), emissiveIntensity: 0 }),
    flagR: new THREE.MeshStandardMaterial({ color: '#c01c28', roughness: 0.8, side: THREE.DoubleSide, emissive: C('#c01c28'), emissiveIntensity: 0 }),
    car1: M_('#e6e1d4', 0.4, 0.3, {}, 0.9), car2: M_('#7fa3c4', 0.4, 0.3, {}, 0.9), car3: M_('#d9cfb0', 0.4, 0.3, {}, 0.9),
    car4: M_('#3c3f44', 0.4, 0.3, {}, 0.9), busC: M_('#e3d6b0', 0.5, 0.2, {}, 0.8), busR: M_('#b0362c', 0.5, 0.2, {}, 0.8),
    tramR: M_('#a8352e', 0.5, 0.1, {}, 0.7), tramC: M_('#e8dec0', 0.5, 0.1, {}, 0.7),
  };
  ENV.push([M.glassRoof, 1.6]);
  M.colLit.userData.floorUV = true;
  // вывески: буквы белые на прозрачном, цвет днём задаёт material.color, ночью — emissive
  const wordL = wordTex('ЛЕНИНГРАДСКИЙ', 2048, 182);
  const wordLHalo = wordTex('ЛЕНИНГРАДСКИЙ', 1024, 140, 9);
  const signR = rightSignTex(2048, 192);
  const signRHalo = rightSignTex(1024, 150, 9);
  const signMat = (map) => M_('#1f3e8c', 0.55, 0, { map, alphaTest: 0.4, emissive: C('#f0f6ff'), emissiveMap: map, emissiveIntensity: 0 }, 0.5);
  const haloMat = (map) => new THREE.MeshBasicMaterial({ map, color: '#3d6bff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  Object.assign(M, {
    signL: signMat(wordL), signR: signMat(signR), signSov: M_('#2f3f6a', 0.6, 0, { map: wordL, alphaTest: 0.4 }, 0.5),
    haloL: haloMat(wordLHalo), haloR: haloMat(signRHalo),
    moskva: M_('#b0332a', 0.6, 0, { map: moskvaTex(), alphaTest: 0.4 }, 0.4),
    board: new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.6, emissive: C('#ffffff'), emissiveMap: null, emissiveIntensity: 0 }),
  });
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load(`700 120px ${SERIF}`, 'ЛЕНИНГРАДСКИЙ ВОКЗАЛ МОСКВА'),
      document.fonts.load(`700 60px ${SANS}`, 'РЖД Московский транспорт'),
    ]).then(() => TEXT_TEX.forEach((t) => t.userData.redraw())).catch(() => { /* остаются системные шрифты */ });
  }
  // мелкие детали без теней (нет «лесенок» shadow acne)
  const MK = { ...M, trimN: M.trim, wallN: M.wallA };

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
  sc.left = -100; sc.right = 100; sc.top = 100; sc.bottom = -100; sc.near = 20; sc.far = 600;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  const SUN_T = new THREE.Vector3(0, 0, -15);
  sun.target.position.copy(SUN_T);
  scene.add(sun, sun.target);

  // Ночная архитектурная подсветка 2026: тёплый белый ≈3000 K снизу (без теней)
  const spots = [];
  for (const [x, y, z, tx2, ty, tz, base, ang] of [
    [-15, 0.4, 24, -14, 9, 10, 420, 0.8], [15, 0.4, 24, 14, 9, 10, 420, 0.8],
    [39, 0.4, 13, 26.5, 9, -4, 340, 0.75], [-40, 0.4, 13, -26.5, 9, -4, 340, 0.75],
    [0, 17.5, 26, 0, 28, 3.2, 700, 0.32],
  ]) {
    const s = new THREE.SpotLight(WARM, 0, 70, ang, 0.85, 1.4);
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
      if (!o.isMesh && !o.isPoints && !o.isLine) return;
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

  /* ---------- Утилиты построения ---------- */
  const extrude = (shape, depth, seg = 12) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg });
  /** Полукольцо-архивольт: внутренний r0, внешний r1, толщина depth (центр дуги в 0,0). */
  function halfRing(r0, r1, depth, seg = 16) {
    const s = new THREE.Shape();
    s.moveTo(r1, 0);
    s.absarc(0, 0, r1, 0, Math.PI, false);
    s.lineTo(-r0, 0);
    s.absarc(0, 0, r0, Math.PI, 0, true);
    s.lineTo(r1, 0);
    return extrude(s, depth, seg);
  }
  function triShape(w, h) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
    return s;
  }
  function starShape(R, r) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
      if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    s.closePath();
    return s;
  }
  /** Балка между двумя точками (Vector3). */
  function beam(b, key, a, c, t, t2 = t) {
    const g = box(t, t2, a.distanceTo(c));
    _o.position.copy(a).add(c).multiplyScalar(0.5);
    _o.rotation.set(0, 0, 0);
    _o.scale.set(1, 1, 1);
    _o.lookAt(c);
    _o.updateMatrix();
    g.applyMatrix4(_o.matrix);
    b.add(key, g);
  }
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const span = (a, c, step) => { const r = []; for (let x = a; x <= c + 1e-6; x += step) r.push(x); return r; };
  /** Ряды прямоугольных окон с обрамлением на грани f (см. Batch.face). */
  function winRows(b, f, us, ys, w, h, glassKey = 'glass', frameKey = 'trimN') {
    for (const v of ys) for (const u of us) {
      b.face(frameKey, box(w + 0.3, h + 0.3, 0.06), f, u, v + h / 2, 0.03);
      b.face(glassKey, box(w, h, 0.08), f, u, v + h / 2, 0.06);
    }
  }
  function contactShadow(parent, cx, cz, w, d) {
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M.contact);
    cs.position.set(cx, 0.1, cz);
    cs.renderOrder = 1;
    parent.add(cs);
  }

  /* ---------- Земля, площадь, дороги ---------- */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1500, 48).rotateX(-Math.PI / 2), M.ground);
  ground.receiveShadow = true;
  scene.add(ground);
  {
    const b = new Batch();
    b.add('paving', place(box(150, 0.08, 48), 4, 0.04, 36));
    b.add('road', place(box(300, 0.06, 16), 0, 0.03, 68));
    b.add('road', place(box(16, 0.06, 150), 196, 0.03, -10));
    scene.add(b.build(MK, { cast: false }));
  }
  const PAVE = [tx.dirt, tx.asphalt, tx.granite];

  /* ================================================================== */
  /* Здание К. А. Тона: 53 × 25,6 м, 2 этажа (≈8,5 и 7 м), антаблемент и аттик до 18,3 м, 9 осей  */
  /* ================================================================== */
  const bld = new Batch();
  const clockHands = [];
  const TON = { hw: 26.5, zf: 10, zb: -15.6, zc: -2.8 };
  const AX_F = [-22.8, -17.4, -11.6, -5.8, 0, 5.8, 11.6, 17.4, 22.8];
  const COL_F = [-20.3, -14.5, -8.7, -2.9, 2.9, 8.7, 14.5, 20.3];
  const CORN_F = [25.3, 26.15]; // парные угловые полуколонны
  const AX_S = [-7.6, 0, 7.6], COL_S = [-3.6, 3.6], CORN_S = [11.6, 12.45];
  const DOOR_AX = [-5.8, 0, 5.8];
  const FACES = [
    { f: { x: 0, z: TON.zf, ry: 0 }, len: 53, ax: AX_F, cols: COL_F, corn: CORN_F, doors: DOOR_AX },
    { f: { x: 0, z: TON.zb, ry: Math.PI }, len: 53, ax: AX_F, cols: COL_F, corn: CORN_F, doors: [] },
    { f: { x: TON.hw, z: TON.zc, ry: Math.PI / 2 }, len: 25.6, ax: AX_S, cols: COL_S, corn: CORN_S, doors: [] },
    { f: { x: -TON.hw, z: TON.zc, ry: -Math.PI / 2 }, len: 25.6, ax: AX_S, cols: COL_S, corn: CORN_S, doors: [] },
  ];
  /** Высота кровли Тона (вальма от y 17,45 до конька y 20,95) в точке (x, z). */
  const tonRoofY = (x, z) => 17.45 + 3.5 * Math.min(1, Math.max(0, Math.min(9.8 - z, z + 15.4, 26.3 - Math.abs(x))) / 12.6);

  const archivolt = halfRing(1.75, 2.1, 0.2, 18);
  const medallion = cyl(0.34, 0.34, 0.14, 20).rotateX(Math.PI / 2);
  const medRing = new THREE.TorusGeometry(0.36, 0.06, 6, 20);
  /** Ось фасада: 1-й этаж — два арочных проёма под общей аркой с медальоном; 2-й — парные окна в общем наличнике с сандриком. */
  function bay(f, u, isDoor) {
    // 1-й этаж
    bld.face('trim', archivolt, f, u, 5.5, 0.02);
    for (const s of [-1, 1]) bld.face('trim', box(0.35, 4.6, 0.2), f, u + s * 1.925, 0.9 + 2.3, 0.1);
    for (const s of [-1, 1]) {
      const cx = u + s * 0.95, y0 = isDoor ? 0.12 : 1.0, h = 6.2 - y0;
      bld.face('trimN', new THREE.ShapeGeometry(archShape(1.74, h + 0.12), 10), f, cx, y0, 0.02);
      bld.face(isDoor ? 'door' : 'glass', new THREE.ShapeGeometry(archShape(1.5, h), 10), f, cx, y0, 0.04);
      bld.face('frame', box(0.07, h - 0.75, 0.03), f, cx, y0 + (h - 0.75) / 2, 0.06);
      bld.face('frame', box(1.5, 0.08, 0.03), f, cx, y0 + h - 0.75, 0.06);
      if (!isDoor) bld.face('frame', box(1.5, 0.06, 0.03), f, cx, y0 + (h - 0.75) * 0.5, 0.06);
      else bld.face('frame', box(1.5, 0.1, 0.03), f, cx, 3.4, 0.06);
    }
    bld.face('trim', box(0.4, 4.4, 0.24), f, u, (isDoor ? 0.12 : 1.0) + 2.2, 0.12); // колонка-импост
    bld.face('trim', box(0.55, 0.22, 0.3), f, u, 5.48, 0.14);
    bld.face('trim', medallion, f, u, 6.78, 0.1);
    bld.face('trimN', medRing, f, u, 6.78, 0.17);
    if (!isDoor) bld.face('trim', box(4.0, 0.16, 0.34), f, u, 0.95, 0.15); // подоконник
    // 2-й этаж
    bld.face('trim', box(3.2, 0.85, 0.06), f, u, 9.35, 0.03); // подоконная филёнка
    bld.face('wallN', box(2.7, 0.5, 0.06), f, u, 9.35, 0.06);
    bld.face('trim', box(3.4, 0.2, 0.16), f, u, 9.9, 0.08); // наличник
    bld.face('trim', box(3.4, 0.2, 0.16), f, u, 13.1, 0.08);
    for (const s of [-1, 1]) bld.face('trim', box(0.2, 3.4, 0.16), f, u + s * 1.6, 11.5, 0.08);
    bld.face('trim', box(0.4, 3.0, 0.1), f, u, 11.5, 0.05);
    for (const s of [-1, 1]) {
      bld.face('glassUp', box(1.3, 3.0, 0.04), f, u + s * 0.85, 11.5, 0.02);
      bld.face('frame', box(0.06, 3.0, 0.03), f, u + s * 0.85, 11.5, 0.05);
      bld.face('frame', box(1.3, 0.07, 0.03), f, u + s * 0.85, 12.35, 0.05);
    }
    bld.face('trim', box(3.5, 0.16, 0.26), f, u, 13.3, 0.13); // фриз над наличником
    bld.face('trim', box(3.8, 0.32, 0.5), f, u, 13.53, 0.25); // сандрик
  }
  /** Коринфская полуколонна 1-го этажа и колонна 2-го (упрощённо), с раскреповкой карнизов. */
  function orderColumn(f, u) {
    bld.face('trim', box(1.0, 1.15, 0.8), f, u, 1.375, 0.35); // пьедестал
    bld.face('trim', box(0.92, 0.2, 0.74), f, u, 2.05, 0.33);
    bld.face('colLit', cyl(0.36, 0.4, 5.55, 14), f, u, 4.925, 0.32);
    bld.face('trim', cyl(0.6, 0.4, 0.45, 14), f, u, 7.925, 0.32); // капитель
    bld.face('trim', box(1.2, 0.15, 0.96), f, u, 8.225, 0.36);
    bld.face('trim', box(1.25, 0.5, 1.15), f, u, 8.55, 0.2); // раскреповка тяги
    bld.face('trim', box(0.9, 0.9, 0.7), f, u, 9.25, 0.3);
    bld.face('trim', box(0.8, 0.15, 0.65), f, u, 9.775, 0.3);
    bld.face('colLit', cyl(0.3, 0.33, 5.0, 14), f, u, 12.35, 0.28);
    bld.face('trim', cyl(0.5, 0.33, 0.45, 14), f, u, 15.075, 0.28);
    bld.face('trim', box(1.0, 0.2, 0.84), f, u, 15.4, 0.3);
    bld.face('trim', box(1.15, 1.5, 0.75), f, u, 16.25, 0.3); // раскреповка антаблемента
    bld.face('trim', box(1.3, 0.62, 0.5), f, u, 16.7, 0.9);
    bld.face('trim', box(0.75, 1.6, 0.8), f, u, 17.8, -0.25); // тумба аттика
    bld.face('trim', box(0.95, 0.16, 1.0), f, u, 18.68, -0.25);
  }

  bld.add('wallA', place(box(53, 17, 25.6), 0, 8.5, TON.zc));
  for (const { f, len, ax, cols, corn, doors } of FACES) {
    const hl = len / 2;
    // цоколь (с проёмами дверей)
    const gaps = [];
    for (const u of doors) for (const s of [-1, 1]) gaps.push([u + s * 0.95 - 0.8, u + s * 0.95 + 0.8]);
    gaps.sort((a, c) => a[0] - c[0]);
    let u0 = -hl - 0.15;
    for (const [a, c] of [...gaps, [hl + 0.15, hl + 0.15]]) {
      if (a - u0 > 0.05) bld.face('plinth', box(a - u0, 0.8, 0.3), f, (u0 + a) / 2, 0.4, 0);
      u0 = c;
    }
    bld.face('trim', box(len + 0.8, 0.5, 0.8), f, 0, 8.55, 0); // междуэтажная тяга
    bld.face('trim', box(len + 0.4, 0.45, 0.4), f, 0, 15.72, 0); // архитрав
    bld.face('trim', box(len + 1.0, 0.3, 1.0), f, 0, 16.5, 0);
    bld.face('trim', box(len + 1.6, 0.35, 1.6), f, 0, 16.82, 0); // венчающий карниз
    for (let u = -hl + 0.5; u <= hl - 0.5; u += 0.75) bld.face('trimN', box(0.18, 0.2, 0.5), f, u, 16.25, 0.45); // модульоны
    bld.face('trim', box(len - 0.2, 1.3, 0.6), f, 0, 17.65, -0.35); // аттик
    bld.face('trim', box(len + 0.1, 0.16, 0.85), f, 0, 18.36, -0.35);
    const colU = [...cols, ...corn, ...corn.map((c) => -c)];
    for (const u of colU) orderColumn(f, u);
    // глухие филёнки аттика между тумбами
    const tumbs = [...colU].sort((a, c) => a - c);
    for (let i = 0; i < tumbs.length - 1; i++) {
      const a = tumbs[i] + 0.5, c = tumbs[i + 1] - 0.5;
      if (c - a > 1) bld.face('wallN', box(c - a, 0.7, 0.05), f, (a + c) / 2, 17.65, -0.03);
    }
    for (const u of ax) bay(f, u, doors.includes(u));
  }
  // пологая вальмовая кровля светло-серого металла за аттиком
  bld.add('roof', place(hipRoof(52.6, 25.2, 3.5), 0, 17.45, TON.zc));

  /* ---------- Башня 7,5 × 7,5 м по оси: ярус с окном под фронтончиком, часовой ярус, карниз, аттик, пологий купол ---------- */
  const TWR = { x: 0, z: 3.2 };
  {
    const { x, z } = TWR;
    bld.add('wallA', place(box(7.5, 8.2, 7.5), x, 20.9, z));
    bld.add('trim', place(box(7.9, 0.4, 7.9), x, 18.5, z));
    bld.add('trim', place(box(8.1, 0.5, 8.1), x, 25.05, z)); // тяга
    bld.add('wallA', place(box(7.3, 6.2, 7.3), x, 28.4, z));
    bld.add('trim', place(box(7.9, 0.4, 7.9), x, 31.7, z)); // карниз
    bld.add('trim', place(box(8.7, 0.4, 8.7), x, 32.1, z));
    bld.add('wallA', place(box(6.8, 1.2, 6.8), x, 32.9, z)); // аттик
    bld.add('trim', place(box(7.1, 0.14, 7.1), x, 33.55, z));
    const prof = [[4.6, 0], [4.62, 0.22], [4.3, 0.9], [3.55, 1.65], [2.4, 2.35], [1.15, 2.82], [0.45, 2.97], [0.01, 3.0]].map(([r, y]) => new THREE.Vector2(r, y));
    const dome = new THREE.LatheGeometry(prof, 4).toNonIndexed();
    dome.computeVertexNormals();
    bld.add('dome', place(dome.rotateY(Math.PI / 4), x, 33.6, z));
    bld.add('dome', place(cyl(0.32, 0.5, 0.5, 8), x, 36.8, z)); // главка
    bld.add('dome', place(sphere(0.34, 10, 8), x, 37.2, z));
    for (let k = 0; k < 4; k++) {
      const ry = (k * Math.PI) / 2, c = Math.cos(ry), s = Math.sin(ry);
      const f1 = { x: x + 3.75 * s, z: z + 3.75 * c, ry };
      for (const u of [-3.4, 3.4]) bld.face('colLit', box(0.7, 6.4, 0.16), f1, u, 21.7, 0.08);
      bld.face('glassUp', box(1.4, 2.6, 0.04), f1, 0, 21.4, 0.02);
      bld.face('frame', box(0.06, 2.6, 0.03), f1, 0, 21.4, 0.05);
      bld.face('frame', box(1.4, 0.07, 0.03), f1, 0, 22.0, 0.05);
      for (const sx of [-1, 1]) bld.face('trim', box(0.18, 2.9, 0.14), f1, sx * 0.8, 21.4, 0.07);
      bld.face('trim', box(1.9, 0.14, 0.3), f1, 0, 19.98, 0.12); // подоконник
      bld.face('trim', box(2.0, 0.16, 0.32), f1, 0, 22.88, 0.14);
      bld.face('trim', extrude(triShape(2.15, 0.62), 0.24), f1, 0, 22.96, 0.04); // фронтончик
      const f2 = { x: x + 3.65 * s, z: z + 3.65 * c, ry };
      for (const u of [-3.3, 3.3]) bld.face('colLit', box(0.7, 6.2, 0.16), f2, u, 28.4, 0.08);
      bld.face('clockFace', new THREE.CircleGeometry(1.3, 40), f2, 0, 28.4, 0.06);
      bld.face('trim', new THREE.TorusGeometry(1.38, 0.12, 6, 40), f2, 0, 28.4, 0.08);
      for (let hh = 0; hh < 12; hh++) {
        const a = (hh / 12) * Math.PI * 2;
        const len = hh % 3 === 0 ? 0.28 : 0.16;
        bld.face('dark', box(0.07, len, 0.02).rotateZ(-a).translate(Math.sin(a) * 1.1, 28.4 + Math.cos(a) * 1.1, 0), f2, 0, 0, 0.08);
      }
      const pivot = new THREE.Group();
      pivot.position.set(f2.x + 0.12 * s, 28.4, f2.z + 0.12 * c);
      pivot.rotation.y = ry;
      const hourH = new THREE.Mesh(box(0.13, 0.75, 0.03).translate(0, 0.3, 0), M.dark);
      const minH = new THREE.Mesh(box(0.08, 1.1, 0.03).translate(0, 0.48, 0.02), M.dark);
      pivot.add(hourH, minH);
      scene.add(pivot);
      clockHands.push({ hourH, minH });
    }
  }
  scene.add(bld.build(MK, { noShadow: ['trimN', 'wallN', 'glass', 'glassUp', 'door', 'frame', 'clockFace', 'dark'] }));
  contactShadow(scene, 0, TON.zc, 62, 34);

  /* ---------- Здание таможни (К. А. Тон, 1850-е) на углу площади слева — во всех эпохах ---------- */
  {
    const b = new Batch();
    const x0 = -100, x1 = -44, z0 = -4, z1 = 12, H = 16;
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, zc = (z0 + z1) / 2;
    b.add('customs', place(box(w, H, d), cx, H / 2, zc));
    b.add('customsRust', place(box(w + 0.1, 5.2, d + 0.1), cx, 2.8, zc));
    b.add('plinth', place(box(w + 0.3, 0.6, d + 0.3), cx, 0.3, zc));
    for (const y of [5.5, 10.6]) b.add('customsTrim', place(box(w + 0.3, 0.3, d + 0.3), cx, y, zc));
    b.add('customsTrim', place(box(w + 0.9, 0.5, d + 0.9), cx, 15.75, zc));
    b.add('customsRoof', place(hipRoof(w + 0.8, d + 0.8, 4), cx, 16, zc));
    const fF = { x: cx, z: z1, ry: 0 }, fR = { x: x1, z: zc, ry: Math.PI / 2 };
    const us = span(-w / 2 + 2.4, w / 2 - 2.4, 3.6);
    for (const u of us) {
      b.face('customsTrim', new THREE.ShapeGeometry(archShape(1.7, 3.0), 8), fF, u, 1.3, 0.03);
      b.face('glass', new THREE.ShapeGeometry(archShape(1.4, 2.8), 8), fF, u, 1.4, 0.05);
    }
    winRows(b, fF, us, [6.6, 11.6], 1.3, 2.3, 'glass', 'customsTrim');
    for (const u of span(-w / 2 + 0.6, w / 2 - 0.6, 7.2)) b.face('customsTrim', box(0.6, 10.1, 0.25), fF, u, 10.6, 0.12);
    const rs = span(-d / 2 + 2.4, d / 2 - 2.4, 3.6);
    for (const u of rs) {
      b.face('customsTrim', new THREE.ShapeGeometry(archShape(1.7, 3.0), 8), fR, u, 1.3, 0.03);
      b.face('glass', new THREE.ShapeGeometry(archShape(1.4, 2.8), 8), fR, u, 1.4, 0.05);
    }
    winRows(b, fR, rs, [6.6, 11.6], 1.3, 2.3, 'glass', 'customsTrim');
    const g = b.build(MK, { noShadow: ['glass', 'customsTrim'] });
    contactShadow(g, cx, zc, w + 6, d + 6);
    scene.add(g);
  }

  /* ================================================================== */
  /* Пути и платформы                                                     */
  /* ================================================================== */
  const FAR_TRACK = -700;
  function trackSet(list, parent) {
    const b = new Batch();
    for (const { x, head } of list) {
      const len = head - FAR_TRACK;
      b.add('ballast', place(box(3.2, 0.3, len), x, 0.15, head - len / 2));
      for (const s of [-0.76, 0.76]) b.add('rail', place(box(0.08, 0.16, len), x + s, 0.38, head - len / 2));
      b.add('dark', place(box(2.6, 1.0, 0.6), x, 0.8, head)); // упор
      b.add('edge', place(box(2.62, 0.16, 0.62), x, 1.1, head));
    }
    parent.add(b.build(MK, { cast: false }));
    const per = 230;
    const sl = new THREE.InstancedMesh(box(2.6, 0.1, 0.26), M.sleeper, per * list.length);
    let k = 0;
    for (const { x, head } of list) for (let i = 0; i < per; i++) {
      _o.position.set(x, 0.32, head - 0.7 - i * 0.9); _o.rotation.set(0, 0, 0); _o.scale.set(1, 1, 1); _o.updateMatrix();
      sl.setMatrixAt(k++, _o.matrix);
    }
    sl.receiveShadow = true;
    parent.add(sl);
  }
  /** Платформы {x, z0, z1, w} высотой h и поперечные переходы {x0, x1, z0, z1}. */
  function platformSet(parent, plats, cross = [], h = 1.1) {
    const b = new Batch();
    for (const { x, z0, z1, w = 6 } of plats) {
      const len = z0 - z1, zc = (z0 + z1) / 2;
      b.add('platform', place(box(w, h, len), x, h / 2, zc));
      for (const s of [-1, 1]) b.add('edge', place(box(0.3, 0.03, len), x + s * (w / 2 - 0.2), h + 0.01, zc));
    }
    for (const { x0, x1, z0, z1 } of cross) b.add('platform', place(box(x1 - x0, h, z0 - z1), (x0 + x1) / 2, h / 2, (z0 + z1) / 2));
    parent.add(b.build(MK));
  }

  /* ---------- Царская и советская: пути под старым дебаркадером (упоры у здания) ---------- */
  const Z_BUF51 = -19.3;
  // старый дебаркадер стоит за зданием строго по оси (x = 0)
  const DCX = 0;
  trackSet([{ x: DCX - 4.2, head: Z_BUF51 }, { x: DCX + 4.2, head: Z_BUF51 }], featGroup('tracks51'));
  platformSet(featGroup('platLow'), [{ x: DCX - 9.7, z0: -18.6, z1: -121, w: 6.2 }, { x: DCX + 9.7, z0: -18.6, z1: -121, w: 6.2 }],
    [{ x0: DCX - 12.9, x1: DCX + 12.9, z0: -16.1, z1: -18.6 }], 0.45);

  /* ---------- Советская 1960-е: пути по сторонам дебаркадера, низкие навесы ---------- */
  // пути и платформы по обе стороны дебаркадера (он стоит по оси x −13,5…+13,5); правее x 28 — за вестибюлем метро
  const SOV_PLAT = [
    { x: DCX - 9.7, z0: -123.2, z1: -260, w: 6.2 }, { x: DCX + 9.7, z0: -123.2, z1: -260, w: 6.2 },
    { x: -21.5, z0: -19, z1: -260 }, { x: 21.5, z0: -19, z1: -260 }, { x: 35.4, z0: -46, z1: -260 },
  ];
  const SOV_TRACKS = [-26.1, -16.9, 16.9, 26.1, 30.8, 40].map((x) => ({ x, head: x > 28 ? -46.5 : -19.5 }));
  trackSet(SOV_TRACKS, featGroup('tracksSov'));
  platformSet(featGroup('platSov'), SOV_PLAT, [{ x0: -27.5, x1: -14.6, z0: -16, z1: -19 }, { x0: 14.6, x1: 27.5, z0: -16, z1: -19 }]);
  {
    const g = featGroup('canopySov');
    const b = new Batch();
    for (const { x, z0, z1 } of SOV_PLAT) {
      const a = z0 - 1, c = Math.max(z1, -200), len = a - c, zc = (a + c) / 2;
      b.add('canopySov', place(box(6, 0.25, len), x, 4.62, zc));
      b.add('colSov', place(box(6.1, 0.4, len), x, 4.35, zc));
      for (let z = a - 2; z >= c; z -= 8) b.add('colSov', place(cyl(0.16, 0.18, 3.3, 8), x, 1.1 + 1.65, z));
    }
    g.add(b.build(MK));
  }
  {
    const g = featGroup('catSov');
    const b = new Batch();
    const WIRED = [...SOV_TRACKS, { x: DCX - 4.2, head: -124 }, { x: DCX + 4.2, head: -124 }];
    for (let z = -55; z > -420; z -= 50) {
      // у дебаркадера — два отдельных портала по сторонам, дальше — общий над всеми путями
      const nearDeb = z > -125;
      const portals = nearDeb ? [[-29.5, -15], [15, 43.6]] : [[-29.5, 43.6]];
      for (const [a, c] of portals) {
        for (const x of nearDeb ? [a, c] : [a, DCX, 14.9, c]) b.add('steel', place(box(0.5, 11, 0.5), x, 5.5, z));
        b.add('steel', place(box(c - a, 0.35, 0.35), (a + c) / 2, 10.6, z));
      }
      for (const t of WIRED) if (z < t.head) b.add('steel', place(box(0.05, 4.1, 0.05), t.x, 8.5, z));
    }
    for (const t of WIRED) {
      const wl = t.head - 1 + 420;
      b.add('dark', place(box(0.04, 0.04, wl), t.x, 6.5, t.head - 1 - wl / 2));
      b.add('dark', place(box(0.04, 0.04, wl), t.x, 7.6, t.head - 1 - wl / 2));
    }
    g.add(b.build(MK, { cast: false }));
  }

  /* ---------- 2026: 12 путей, левые (x < −5) с упорами у z −108, правые — у z −130 ---------- */
  const P26 = [-34, -20.4, -6.8, 6.8, 20.4, 34];
  const TRACKS26 = P26.flatMap((p) => [p - 4.6, p + 4.6]).map((x) => ({ x, head: x < -5 ? -115 : -130 }));
  trackSet(TRACKS26, featGroup('tracks26'));
  const PLAT26 = P26.map((x) => ({ x, z0: x < 0 ? -111 : -129.5, z1: -400 }));
  platformSet(featGroup('plat26'), PLAT26, [{ x0: -40, x1: -3.8, z0: -110.5, z1: -114.5 }, { x0: -3.8, x1: 40, z0: -110.5, z1: -129.5 }]);
  {
    const g = featGroup('canopy26');
    const b = new Batch();
    for (const { x, z0, z1 } of PLAT26) {
      const a = x < 0 ? z0 - 2 : -161, c = z1, len = a - c, zc = (a + c) / 2;
      b.add('canopy26', place(box(8, 0.3, len), x, 6.15, zc));
      b.add('strip', place(box(0.4, 0.08, len - 2), x, 5.97, zc));
      for (let z = a - 3; z >= c; z -= 12) {
        b.add('truss', place(cyl(0.18, 0.2, 4.9, 8), x, 1.1 + 2.45, z));
        if (x < 0) { // решётчатые арочные фермы по краю левых навесов
          for (const s of [-1, 1]) {
            beam(b, 'truss', V3(x + s * 4, 6.3, z), V3(x + s * 2.2, 7.0, z), 0.12);
            beam(b, 'truss', V3(x + s * 2.2, 7.0, z), V3(x, 7.2, z), 0.12);
          }
        }
      }
      if (x < 0) for (const s of [-1, 1]) b.add('truss', place(box(0.12, 0.12, len), x + s * 2.2, 7.0, zc));
    }
    g.add(b.build(MK, { noShadow: ['strip'] }));
  }
  {
    const g = featGroup('cat26');
    const b = new Batch();
    for (let z = -165; z > -420; z -= 50) {
      for (const x of [-41.2, -20.4, 20.4, 41.6]) b.add('steel', place(box(0.5, 11, 0.5), x, 5.5, z));
      b.add('steel', place(box(82.8, 0.35, 0.35), 0.2, 10.6, z));
      for (const t of TRACKS26) b.add('steel', place(box(0.05, 4.1, 0.05), t.x, 8.5, z));
    }
    for (const t of TRACKS26) {
      const wl = t.head - 1 + 420;
      b.add('dark', place(box(0.04, 0.04, wl), t.x, 6.6, t.head - 1 - wl / 2));
      b.add('dark', place(box(0.04, 0.04, wl), t.x, 7.7, t.head - 1 - wl / 2));
    }
    g.add(b.build(MK, { cast: false }));
  }

  /* ---------- Старый дебаркадер ≈27 × 107 м по оси за зданием: стены-аркады, двускатная металлическая кровля ---------- */
  const DEB = { cx: DCX, hx: 13.5, z0: TON.zb, z1: -122.6, t: 1.2 };
  {
    const g = featGroup('debark');
    const b = new Batch();
    const { hx, z0, z1, t } = DEB;
    const LEN = z0 - z1, ZC = (z0 + z1) / 2;
    const NB = 21, P = 5.0, zs = ZC + (NB * P) / 2;
    const upper = new THREE.Shape();
    upper.moveTo(-2.5, 5.7); upper.lineTo(-1.8, 5.7); upper.absarc(0, 5.7, 1.8, Math.PI, 0, true);
    upper.lineTo(2.5, 5.7); upper.lineTo(2.5, 9.5); upper.lineTo(-2.5, 9.5); upper.lineTo(-2.5, 5.7);
    const upperGeo = extrude(upper, t, 10).translate(0, 0, -t / 2).rotateY(Math.PI / 2);
    for (const sx of [-1, 1]) {
      for (let i = 0; i < NB; i++) {
        const zc = zs - P / 2 - i * P;
        b.add('debWall', place(upperGeo, sx * hx, 0, zc));
        b.add('debWall', place(box(t, 5.7, 1.4), sx * hx, 2.85, zc + P / 2));
        b.add('debTrim', place(box(t + 0.16, 0.22, 1.56), sx * hx, 5.75, zc + P / 2));
        b.add('debWall', place(box(t + 0.3, 9.4, 0.6), sx * hx, 4.7, zc + P / 2)); // лопатка
      }
      b.add('debWall', place(box(t, 5.7, 1.4), sx * hx, 2.85, zs - NB * P));
      b.add('debWall', place(box(t, 9.5, zs - NB * P - z1 + 0.5), sx * hx, 4.75, (zs - NB * P + z1) / 2));
      b.add('debTrim', place(box(t + 0.5, 0.35, LEN), sx * hx, 9.65, ZC)); // карниз
    }
    const EAVE = 9.8, RIDGE = 14.7, half = hx + 0.6;
    const ang = Math.atan2(RIDGE - EAVE, half), sl = Math.hypot(half, RIDGE - EAVE);
    for (const s of [-1, 1]) b.add('debRoof', place(box(sl + 0.3, 0.2, LEN), (s * half) / 2, (EAVE + RIDGE) / 2 + 0.1, ZC, 0, 0, -s * ang));
    b.add('debRoof', place(box(0.6, 0.3, LEN), 0, RIDGE + 0.15, ZC));
    for (const z of [-40, -80]) { // вентиляционные фонари на коньке
      b.add('debRoof', place(box(3, 1.4, 8), 0, RIDGE + 0.8, z));
      for (const s of [-1, 1]) b.add('dark', place(box(0.05, 0.8, 7.2), s * 1.53, RIDGE + 0.9, z));
      b.add('debRoof', place(hipRoof(3.8, 8.8, 0.9), 0, RIDGE + 1.5, z));
    }
    for (let z = z0 - 5; z > z1 + 2; z -= 10) { // затяжки ферм
      b.add('iron', place(box(2 * hx - 1.2, 0.18, 0.18), 0, EAVE - 0.3, z));
      b.add('iron', place(box(0.14, RIDGE - EAVE, 0.14), 0, (EAVE + RIDGE) / 2 - 0.1, z));
    }
    // торец к путям: щипец по всей ширине с огромным полуциркульным проёмом
    const gs = new THREE.Shape();
    gs.moveTo(-14.1, 0); gs.lineTo(-6.5, 0); gs.lineTo(-6.5, 6); gs.absarc(0, 6, 6.5, Math.PI, 0, true);
    gs.lineTo(6.5, 0); gs.lineTo(14.1, 0); gs.lineTo(14.1, 11); gs.lineTo(0, 16); gs.lineTo(-14.1, 11); gs.lineTo(-14.1, 0);
    b.add('debWall', place(extrude(gs, 1.0, 28), 0, 0, z1 - 0.5));
    // торец к площади (за левой оградой): аркада из 5 арок и фронтон
    const fb = new THREE.Shape();
    fb.moveTo(-2.82, 5.7); fb.lineTo(-1.8, 5.7); fb.absarc(0, 5.7, 1.8, Math.PI, 0, true);
    fb.lineTo(2.82, 5.7); fb.lineTo(2.82, 9.5); fb.lineTo(-2.82, 9.5); fb.lineTo(-2.82, 5.7);
    const fbGeo = extrude(fb, t, 10).translate(0, 0, -t / 2);
    for (let i = 0; i < 5; i++) {
      const x = -11.28 + i * 5.64;
      b.add('debWall', place(fbGeo, x, 0, z0 - 0.1));
      b.add('debWall', place(box(1.6, 5.7, t), x - 2.82, 2.85, z0 - 0.1));
      b.add('debTrim', place(box(1.76, 0.22, t + 0.16), x - 2.82, 5.75, z0 - 0.1));
    }
    b.add('debWall', place(box(1.6, 5.7, t), 14.1 - 0.8, 2.85, z0 - 0.1));
    b.add('debWall', place(extrude(triShape(28.2, 5.2), t), 0, 9.5, z0 - 0.1 - t / 2));
    b.add('debTrim', place(box(28.6, 0.35, t + 0.4), 0, 9.6, z0 - 0.1));
    const fg = { x: 0, z: z1 - 0.5, ry: Math.PI };
    b.face('debTrim', halfRing(6.5, 7.1, 0.25, 28), fg, 0, 6, 0);
    for (const s of [-1, 1]) {
      b.face('debTrim', box(0.6, 6, 0.25), fg, s * 6.8, 3, 0.125);
      b.face('debTrim', box(9.1, 0.4, 0.4), fg, s * 9.55, 11, 0.2);
      b.face('debTrim', box(15.2, 0.4, 0.4).rotateZ(s * Math.atan2(5, 14.1)), fg, -s * 7.05, 13.55, 0.2);
      b.face('debTrim', box(0.9, 11, 0.4), fg, s * 13.65, 5.5, 0.2);
    }
    g.add(b.build(MK, { noShadow: ['debTrim', 'iron', 'dark'] }));
    g.position.x = DEB.cx;
  }
  {
    // Советская: надпись «МОСКВА» на щипце и табло «Московское время» в проёме
    const g = featGroup('moskva');
    const z1 = DEB.z1 - 0.5;
    const letters = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.25), M.moskva);
    letters.position.set(0, 13.85, z1 - 0.27);
    letters.rotation.y = Math.PI;
    const b = new Batch();
    b.add('dark', place(box(6.2, 1.7, 0.2), 0, 9.5, z1 + 0.2));
    for (const s of [-1, 1]) b.add('dark', place(box(0.06, 2.4, 0.06), s * 2.6, 11.5, z1 + 0.2));
    const board = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), M.board);
    board.position.set(0, 9.5, z1 + 0.08);
    board.rotation.y = Math.PI;
    g.add(letters, board, b.build(MK, { cast: false }));
    g.position.x = DEB.cx;
  }

  /* ---------- Царская: ограды с арочными воротами, полосатая будка, служебные домики, трубы, шпиль ---------- */
  {
    const g = featGroup('tsarSite');
    const b = new Batch();
    const gate = new THREE.Shape();
    gate.moveTo(-2.6, 0); gate.lineTo(-1.75, 0); gate.lineTo(-1.75, 2.75); gate.absarc(0, 2.75, 1.75, Math.PI, 0, true);
    gate.lineTo(1.75, 0); gate.lineTo(2.6, 0); gate.lineTo(2.6, 5.8); gate.lineTo(-2.6, 5.8); gate.lineTo(-2.6, 0);
    const gateGeo = extrude(gate, 0.9, 12).translate(0, 0, -0.45);
    const fenceRun = (x0, x1, gx) => {
      const z = 9;
      for (const [a, c] of [[x0, gx - 2.6], [gx + 2.6, x1]]) {
        if (c - a < 0.2) continue;
        b.add('fence', place(box(c - a, 4, 0.6), (a + c) / 2, 2, z));
        b.add('debTrim', place(box(c - a, 0.25, 0.8), (a + c) / 2, 4.1, z));
        for (const x of span(a + 0.4, c - 0.4, 5)) b.add('fence', place(box(0.8, 4.3, 0.9), x, 2.15, z));
      }
      b.add('fence', place(gateGeo, gx, 0, z));
      b.add('debTrim', place(halfRing(1.75, 2.1, 0.2, 12), gx, 2.75, z + 0.45));
      b.add('debTrim', place(box(5.6, 0.3, 1.1), gx, 5.95, z));
      b.add('dark', place(box(3.5, 4.5, 0.1), gx, 2.25, z - 0.35));
    };
    fenceRun(-44, -26.5, -34);
    fenceRun(26.5, 75, 36);
    // полосатая будка у правых ворот
    for (let i = 0; i < 5; i++) b.add(i % 2 ? 'stripeW' : 'stripeB', place(box(1, 0.5, 1), 39.5, 0.25 + i * 0.5, 10.3));
    b.add('stripeB', place(new THREE.ConeGeometry(0.8, 0.6, 4).rotateY(Math.PI / 4), 39.5, 2.8, 10.3));
    // одноэтажный служебный домик за левой оградой и дом с фронтоном за правой
    b.add('fence', place(box(9, 4, 10), -33.5, 2, -1));
    b.add('debRoof', place(hipRoof(10.6, 9.6, 2.2), -33.5, 4, -1, Math.PI / 2));
    b.add('fence', place(box(25, 5, 15), 67.5, 2.5, -12.5));
    b.add('debRoof', place(hipRoof(25.6, 15.6, 3), 67.5, 5, -12.5));
    // трубы на кровле Тона
    for (const [x, z] of [[-8, 1], [8, 1], [-16, -6], [16, -6], [-22, 0], [22, 0]]) {
      const top = tonRoofY(x, z) + 2.5;
      b.add('fence', place(box(0.8, top - 17, 0.8), x, (top + 17) / 2, z));
      b.add('debTrim', place(box(1.0, 0.2, 1.0), x, top, z));
    }
    // шпиль-игла башни
    b.add('iron', place(new THREE.ConeGeometry(0.16, 4.3, 8), TWR.x, 39.6, TWR.z));
    b.add('iron', place(sphere(0.22, 10, 8), TWR.x, 38.3, TWR.z));
    g.add(b.build(MK));
  }

  /* ---------- Советская: шпиль со звездой, буквы «ЛЕНИНГРАДСКИЙ» на ферме за аттиком ---------- */
  function signTruss(b, x0, x1, y0, y1) {
    const z = 7.35;
    b.add('dark', place(box(x1 - x0, 0.08, 0.08), (x0 + x1) / 2, y1 + 0.05, z));
    b.add('dark', place(box(x1 - x0, 0.08, 0.08), (x0 + x1) / 2, y0 - 0.05, z));
    for (const x of span(x0 + 0.3, x1 - 0.3, 1.6)) {
      const yr = tonRoofY(x, z);
      b.add('dark', place(box(0.07, y1 - yr + 0.1, 0.07), x, (y1 + yr) / 2, z));
      beam(b, 'dark', V3(x, y1, z), V3(x, tonRoofY(x, z - 2.5), z - 2.5), 0.06);
    }
  }
  {
    const g = featGroup('sovSite');
    const b = new Batch();
    b.add('steel', place(cyl(0.05, 0.14, 5.4, 8), TWR.x, 40.1, TWR.z)); // шпиль до y 42,5
    const st = extrude(starShape(0.6, 0.25), 0.1, 2).translate(0, 0, -0.05);
    b.add('star', place(st, TWR.x, 43.1, TWR.z));
    b.add('star', place(st, TWR.x, 43.1, TWR.z, Math.PI / 2));
    signTruss(b, -24, -6, 18.6, 20.0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(18, 1.6), M.signSov);
    m.position.set(-15, 19.3, 7.42);
    g.add(b.build(MK, { cast: false }), m);
  }

  /* ---------- 2026: вывеска «ЛЕНИНГРАДСКИЙ ВОКЗАЛ» + РЖД + «Московский транспорт» (светится ночью) ---------- */
  {
    const g = featGroup('sign26');
    const b = new Batch();
    signTruss(b, -24, -6, 18.6, 20.6);
    signTruss(b, 5, 22, 18.6, 20.6);
    g.add(b.build(MK, { cast: false }));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(18.4, 2.0), M.signL);
    l.position.set(-15, 19.6, 7.42);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(17.4, 2.0), M.signR);
    r.position.set(13.5, 19.6, 7.42);
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.6), M.haloL);
    hl.position.set(-15, 19.6, 7.47);
    const hr = new THREE.Mesh(new THREE.PlaneGeometry(18.9, 3.6), M.haloR);
    hr.position.set(13.5, 19.6, 7.47);
    hl.renderOrder = hr.renderOrder = 5;
    hl.userData.glow = hr.userData.glow = { key: 'signHalo', k: 1 };
    g.add(l, r, hl, hr);
  }

  /* ---------- 2026: угловые балкончики башни, строительный забор у правого угла, навесы выходов метро, роза на площади ---------- */
  {
    const g = featGroup('nowSite');
    const b = new Batch();
    for (const s of [-1, 1]) {
      const x = TWR.x + s * 3.75, z = TWR.z + 3.75;
      b.add('balcony', place(cyl(1.2, 1.1, 0.25, 20), x, 18.45, z));
      b.add('balcony', place(new THREE.CylinderGeometry(1.15, 1.15, 0.9, 20, 1, true), x, 19.0, z));
      b.add('balcony', place(new THREE.TorusGeometry(1.15, 0.06, 4, 20).rotateX(Math.PI / 2), x, 19.45, z));
    }
    b.add('rose', place(new THREE.CircleGeometry(7, 40).rotateX(-Math.PI / 2), 0, 0.1, 30));
    b.add('debTrim', place(new THREE.RingGeometry(7, 7.4, 40).rotateX(-Math.PI / 2), 0, 0.11, 30));
    b.add('iron', place(box(14, 2.6, 0.2), 30, 1.3, 13.5)); // строительный забор
    b.add('iron', place(box(0.2, 2.6, 12), 37, 1.3, 7.5));
    // МЖА: в 2026 частично разобрано, за строительным забором
    b.add('mzhaWall', place(box(20, 5, 26), 92, 2.5, -7));
    b.add('iron', place(box(24, 2.6, 0.2), 92, 1.3, 8.5));
    b.add('iron', place(box(0.2, 2.6, 30), 79.5, 1.3, -7));
    g.add(b.build(MK));
  }

  /* ---------- Флагшток с флагом России (2026) ---------- */
  const POLE_TOP = 43;
  const flagGeos = [];
  {
    const g = featGroup('flag');
    const b = new Batch();
    b.add('steel', place(cyl(0.05, 0.07, POLE_TOP - 37.3, 8), TWR.x, (POLE_TOP + 37.3) / 2, TWR.z));
    b.add('gold', place(sphere(0.14, 10, 8), TWR.x, POLE_TOP + 0.1, TWR.z));
    g.add(b.build(MK));
    const cols = [M.flagW, M.flagB, M.flagR];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(2.0, 0.443, 12, 1);
      geo.translate(1.0 + 0.06, POLE_TOP - 0.3 - 0.222 - i * 0.443, 0);
      geo.userData.base = geo.attributes.position.array.slice();
      flagGeos.push(geo);
      const m = new THREE.Mesh(geo, cols[i]);
      m.position.set(TWR.x, 0, TWR.z);
      m.castShadow = true;
      g.add(m);
    }
  }

  /* ---------- Советская и 2026: пилоны въезда, павильон у левого угла, второй ряд корпусов слева ---------- */
  {
    const g = featGroup('modernSite');
    const b = new Batch();
    for (const x of [-40, -36, -31, -28]) b.add('white', place(box(1, 3.5, 1), x, 1.75, 11));
    // маленький белый павильон-воротца у левого угла Тона
    const gp = new THREE.Shape();
    gp.moveTo(-2, 0); gp.lineTo(-1.1, 0); gp.lineTo(-1.1, 2.6); gp.absarc(0, 2.6, 1.1, Math.PI, 0, true);
    gp.lineTo(1.1, 0); gp.lineTo(2, 0); gp.lineTo(2, 5); gp.lineTo(-2, 5); gp.lineTo(-2, 0);
    b.add('white', place(extrude(gp, 3, 10), -29, 0, 6.5));
    b.add('white', place(box(4.4, 0.3, 3.4), -29, 5.15, 8));
    // второй ряд служебных корпусов (3–4 этажа) за длинным корпусом
    for (const [cx, cz, w, d, h, key] of [[-84, -32, 34, 40, 15, 'block'], [-88, -92, 38, 46, 17, 'brick'], [-84, -150, 32, 44, 14, 'block']]) {
      b.add(key, place(box(w, h, d), cx, h / 2, cz));
      b.add('blockRoof', place(hipRoof(w + 0.6, d + 0.6, 4), cx, h, cz));
      for (const dx of [-w / 4, w / 4]) b.add('brick', place(box(0.9, 2.6, 0.9), cx + dx, h + 2.6, cz));
    }
    g.add(b.build(MK));
  }

  /* ---------- Длинный корпус вдоль проезда слева (x −60…−42, z −160…−4) ---------- */
  {
    // Советская: белый, 3 этажа, плоская кровля, простые ряды окон
    const g = featGroup('longSov');
    const b = new Batch();
    const x0 = -60, x1 = -42, z0 = -160, z1 = -4, H = 12;
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, zc = (z0 + z1) / 2;
    b.add('white', place(box(w, H, d), cx, H / 2, zc));
    b.add('white', place(box(w + 0.4, 0.5, d + 0.4), cx, H + 0.1, zc));
    b.add('flatRoof', place(box(w - 0.4, 0.2, d - 0.4), cx, H + 0.25, zc));
    b.add('plinth', place(box(w + 0.2, 0.7, d + 0.2), cx, 0.35, zc));
    const fR = { x: x1, z: zc, ry: Math.PI / 2 }, fF = { x: cx, z: z1, ry: 0 };
    winRows(b, fR, span(-d / 2 + 2, d / 2 - 2, 3.2), [1.3, 5.2, 9.0], 1.7, 2.1, 'glass', 'trimN');
    winRows(b, fF, span(-w / 2 + 2.5, w / 2 - 2.5, 3.2), [1.3, 5.2, 9.0], 1.7, 2.1, 'glass', 'trimN');
    g.add(b.build(MK, { noShadow: ['glass', 'trimN'] }));
  }
  {
    // 2026: кремовый с белыми пилястрами, 3 этажа + серая мансардная кровля со слуховыми окнами
    const g = featGroup('long26');
    const b = new Batch();
    const x0 = -60, x1 = -42, w = x1 - x0, cx = (x0 + x1) / 2;
    for (const [z0, z1, H] of [[-56, -4, 13], [-108, -57, 13.6], [-160, -109, 12.8]]) {
      const d = z1 - z0, zc = (z0 + z1) / 2;
      b.add('cream', place(box(w, H, d), cx, H / 2, zc));
      b.add('plinth', place(box(w + 0.2, 0.8, d + 0.2), cx, 0.4, zc));
      b.add('creamTrim', place(box(w + 0.6, 0.45, d + 0.6), cx, H - 0.2, zc));
      b.add('creamTrim', place(box(w + 0.2, 0.25, d + 0.2), cx, 4.6, zc));
      b.add('mansard', place(hipRoof(w + 0.4, d + 0.4, 4.2), cx, H, zc));
      const fR = { x: x1, z: zc, ry: Math.PI / 2 };
      const us = span(-d / 2 + 2, d / 2 - 2, 3.4);
      winRows(b, fR, us, [1.4, 5.4, 9.2], 1.5, 2.3, 'glass', 'creamTrim');
      for (const u of span(-d / 2 + 0.4, d / 2 - 0.4, 6.8)) b.face('creamTrim', box(0.55, H - 1, 0.2), fR, u, H / 2, 0.1);
      for (const u of span(-d / 2 + 4, d / 2 - 4, 6.8)) { // слуховые окна
        b.face('creamTrim', box(1.6, 1.8, 1.6), fR, u, H + 1.3, -1.2);
        b.face('glass', box(0.9, 1.1, 0.05), fR, u, H + 1.25, -0.38);
        b.face('mansard', extrude(triShape(2.0, 0.8), 1.8).translate(0, 0, -0.9), fR, u, H + 2.2, -1.2);
      }
      if (z1 === -4) winRows(b, { x: cx, z: z1, ry: 0 }, span(-w / 2 + 2.5, w / 2 - 2.5, 3.4), [1.4, 5.4, 9.2], 1.5, 2.3, 'glass', 'creamTrim');
    }
    g.add(b.build(MK, { noShadow: ['glass', 'creamTrim'] }));
  }

  /* ---------- Наземный вестибюль метро «Комсомольская» (1952): крест в плане, 6-колонный портик, купол со шпилем и звездой ---------- */
  const METRO = { x: 53, z: -19 };
  {
    const g = featGroup('metro');
    const b = new Batch();
    const H = 14;
    b.add('metroWall', place(box(30, H, 42), 53, H / 2, -19)); // x 38…68, z −40…+2
    b.add('metroWall', place(box(36, H, 18), 53, H / 2, -19)); // поперечный объём x 35…71
    b.add('plinth', place(box(36.4, 0.8, 42.4), 53, 0.4, -19));
    for (const [w, d] of [[30, 42], [36, 18]]) {
      b.add('trim', place(box(w + 0.8, 0.6, d + 0.8), 53, H - 0.3, -19));
      b.add('trim', place(box(w + 1.4, 0.4, d + 1.4), 53, H + 0.2, -19));
      b.add('strip', place(box(w + 0.5, 0.12, d + 0.5), 53, H - 0.95, -19)); // подсветка карниза снизу
    }
    for (const [fx, fz, ry, len] of [[53, 2, 0, 30], [71, -19, Math.PI / 2, 18], [35, -19, -Math.PI / 2, 18], [68, -19, Math.PI / 2, 42], [38, -19, -Math.PI / 2, 42]]) {
      const f = { x: fx, z: fz, ry };
      for (let u = -len / 2 + 0.4; u <= len / 2 - 0.4; u += 0.6) b.face('trimN', box(0.25, 0.3, 0.3), f, u, H - 0.95, 0.35); // дентикулы
      if (len === 18 || len === 30) winRows(b, f, span(-len / 2 + 3, len / 2 - 3, 4), [1.5, 7.5], 2.0, 4.5, 'glass', 'trimN');
    }
    b.add('metroWall', place(box(26, 1.2, 26), 53, H + 0.9, -19)); // ступенчатая вальма
    b.add('metroWall', place(cyl(11, 11, 6, 8).rotateY(Math.PI / 8), 53, H + 3, -19)); // восьмигранный барабан
    b.add('trim', place(cyl(11.6, 11.6, 0.5, 8).rotateY(Math.PI / 8), 53, H + 6.1, -19));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      b.add('glass', place(box(2.2, 3.2, 0.1), 53 + Math.sin(a) * 10.66, H + 3, -19 + Math.cos(a) * 10.66, a));
    }
    const prof = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, ang = t * Math.PI / 2;
      prof.push(new THREE.Vector2(Math.max(0.01, 11 * Math.cos(ang) * (1 - 0.08 * t)), 10 * Math.pow(Math.sin(ang), 0.9)));
    }
    b.add('metroDome', place(new THREE.LatheGeometry(prof, 32), 53, H + 6.3, -19));
    for (let r = 0; r < 16; r++) { // рёбра купола
      const a = (r / 16) * Math.PI * 2;
      for (let i = 0; i < 11; i++) {
        const p = prof[i], q = prof[i + 1];
        beam(b, 'trim', V3(53 + Math.sin(a) * (p.x + 0.05), H + 6.3 + p.y, -19 + Math.cos(a) * (p.x + 0.05)),
          V3(53 + Math.sin(a) * (q.x + 0.05), H + 6.3 + q.y, -19 + Math.cos(a) * (q.x + 0.05)), 0.22);
      }
    }
    b.add('metroWall', place(cyl(1.5, 1.5, 3, 12), 53, H + 6.3 + 10 + 1.4, -19)); // фонарик-ротонда
    b.add('metroDome', place(new THREE.ConeGeometry(1.8, 1.6, 12), 53, H + 6.3 + 10 + 3.6, -19));
    b.add('steel', place(new THREE.ConeGeometry(0.3, 9.5, 8), 53, 39.8, -19)); // шпиль
    const st = extrude(starShape(0.75, 0.3), 0.12, 2).translate(0, 0, -0.06);
    b.add('star', place(st, 53, 45.1, -19));
    b.add('star', place(st, 53, 45.1, -19, Math.PI / 2));
    // портик: 6 колонн Ø 1,4, h 11, шаг 4,6; антаблемент и аттик
    b.add('plinth', place(box(29, 0.6, 9.5), 53, 0.3, 6.2));
    for (let k = 0; k < 6; k++) {
      const x = 41.5 + k * 4.6;
      b.add('trim', place(box(1.8, 0.4, 1.8), x, 0.8, 8.5));
      b.add('metroWall', place(cyl(0.62, 0.7, 10.0, 16), x, 6.0, 8.5));
      b.add('trim', place(box(1.8, 0.6, 1.8), x, 11.3, 8.5));
    }
    b.add('metroWall', place(box(28, 1.2, 4.4), 53, 12.2, 8));
    b.add('trim', place(box(28.6, 0.35, 5.0), 53, 12.95, 8));
    for (let u = 39.4; u <= 66.6; u += 0.6) b.add('trimN', place(box(0.25, 0.28, 0.3), u, 12.6, 10.25));
    b.add('metroWall', place(box(27, 1.5, 4.0), 53, 13.9, 7.8)); // аттик
    b.add('trim', place(box(27.4, 0.25, 4.4), 53, 14.7, 7.8));
    b.add('metroWall', place(box(28, 1.2, 4.2), 53, 12.2, 4)); // кровля портика
    b.add('door', place(box(3, 4.2, 0.1), 53, 2.7, 2.06));
    for (const dx of [-7, 7]) b.add('door', place(box(2.4, 3.8, 0.1), 53 + dx, 2.5, 2.06));
    const gm = b.build(MK, { noShadow: ['trimN', 'glass', 'strip', 'door'] });
    contactShadow(gm, 53, -16, 44, 56);
    g.add(gm);
  }

  /* ---------- Здание МЖА (Советская): маленькое двухэтажное с арочными окнами и часами, дальше справа ---------- */
  {
    const g = featGroup('mzha');
    const b = new Batch();
    const x0 = 82, x1 = 102, z0 = -20, z1 = 6, H = 9;
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, zc = (z0 + z1) / 2;
    b.add('mzhaWall', place(box(w, H, d), cx, H / 2, zc));
    b.add('plinth', place(box(w + 0.2, 0.6, d + 0.2), cx, 0.3, zc));
    b.add('trim', place(box(w + 0.6, 0.45, d + 0.6), cx, H - 0.1, zc));
    b.add('flatRoof', place(box(w - 0.4, 0.2, d - 0.4), cx, H + 0.2, zc));
    const fF = { x: cx, z: z1, ry: 0 }, fL = { x: x0, z: zc, ry: -Math.PI / 2 };
    for (const f of [fF, fL]) {
      const len = f === fF ? w : d;
      for (const u of span(-len / 2 + 2, len / 2 - 2, 3)) {
        b.face('trimN', new THREE.ShapeGeometry(archShape(1.9, 3.3), 8), f, u, 1.0, 0.03);
        b.face('glass', new THREE.ShapeGeometry(archShape(1.6, 3.1), 8), f, u, 1.1, 0.05);
        b.face('trimN', new THREE.ShapeGeometry(archShape(1.6, 2.5), 8), f, u, 5.2, 0.03);
        b.face('glass', new THREE.ShapeGeometry(archShape(1.3, 2.3), 8), f, u, 5.3, 0.05);
      }
    }
    b.face('mzhaWall', box(4.4, 2.4, 0.6), fF, 0, H + 1.1, -0.2);
    b.face('clockFace', new THREE.CircleGeometry(0.8, 28), fF, 0, H + 1.15, 0.12);
    b.face('dark', box(0.08, 0.6, 0.03), fF, 0, H + 1.4, 0.15);
    b.face('dark', box(0.45, 0.1, 0.03), fF, 0.2, H + 1.15, 0.16);
    g.add(b.build(MK, { noShadow: ['trimN', 'glass', 'clockFace', 'dark'] }));
  }

  /* ---------- 2026: зал 1970-х со световыми люками, тёмный высокий объём, пристройки, коричневый корпус ---------- */
  const ledPts = [];
  const facetLines = [];
  /** Гранёная поверхность: треугольная сетка с шагом step, узлы смещены по нормали; узлы — точки светодиодов. */
  function facetFace(b, o, uDir, vDir, nDir, W, H, step = 2.5, amp = 0.35) {
    const nu = Math.max(1, Math.round(W / step)), nv = Math.max(1, Math.round(H / step));
    const grid = [];
    for (let i = 0; i <= nu; i++) {
      grid.push([]);
      for (let j = 0; j <= nv; j++) {
        const edge = i === 0 || i === nu || j === 0 || j === nv;
        const disp = edge ? 0 : amp * ((((i * 5 + j * 3) % 4) / 3) * 2 - 1);
        grid[i].push(o.clone().addScaledVector(uDir, (i / nu) * W).addScaledVector(vDir, (j / nv) * H).addScaledVector(nDir, disp));
        const p = grid[i][j].clone().addScaledVector(nDir, 0.14);
        ledPts.push(p.x, p.y, p.z);
      }
    }
    const pos = [];
    const tri = (p, q, r) => {
      const n = new THREE.Vector3().subVectors(q, p).cross(new THREE.Vector3().subVectors(r, p));
      const [a, c] = n.dot(nDir) >= 0 ? [q, r] : [r, q];
      pos.push(p.x, p.y, p.z, a.x, a.y, a.z, c.x, c.y, c.z);
    };
    const line = (p, q) => facetLines.push(p.x, p.y, p.z, q.x, q.y, q.z);
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const a = grid[i][j], c = grid[i + 1][j], d = grid[i + 1][j + 1], e = grid[i][j + 1];
      if ((i + j) % 2) { tri(a, c, e); tri(c, d, e); line(c, e); } else { tri(a, c, d); tri(a, d, e); line(a, d); }
      line(a, c); line(a, e);
      if (i === nu - 1) line(c, d);
      if (j === nv - 1) line(e, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    b.add('facet', geo);
  }
  {
    const g = featGroup('complex26');
    const b = new Batch();
    // D4: плоский зал x −28…+27,4, z −30…−15,6, h 12,5; 6 рядов люков по 8 слева и справа от оси
    b.add('hallWall', place(box(55.4, 12.5, 29.4), -0.3, 6.25, -30.3));
    for (const [w, d, x, z] of [[55.8, 0.4, -0.3, -15.8], [55.8, 0.4, -0.3, -44.8], [0.4, 29.4, -28, -30.3], [0.4, 29.4, 27.4, -30.3]]) b.add('hallWall', place(box(w, 0.7, d), x, 12.85, z)); // светлый парапет
    b.add('hallRoof', place(box(54.8, 0.2, 28.8), -0.3, 12.6, -30.3));
    for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) for (const s of [-1, 1]) {
      b.add('skylight', place(box(1.2, 0.18, 1.2), s * (2.8 + k * 2.75), 12.79, -19.6 - r * 4.4));
    }
    for (const s of [-1, 1]) winRows(b, { x: s > 0 ? 27.4 : -28, z: -30.3, ry: (s * Math.PI) / 2 }, [-10, -5, 0, 5, 10], [2, 7], 2.6, 3.2, 'glass', 'trimN');
    // D5: тёмный высокий объём x −26…+14, z −103…−30, стены h 18, пологая двускатная кровля до 21 (конёк вдоль z)
    const dx0 = -26, dx1 = 14, dz0 = -110, dz1 = -45, dcx = (dx0 + dx1) / 2, dcz = (dz0 + dz1) / 2, dw = dx1 - dx0, dd = dz1 - dz0;
    b.add('darkWall', place(box(dw, 18, dd), dcx, 9, dcz));
    const ra = Math.atan2(3, dw / 2), rl = Math.hypot(dw / 2, 3);
    for (const s of [-1, 1]) b.add('darkRoof', place(box(rl + 0.4, 0.25, dd + 0.6), dcx + (s * dw) / 4, 19.6, dcz, 0, 0, -s * ra));
    for (const z of [dz0, dz1 - 0.3]) b.add('darkWall', place(extrude(triShape(dw, 3), 0.3), dcx, 18, z));
    for (const [vx, vz] of [[-14, -58], [-4, -72], [6, -60], [-16, -88], [2, -96], [-8, -104]]) {
      b.add('lowWall', place(box(2, 1.4, 2.6), vx, 18 + 3 * (1 - Math.abs(vx - dcx) / (dw / 2)) + 0.6, vz));
    }
    for (const f of [{ x: dx0, z: dcz, ry: -Math.PI / 2 }, { x: dx1, z: dcz, ry: Math.PI / 2 }]) {
      for (const y of [4, 11]) b.face('glass', box(dd - 6, 2.2, 0.08), f, 0, y, 0.05);
    }
    b.face('glass', box(dw - 6, 2.2, 0.08), { x: dcx, z: dz0, ry: Math.PI }, 0, 11, 0.05);
    // D6: низкие пристройки
    b.add('lowWall', place(box(6, 8, 50), -29, 4, -70));
    b.add('lowRoof', place(box(6.2, 0.3, 50.2), -29, 8.1, -70));
    b.add('lowWall', place(box(13, 9, 60), 20.5, 4.5, -75));
    b.add('lowRoof', place(box(13.2, 0.3, 60.2), 20.5, 9.1, -75));
    for (const [ex, ez] of [[18, -52], [23, -66], [19, -84], [24, -98]]) b.add('steel', place(box(3, 1.8, 4), ex, 10.1, ez));
    // D10: коричневый корпус с вертикальными оконными полосами (за вестибюлем метро)
    b.add('brown', place(box(26, 25, 40), 61, 12.5, -130));
    b.add('flatRoof', place(box(25.4, 0.3, 39.4), 61, 25.1, -130));
    for (const f of [{ x: 48, z: -130, ry: -Math.PI / 2 }, { x: 61, z: -110, ry: 0 }]) {
      const len = f.ry === 0 ? 26 : 40;
      for (const u of span(-len / 2 + 2.5, len / 2 - 2.5, 3.5)) b.face('brownGlass', box(1.6, 18, 0.08), f, u, 13, 0.05);
    }
    // D7: новый дебаркадер-проход — гранёная галерея x +27,5…+34,5, z −110…−12 (за правым торцом Тона, как на ночном фото), h 15
    b.add('facet', place(box(6.8, 14.8, 97.8), 31, 7.4, -61));
    facetFace(b, V3(27.5, 0.6, -11.98), V3(1, 0, 0), V3(0, 1, 0), V3(0, 0, 1), 7, 14.4);
    facetFace(b, V3(34.52, 0.6, -12.0), V3(0, 0, -1), V3(0, 1, 0), V3(1, 0, 0), 98, 14.4);
    facetFace(b, V3(34.5, 15.02, -12), V3(0, 0, -1), V3(-1, 0, 0), V3(0, 1, 0), 98, 7, 2.5, 0.2);
    // МЖА, строительный забор — в nowSite; здесь — подсветка люков и окон
    g.add(b.build(MK, { noShadow: ['glass', 'trimN', 'skylight', 'brownGlass'] }));
    const lines = new THREE.BufferGeometry();
    lines.setAttribute('position', new THREE.Float32BufferAttribute(facetLines, 3));
    g.add(new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ color: '#5a5966' })));
    // свод над головами правых платформ: x +2…+44, z −106…−160, h ≈15, «парящая» стеклянная кровля на фермах
    const steel = new Batch();
    const glass = new Batch();
    const X0 = 2, X1 = 44, Z0 = -111, Z1 = -162;
    const W = X1 - X0, D = Z0 - Z1, CX = (X0 + X1) / 2, ZC = (Z0 + Z1) / 2;
    const NX = 14, NZ = 9;
    const roofY = (u, v) => 12.2 + 2.8 * Math.sin(Math.PI * u) + 0.6 * Math.sin(Math.PI * v);
    const P = (u, v) => V3(X0 + W * u, roofY(u, v), Z0 - D * v);
    const roof = new THREE.PlaneGeometry(W, D, NX * 2, NZ * 2).rotateX(-Math.PI / 2);
    const pa = roof.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const u = (pa.getX(i) + W / 2) / W, v = (pa.getZ(i) + D / 2) / D;
      pa.setY(i, roofY(u, v));
    }
    roof.computeVertexNormals();
    glass.add('glassRoof', place(roof, CX, 0, ZC));
    for (let j = 0; j <= NZ; j += 3) for (let i = 0; i < NX; i++) beam(steel, 'vaultSteel', P(i / NX, j / NZ), P((i + 1) / NX, j / NZ), 0.3, 0.45);
    for (let i = 0; i <= NX; i += 2) for (let j = 0; j < NZ; j++) beam(steel, 'vaultSteel', P(i / NX, j / NZ), P(i / NX, (j + 1) / NZ), 0.2, 0.3);
    for (const x of [6.8, 20.4, 34]) for (const z of [-121, -147]) {
      const u = (x - X0) / W, v = (Z0 - z) / D, top = 9.5;
      steel.add('whiteSteel', place(cyl(0.3, 0.4, top - 1.1, 12), x, 1.1 + (top - 1.1) / 2, z));
      for (const [du, dv] of [[-0.07, -0.12], [0.07, -0.12], [-0.07, 0.12], [0.07, 0.12]]) beam(steel, 'whiteSteel', V3(x, top, z), P(u + du, v + dv), 0.18);
    }
    g.add(steel.build(MK, { receive: false }));
    const gmesh = glass.build(MK, { cast: false, receive: false });
    gmesh.children.forEach((m) => { m.renderOrder = 3; });
    g.add(gmesh);
  }
  const ledTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const gx = c.getContext('2d');
    const gr = gx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    gx.fillStyle = gr;
    gx.fillRect(0, 0, 32, 32);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const PX = 1 / Math.tan(THREE.MathUtils.degToRad(18)); // размер точки в метрах → size PointsMaterial
  {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(ledPts, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ map: ledTex, size: 0.38 * PX, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    p.userData.glow = { key: 'led', k: 1 };
    p.renderOrder = 4;
    feats.complex26.add(p);
  }

  /* ---------- Фонари (ореолы — одним Points на набор) ---------- */
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
  function haloPoints(feat, pts, diam, key = 'halo', k = 1) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
    const m = new THREE.PointsMaterial({ map: haloTex, size: diam * PX, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    haloMats.push(m);
    const p = new THREE.Points(geo, m);
    p.userData.glow = { key, k };
    p.renderOrder = 4;
    feats[feat].add(p);
  }
  function gasPost(b, x, y, z) {
    b.add('iron', place(box(0.4, 0.5, 0.4), x, y + 0.25, z));
    b.add('iron', place(cyl(0.07, 0.1, 3.0, 8), x, y + 2.0, z));
    b.add('iron', place(box(0.6, 0.05, 0.05), x, y + 3.2, z));
    b.add('lampGlass', place(cyl(0.24, 0.16, 0.55, 6), x, y + 3.6, z));
    b.add('iron', place(new THREE.ConeGeometry(0.33, 0.35, 6), x, y + 4.05, z));
  }
  function mast12(b, x, y, z) {
    b.add('steel', place(box(0.5, 0.8, 0.5), x, y + 0.4, z));
    b.add('steel', place(cyl(0.1, 0.18, 12, 8), x, y + 6, z));
    b.add('steel', place(box(2.4, 0.1, 0.1), x, y + 11.8, z));
    for (const s of [-1, 1]) b.add('lampGlass', place(box(0.7, 0.18, 0.35), x + s * 1.1, y + 11.65, z));
  }
  function lampSet(name, fn, list, haloY, diam) {
    const g = featGroup(name);
    const b = new Batch();
    for (const [x, z, y] of list) fn(b, x, y, z);
    g.add(b.build(MK, { receive: false }));
    haloPoints(name, list.map(([x, z, y]) => [x, y + haloY, z]), diam);
  }
  lampSet('gasSq', gasPost, [[-30, 26, 0.08], [-10, 32, 0.08], [12, 30, 0.08], [32, 25, 0.08], [-22, 50, 0.08], [6, 54, 0.08], [28, 50, 0.08], [-46, 40, 0.08]], 3.6, 2.6);
  lampSet('gasLow', gasPost, [-30, -60, -90].flatMap((z) => [[DCX - 9.7, z, 0.45], [DCX + 9.7, z, 0.45]]), 3.6, 2.6);
  lampSet('lamp26', gasPost, [-34, -22, -10, 10, 22, 34].map((x) => [x, 15.5, 0.08]).concat([[-40, 52, 0.08], [-15, 52, 0.08], [15, 52, 0.08], [40, 52, 0.08]]), 3.6, 2.8);
  lampSet('electric', mast12, [-60, -30, 0, 30, 60].flatMap((x) => [[x, 45, 0.08], [x, 80, 0.08]]), 11.6, 4.5);
  {
    // 2026: настенные фонари-торшеры у полуколонн 1-го этажа и синие указатели над входами
    const g = featGroup('wallLamps');
    const b = new Batch();
    const pts = [];
    for (const { f, cols, corn } of FACES) {
      if (f.z === TON.zb) continue;
      for (const u of [...cols, corn[1], -corn[1]]) {
        const c = Math.cos(f.ry), s = Math.sin(f.ry);
        const d = 1.15, y = 3.3;
        b.face('iron', box(0.08, 0.08, 0.7), f, u, y - 0.45, 0.85);
        b.face('lampGlass', cyl(0.17, 0.12, 0.42, 6), f, u, y, d);
        b.face('iron', new THREE.ConeGeometry(0.24, 0.24, 6), f, u, y + 0.33, d);
        pts.push([f.x + u * c + d * s, y, f.z - u * s + d * c]);
      }
    }
    for (const u of DOOR_AX) b.face('blueSign', box(1.2, 0.4, 0.08), FACES[0].f, u, 3.6, 0.42);
    g.add(b.build(MK, { cast: false }));
    haloPoints('wallLamps', pts, 0.9);
  }

  /* ---------- Извозчики (царская): ряд вдоль фасада и отдельные экипажи ---------- */
  {
    const g = featGroup('carriages');
    const parts = [];
    const p = (key, geo) => parts.push([key, geo]);
    p('coach', place(box(1.5, 1.05, 2.0), 0, 1.25, 0));
    p('dark', place(box(1.6, 0.1, 2.2), 0, 1.82, 0));
    p('dark', place(box(1.3, 0.12, 0.9), 0, 1.5, 1.5));
    for (const [zz, r] of [[0.75, 0.42], [-0.75, 0.55]]) {
      p('wheelW', place(wheel(r, 0.08), 0.8, r, zz));
      p('wheelW', place(wheel(r, 0.08), -0.8, r, zz));
    }
    p('horse', place(box(0.55, 0.65, 1.5), 0, 1.35, 3.0));
    for (const [lx, lz] of [[0.18, 2.5], [-0.18, 2.5], [0.18, 3.55], [-0.18, 3.55]]) p('horse', place(box(0.13, 1.05, 0.13), lx, 0.52, lz));
    p('horse', place(box(0.32, 0.85, 0.35), 0, 1.9, 3.75, 0, 0.5));
    p('horse', place(box(0.28, 0.3, 0.65), 0, 2.25, 4.05, 0, 0.5));
    const b = new Batch();
    const spots = [[-36, 40, 0.4], [20, 46, 1.2], [36, 20, 2.7], [-30, 30, 1.7], [44, 34, -1.4]];
    for (let i = 0; i < 11; i++) spots.push([-20 + i * 3.1, 24, Math.PI / 2]);
    for (const [x, z, ry] of spots) for (const [key, geo] of parts) b.add(key, place(geo, x, 0.08, z, ry));
    parts.forEach(([, geo]) => geo.dispose());
    g.add(b.build(MK));
  }

  /* ---------- Советская площадь: «Волги», автобус, трамваи КТМ-2 ---------- */
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
    [[-30, 64, 1], [-12, 72, -1], [8, 64, 1], [26, 72, -1], [-46, 72, -1], [40, 64, 1], [-20, 26, 0.3], [-6, 24, 1], [10, 27, -1], [18, 24, 1]]
      .forEach(([x, z, d], i) => auto(x, z, (Math.PI / 2) * d, ['car1', 'car2', 'car3', 'car4'][i % 4]));
    b.add('busC', place(box(2.5, 1.6, 11), 54, 2.0, 64, Math.PI / 2));
    b.add('busR', place(box(2.52, 0.9, 11.02), 54, 0.85, 64, Math.PI / 2));
    b.add('glass', place(box(2.54, 0.9, 9.6), 54, 2.15, 64, Math.PI / 2));
    // трамвайные пути и два КТМ-2 (красный низ, кремовый верх)
    for (const z of [49, 53]) for (const s of [-0.76, 0.76]) b.add('rail', place(box(300, 0.06, 0.08), 0, 0.08, z + s));
    for (const [x, z] of [[-14, 49], [34, 53]]) {
      b.add('tramR', place(box(15, 1.3, 2.6), x, 1.05, z));
      b.add('tramC', place(box(15, 1.5, 2.6), x, 2.45, z));
      b.add('glass', place(box(13.4, 0.9, 2.64), x, 2.5, z));
      b.add('tramR', place(box(15.02, 0.18, 2.62), x, 1.8, z));
      b.add('flatRoof', place(box(14.4, 0.3, 2.3), x, 3.35, z));
      b.add('dark', place(box(0.06, 1.6, 0.06), x - 2, 4.1, z, 0, 0, 0.6));
    }
    g.add(b.build(MK));
  }

  /* ---------- Деревья (Советская, Настоящее) ---------- */
  {
    const g = featGroup('trees');
    const r = rng(7);
    const tb = new Batch();
    const spotsT = [];
    for (const z of [20, 30, 42]) spotsT.push([-66, z], [-78, z], [80, z], [92, z]);
    for (const x of [-58, -46, 48, 60, 72]) spotsT.push([x, 58]);
    for (const [x, z] of spotsT) {
      const h = 7 + r() * 3;
      tb.add('trunk', place(cyl(0.22, 0.32, h * 0.5, 6), x, h * 0.25, z));
      tb.add('tree', place(new THREE.IcosahedronGeometry(2.8 + r() * 0.8, 1), x, h * 0.62, z, 0, 0, 0, 1, 1.15, 1));
      tb.add('tree', place(new THREE.IcosahedronGeometry(2.0, 1), x + 0.8, h * 0.85, z + 0.5));
    }
    g.add(tb.build(MK));
  }

  /* ---------- Город: дома с текстурой окон (по эпохам) ---------- */
  function avoid(x, z) {
    if (x > -125 && x < 185 && z < 40 && z > -470) return true; // вокзал, соседи, пути
    if (x > -80 && x < 80 && z > -10 && z < 90) return true; // площадь
    if (x > -85 && x < 65 && z > 195 && z < 245) return true; // Казанский
    return false;
  }
  function cityBlocks(name, seed, count, rMin, rMax, hMin, hMax, roofs) {
    const g = featGroup(name);
    const r = rng(seed);
    const b = new Batch();
    let n = 0, guard = 0;
    while (n < count && guard++ < 3000) {
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
  cityBlocks('cityLow', 1851, SMALL ? 10 : 16, 190, 420, 6, 10, true);
  cityBlocks('cityMid', 1960, SMALL ? 22 : 32, 170, 460, 15, 28, false);
  cityBlocks('cityHigh', 2026, 3, 360, 520, 70, 110, false);

  /* ---------- Соседи (Советская, Настоящее): Ярославский вокзал справа, Казанский напротив ---------- */
  {
    const g = featGroup('neighbors');
    const b = new Batch();
    b.add('yar', place(box(60, 15, 32), 142, 7.5, -6));
    b.add('yarGreen', place(box(60.4, 1.2, 32.4), 142, 12.2, -6));
    b.add('yarRoof', place(hipRoof(60.6, 32.6, 8), 142, 15, -6));
    b.add('yar', place(box(12, 22, 12), 124, 11, 6));
    b.add('yarGreen', place(box(12.4, 1.4, 12.4), 124, 19.5, 6));
    b.add('yarRoof', place(new THREE.ConeGeometry(9, 14, 4).rotateY(Math.PI / 4), 124, 29, 6));
    b.add('trim', place(box(120, 13, 22), -8, 6.5, 222));
    b.add('yarRoof', place(hipRoof(118, 20, 5), -8, 13, 222));
    b.add('trim', place(box(14, 22, 14), -26, 11, 214));
    b.add('trim', place(box(10, 14, 10), -26, 29, 214));
    b.add('trim', place(box(7, 10, 7), -26, 41, 214));
    b.add('yarRoof', place(new THREE.ConeGeometry(4.6, 16, 8), -26, 54, 214));
    g.add(b.build(MK, { cast: false }));
  }

  /* ---------- Царская: первый Ярославский (1862) справа и Рязанский (1864) напротив — скромные здания ---------- */
  {
    const g = featGroup('oldNeighbors');
    const b = new Batch();
    b.add('fence', place(box(34, 9.5, 14), 122, 4.75, -8));
    b.add('debTrim', place(box(34.4, 0.4, 14.4), 122, 9.5, -8));
    b.add('debRoof', place(hipRoof(34.4, 14.4, 3.6), 122, 9.7, -8));
    b.add('fence', place(box(58, 9, 14), -10, 4.5, 222));
    b.add('debTrim', place(box(58.4, 0.4, 14.4), -10, 9, 222));
    b.add('debRoof', place(hipRoof(58.4, 14.4, 3.4), -10, 9.2, 222));
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
  /** plats: [{x, z0, z1, y}] — где стоят пассажиры вне площади. */
  function peopleSet(name, seed, palette, femalePal, plats) {
    const g = featGroup(name);
    const r = rng(seed);
    const make = (geo, count, pal) => {
      const m = new THREE.InstancedMesh(geo, M_('#ffffff', 0.9, 0, {}, 0.3), count);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        let x, z, y = 0.08;
        if (r() < 0.72) { x = -36 + r() * 66; z = 15 + r() * 40; }
        else {
          const p = plats[Math.floor(r() * plats.length)];
          x = p.x + (r() - 0.5) * 3.6; z = p.z0 - r() * (p.z0 - p.z1); y = p.y;
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
  peopleSet('people1', 1, ['#2a2622', '#3a3028', '#4a3b2c', '#26303a', '#5a4a38'], ['#5c2a2e', '#2f3a52', '#6b5a3e', '#3b2f2a', '#7a6650'],
    [{ x: DCX - 9.7, z0: -20, z1: -100, y: 0.45 }, { x: DCX + 9.7, z0: -20, z1: -100, y: 0.45 }]);
  peopleSet('people2', 2, ['#3c4250', '#4a4d52', '#5a5048', '#2f3540', '#6a6458', '#56423a'], null,
    [-21.5, 21.5, 35.4, DCX + 9.7].map((x) => ({ x, z0: x === DCX + 9.7 ? -125 : x > 30 ? -48 : -21, z1: -140, y: 1.1 })));
  peopleSet('people3', 3, ['#2b2f38', '#c23b3b', '#3f6aa8', '#e2d9c6', '#4b6b4a', '#d9a441', '#6a4a7a', '#1f1f22'], null,
    PLAT26.map(({ x, z0 }) => ({ x, z0: z0 - 2, z1: -240, y: 1.1 })));

  for (const f of FEATS) makeFadeable(f);

  /* ---------- Поезда: пути и точки остановки по эпохам ---------- */
  const TRACK_OF = { steam51: DCX + 4.2, electro: 16.9, sapsan: 11.4 };
  const STOP_OF = { steam51: Z_BUF51 - 1.2, electro: -19.5 - 1.2, sapsan: -130 - 1.2 };

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
      tr.dur = Math.max(1.2, ARRIVE_DUR * Math.min(1, (STOP_OF[tr.type] - tr.z) / (STOP_OF[tr.type] - FAR_Z)));
    } else { tr.zFrom = FAR_Z; tr.t0 = now + delay; tr.dur = ARRIVE_DUR; }
    tr.mode = 'arriving';
  }
  function setTrain(type, instant, now) {
    const next = trains[type];
    if (instant) {
      for (const t of Object.values(trains)) {
        t.mode = t === next ? 'idle' : 'hidden';
        t.z = t === next ? STOP_OF[t.type] : FAR_Z;
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
        t.z = THREE.MathUtils.lerp(t.zFrom, STOP_OF[t.type], easeOut(p));
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
  let dayOverride = false;
  function lookOf(i) {
    const e = ERAS[i];
    const look = dayOverride && i === N - 1 ? { ...e.look, ...DAY26 } : e.look;
    const o = {};
    for (const k of COLOR_KEYS) o[k] = new THREE.Color(look[k]);
    for (const k of NUM_KEYS) o[k] = look[k];
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

    for (const k of ['ground', 'paving', 'wallA', 'trim', 'plinth', 'roof', 'dome', 'debWall', 'customsRoof', 'city']) M[k].color.copy(l[k]);
    M.road.color.copy(l.road);
    M.colLit.color.copy(l.trim);
    M.signL.color.copy(l.signC);
    M.signR.color.copy(l.signC);
    M.edge.color.copy(l.edgeC);
    M.cityRoof.color.copy(l.roof).multiplyScalar(0.7);
    M.city.emissiveIntensity = l.cityGlow * 0.9;
    // ночь 2026: стены мягче, колонны и пилястры ярче (свет снизу), окна 2-го этажа ровно-тёплые, циферблаты холодно-белые
    M.wallA.emissiveIntensity = l.wallGlow;
    M.trim.emissiveIntensity = l.wallGlow * 2.2;
    M.colLit.emissiveIntensity = l.colLit;
    M.balcony.emissiveIntensity = l.wallGlow * 1.2;
    M.metroWall.emissiveIntensity = l.wallGlow * 0.45;
    M.glass.emissive.copy(l.winGlow);
    M.glass.emissiveIntensity = l.win;
    M.glassUp.emissive.copy(l.winGlow);
    M.glassUp.emissiveIntensity = l.glassUp;
    M.door.emissive.copy(l.winGlow);
    M.door.emissiveIntensity = l.win * 0.5;
    M.brownGlass.emissiveIntensity = l.win * 0.6;
    M.clockFace.emissiveIntensity = l.clock;
    M.signL.emissiveIntensity = l.signGlow;
    M.signR.emissiveIntensity = l.signGlow;
    M.haloL.opacity = M.haloR.opacity = l.signHalo;
    M.skylight.emissiveIntensity = l.led * 0.55;
    M.facet.emissiveIntensity = l.led * 0.07;
    M.vaultSteel.emissiveIntensity = l.led * 0.9;
    M.blueSign.emissiveIntensity = l.led * 2.2;
    M.board.emissiveIntensity = 0;
    for (const m of [M.flagW, M.flagB, M.flagR]) m.emissiveIntensity = l.facade * 0.35;
    M.lampGlass.emissive.copy(l.lampColor);
    M.lampGlass.emissiveIntensity = l.lamp;
    M.strip.emissiveIntensity = l.facade * 1.4;
    for (const m of haloMats) m.color.copy(l.lampColor);
    for (const [m, base] of ENV) m.envMapIntensity = base * l.env * 1.6;
    spots.forEach((s) => { s.intensity = l.facade * s.userData.base; });

    for (const f of FEATS) applyFade(f, l['f_' + f]);
    // ореолы фонарей, светодиоды, свечение вывески — прозрачность по «виду» и по появлению группы
    for (const f of FEATS) {
      if (!feats[f].visible) continue;
      const v = l['f_' + f];
      feats[f].traverse((o) => {
        const gl = o.userData.glow;
        if (gl) o.material.opacity = Math.min(1, l[gl.key] * gl.k * v);
      });
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
    const r = portrait ? 175 : aspect < 1.2 ? 158 : 134;
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
    if (!viewLocked) camera.fov = W / H < 0.8 ? 46 : 36;
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
        p[i + 2] = b[i + 2] + Math.sin(x * 2.2 - t * (reduce ? 0 : 3.2)) * 0.1 * x / 2.0;
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
    view(px, py, pz, tx2, ty, tz, fov) {
      viewLocked = true;
      if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      controls.autoRotate = false;
      controls.minDistance = 2;
      controls.maxPolarAngle = 1.56;
      camera.clearViewOffset();
      camera.position.set(px, py, pz);
      controls.target.set(tx2, ty, tz);
      controls.update();
    },
    /** Для сравнительных снимков: дневной свет в «Настоящем». */
    day(on) { dayOverride = !!on; setEra(targetIdx, true); },
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
  day: (on) => world && world.day(on),
  stats: () => world && world.stats(),
  get index() { return ui.idx; },
  get webgl() { return !!world; },
};
