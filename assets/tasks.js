/* IQ·Квест — разделы и 30 заданий теста.
   Все рисунки строятся кодом (SVG): чёткие на любом экране и почти ничего не весят.
   У каждого задания: sec — раздел, d — сложность (1–3, она же вес в баллах),
   q — вопрос, pic — рисунок, opts — варианты, ans — номер верного варианта (с нуля),
   why — объяснение для подробного разбора. */

var COL = {
  ink: '#24223f', violet: '#6c4cf1', violetL: '#ebe6ff', coral: '#ff6b6b', yellow: '#ffc531',
  mint: '#1fc2a2', sky: '#3fa7ff', pink: '#ff7eb6', gray: '#b3aecf', line: '#e4e0f3'
};
var FONT = 'Nunito, Segoe UI, Arial, sans-serif';

/* ---------- мини-библиотека SVG ---------- */
function at(o) { var s = '', k; for (k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"'; return s; }
function ext(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; if (b) for (k in b) r[k] = b[k]; return r; }
function svgBox(w, h, inner, cls) {
  return '<svg' + at({ 'class': cls || 'pic', viewBox: '0 0 ' + w + ' ' + h, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }) + '>' + inner + '</svg>';
}
function circ(cx, cy, r, o) { return '<circle' + at(ext({ cx: cx, cy: cy, r: r }, o)) + '/>'; }
function box(x, y, w, h, o) { return '<rect' + at(ext({ x: x, y: y, width: w, height: h }, o)) + '/>'; }
function poly(p, o) {
  return '<polygon' + at(ext({ points: p.map(function (q) { return (+q[0]).toFixed(1) + ',' + (+q[1]).toFixed(1); }).join(' ') }, o)) + '/>';
}
function ln(x1, y1, x2, y2, o) { return '<line' + at(ext({ x1: x1, y1: y1, x2: x2, y2: y2 }, o)) + '/>'; }
function pth(d, o) { return '<path' + at(ext({ d: d }, o)) + '/>'; }
// текст, отцентрованный по точке (x, y)
function txt(x, y, s, size, o) {
  size = size || 24;
  return '<text' + at(ext({ x: x, y: (y + size * 0.35).toFixed(1), 'text-anchor': 'middle', 'font-family': FONT, 'font-weight': 800, 'font-size': size, fill: COL.ink }, o)) + '>' + s + '</text>';
}
function grp(inner, tr) { return '<g transform="' + tr + '">' + inner + '</g>'; }
function regPts(cx, cy, r, n, rot) {
  var p = [], i, a;
  for (i = 0; i < n; i++) { a = (-90 + (rot || 0) + i * 360 / n) * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return p;
}
function starPts(cx, cy, R, r, n) {
  var p = [], i, a, rr;
  for (i = 0; i < n * 2; i++) { a = (-90 + i * 180 / n) * Math.PI / 180; rr = i % 2 ? r : R; p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return p;
}

var FILL = {
  w: { fill: '#fff', stroke: COL.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' },
  g: { fill: COL.gray, stroke: COL.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' },
  b: { fill: COL.ink, stroke: COL.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' },
  v: { fill: COL.violet }
};
function shape(kind, cx, cy, s, f) {
  var o = typeof f === 'string' ? FILL[f] : f;
  if (kind === 'circle') return circ(cx, cy, s, o);
  if (kind === 'square') return box(cx - s * 0.88, cy - s * 0.88, s * 1.76, s * 1.76, o);
  if (kind === 'diamond') return poly([[cx, cy - s * 1.2], [cx + s * 1.2, cy], [cx, cy + s * 1.2], [cx - s * 1.2, cy]], o);
  if (kind === 'triangle') return poly(regPts(cx, cy + s * 0.2, s * 1.2, 3, 0), o);
  if (kind === 'triangleDown') return poly(regPts(cx, cy - s * 0.2, s * 1.2, 3, 180), o);
  return '';
}

// матрица 3×3, девятая клетка — «?»
function matrix(cells) {
  var s = '', i, x, y;
  for (i = 0; i < 9; i++) {
    x = (i % 3) * 110 + 4; y = Math.floor(i / 3) * 110 + 4;
    if (i < 8) s += box(x, y, 100, 100, { rx: 14, fill: '#fff', stroke: COL.line, 'stroke-width': 2 }) + grp(cells[i], 'translate(' + x + ' ' + y + ')');
    else s += box(x, y, 100, 100, { rx: 14, fill: '#f7f5ff', stroke: COL.violet, 'stroke-width': 3, 'stroke-dasharray': '8 6' }) + txt(x + 50, y + 50, '?', 44, { fill: COL.violet });
  }
  return svgBox(328, 328, s, 'pic pic-matrix');
}

/* ---------- Раздел 1: узоры ---------- */
var CNT_POS = { 1: [[50, 50]], 2: [[29, 50], [71, 50]], 3: [[50, 30], [28, 70], [72, 70]], 4: [[30, 30], [70, 30], [30, 70], [70, 70]] };
function many(kind, n) { return CNT_POS[n].map(function (p) { return shape(kind, p[0], p[1], 12.5, 'v'); }).join(''); }

function arrow(deg) {
  return grp(ln(50, 84, 50, 36, { stroke: COL.ink, 'stroke-width': 7, 'stroke-linecap': 'round' }) +
    poly([[50, 13], [34, 39], [66, 39]], { fill: COL.coral, stroke: COL.coral, 'stroke-width': 3, 'stroke-linejoin': 'round' }), 'rotate(' + deg + ' 50 50)');
}

var SEG = { T: [20, 20, 80, 20], B: [20, 80, 80, 80], L: [20, 20, 20, 80], R: [80, 20, 80, 80], D1: [20, 20, 80, 80], D2: [80, 20, 20, 80], V: [50, 20, 50, 80], H: [20, 50, 80, 50] };
function lines(list) {
  var s = box(20, 20, 60, 60, { fill: 'none', stroke: COL.line, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  list.forEach(function (k) {
    if (k === 'C') s += circ(50, 50, 13, { fill: 'none', stroke: COL.violet, 'stroke-width': 5 });
    else { var q = SEG[k]; s += ln(q[0], q[1], q[2], q[3], { stroke: COL.violet, 'stroke-width': 5, 'stroke-linecap': 'round' }); }
  });
  return s;
}

var DOTS = {
  1: [[50, 54]], 2: [[42, 54], [58, 54]], 3: [[38, 54], [50, 54], [62, 54]],
  4: [[42, 46], [58, 46], [42, 62], [58, 62]], 5: [[38, 46], [50, 46], [62, 46], [44, 62], [56, 62]]
};
function polyDots(n, k) {
  var rot = n === 4 ? 45 : (n === 8 ? 22.5 : 0);
  return poly(regPts(50, 52, 38, n, rot), { fill: COL.violetL, stroke: COL.violet, 'stroke-width': 3, 'stroke-linejoin': 'round' }) +
    DOTS[k].map(function (p) { return circ(p[0], p[1], 4.5, { fill: COL.ink }); }).join('');
}

/* ---------- Раздел 2: числа ---------- */
function chain(nums) {
  var s = '', w = nums.length * 80;
  nums.forEach(function (n, i) {
    var x = 40 + i * 80, q = n === '?';
    if (i) s += pth('M' + (x - 45) + ' 32 L' + (x - 37) + ' 40 L' + (x - 45) + ' 48', { fill: 'none', stroke: COL.gray, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    s += circ(x, 40, 28, q ? { fill: '#fff', stroke: COL.violet, 'stroke-width': 3, 'stroke-dasharray': '6 5' } : { fill: COL.violetL });
    s += txt(x, 40, n, n.length > 2 ? 20 : 24, { fill: q ? COL.violet : COL.ink });
  });
  return svgBox(w, 80, s, 'pic pic-wide');
}

function weight(k, x, y) {
  if (k === 'c') return circ(x, y, 9.5, { fill: COL.coral, stroke: '#d94848', 'stroke-width': 1.5 });
  if (k === 's') return box(x - 10, y - 10, 20, 20, { fill: COL.violet, rx: 2 });
  if (k === 't') return poly([[x, y - 11], [x + 11, y + 10], [x - 11, y + 10]], { fill: COL.yellow, stroke: '#d9a300', 'stroke-width': 1.5, 'stroke-linejoin': 'round' });
  return txt(x, y - 6, '?', 34, { fill: COL.violet });
}
function panItems(items, cx, baseY) {
  var s = '', rows = [], i;
  for (i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  rows.forEach(function (row, r) {
    var y = baseY - 11 - r * 22, w = row.length * 23;
    row.forEach(function (it, j) { s += weight(it, cx - w / 2 + 11.5 + j * 23, y); });
  });
  return s;
}
function scale(cx, y0, left, right) {
  var s = '', thin = { stroke: '#a7a2c4', 'stroke-width': 1.6 };
  s += poly([[cx - 36, y0 + 132], [cx + 36, y0 + 132], [cx + 22, y0 + 118], [cx - 22, y0 + 118]], { fill: '#cfc9ea' });
  s += box(cx - 4, y0 + 30, 8, 90, { fill: '#cfc9ea' });
  [-1, 1].forEach(function (sd) {
    var px = cx + sd * 84;
    s += ln(px, y0 + 30, px - 46, y0 + 92, thin) + ln(px, y0 + 30, px + 46, y0 + 92, thin);
    s += pth('M' + (px - 52) + ' ' + (y0 + 92) + ' Q' + px + ' ' + (y0 + 114) + ' ' + (px + 52) + ' ' + (y0 + 92) + ' Z', { fill: COL.violetL, stroke: COL.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  });
  s += ln(cx - 84, y0 + 30, cx + 84, y0 + 30, { stroke: COL.ink, 'stroke-width': 5, 'stroke-linecap': 'round' });
  s += circ(cx, y0 + 30, 7, { fill: COL.ink });
  s += panItems(left, cx - 84, y0 + 92) + panItems(right, cx + 84, y0 + 92);
  return s;
}

function apple(x, y) {
  return grp(circ(-6, 3, 12.5, { fill: '#ff5a5f' }) + circ(6, 3, 12.5, { fill: '#ff5a5f' }) +
    pth('M0 -8 Q1 -15 4 -18', { fill: 'none', stroke: '#7a4b2a', 'stroke-width': 3, 'stroke-linecap': 'round' }) +
    pth('M3 -14 Q12 -21 16 -12 Q8 -9 3 -14 Z', { fill: '#3cc46b' }) + circ(-9, -2, 3.5, { fill: '#fff', opacity: 0.5 }), 'translate(' + x + ' ' + y + ')');
}
function banana(x, y) {
  return grp(pth('M-18 -6 C -12 16, 12 18, 19 -8 L 15 -10 C 8 6, -8 6, -13 -8 Z', { fill: '#ffd23f', stroke: '#d9a300', 'stroke-width': 2, 'stroke-linejoin': 'round' }) +
    pth('M17 -9 L20 -14', { stroke: '#7a4b2a', 'stroke-width': 3, 'stroke-linecap': 'round' }), 'translate(' + x + ' ' + y + ')');
}
function cherry(x, y) {
  return grp(pth('M-7 4 Q-4 -10 4 -16 M8 6 Q7 -6 4 -16', { fill: 'none', stroke: '#3d8a3d', 'stroke-width': 2.5, 'stroke-linecap': 'round' }) +
    pth('M4 -16 Q14 -21 17 -12 Q9 -10 4 -16 Z', { fill: '#3cc46b' }) +
    circ(-7, 9, 8.5, { fill: '#e0313f' }) + circ(8, 11, 8.5, { fill: '#e0313f' }) +
    circ(-9, 7, 2.5, { fill: '#fff', opacity: 0.55 }) + circ(6, 9, 2.5, { fill: '#fff', opacity: 0.55 }), 'translate(' + x + ' ' + y + ')');
}
function fruitRow(y, items) {
  var s = '';
  items.forEach(function (it, i) {
    var x = 30 + i * 50;
    if (it === 'A') s += apple(x, y); else if (it === 'B') s += banana(x, y); else if (it === 'Ch') s += cherry(x, y);
    else s += txt(x, y, it, it.length > 1 ? 26 : 30, { fill: it === '?' ? COL.violet : (/^\d+$/.test(it) ? COL.ink : COL.gray) });
  });
  return s;
}

function numTri(cx, top, l, r, c) {
  var A = [cx, 22], B = [cx - 58, 128], D = [cx + 58, 128], s = '';
  s += poly([A, B, D], { fill: '#f4f1ff', stroke: COL.violet, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  [[A, top], [B, l], [D, r]].forEach(function (v) {
    s += circ(v[0][0], v[0][1], 17, { fill: '#fff', stroke: COL.violet, 'stroke-width': 3 }) + txt(v[0][0], v[0][1], v[1], 20);
  });
  s += txt(cx, 94, c, 30, { fill: c === '?' ? COL.violet : COL.coral });
  return s;
}

function clockFace(h, m, cx, cy, r) {
  var s = circ(cx, cy, r, { fill: '#fff', stroke: COL.ink, 'stroke-width': 4 }), i, a, r1;
  for (i = 0; i < 12; i++) {
    a = i * Math.PI / 6; r1 = r - (i % 3 === 0 ? 11 : 7);
    s += ln(cx + Math.sin(a) * r1, cy - Math.cos(a) * r1, cx + Math.sin(a) * (r - 4), cy - Math.cos(a) * (r - 4), { stroke: i % 3 === 0 ? COL.ink : COL.gray, 'stroke-width': i % 3 === 0 ? 3.5 : 2.5, 'stroke-linecap': 'round' });
  }
  var ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
  s += ln(cx, cy, cx + Math.sin(ha) * r * 0.5, cy - Math.cos(ha) * r * 0.5, { stroke: COL.ink, 'stroke-width': 6, 'stroke-linecap': 'round' });
  s += ln(cx, cy, cx + Math.sin(ma) * r * 0.78, cy - Math.cos(ma) * r * 0.78, { stroke: COL.violet, 'stroke-width': 4, 'stroke-linecap': 'round' });
  return s + circ(cx, cy, 4.5, { fill: COL.coral });
}

/* ---------- Раздел 3: пространство ---------- */
function mirrorArt(swap) {
  var a = swap ? COL.coral : COL.violet, b = swap ? COL.violet : COL.coral;
  return box(16, 48, 36, 36, { fill: a, rx: 4 }) + circ(72, 28, 14, { fill: b }) +
    poly([[58, 56], [88, 70], [58, 84]], { fill: COL.yellow, stroke: '#d9a300', 'stroke-width': 2, 'stroke-linejoin': 'round' }) +
    box(16, 16, 26, 11, { fill: COL.mint, rx: 3 });
}

var FPENT = [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]];
function pent(tr, color) {
  var s = '';
  FPENT.forEach(function (c) { s += box(17 + c[0] * 22, 17 + c[1] * 22, 22, 22, { fill: color || COL.violet, stroke: '#fff', 'stroke-width': 2, rx: 3 }); });
  return tr ? grp(s, tr) : s;
}
var MIR = 'translate(100 0) scale(-1 1)';

// изометрия: экран x ~ (y − x), поэтому грань +x видна слева, грань +y — справа (как у настоящего кубика)
function isoCubes(H) {
  var a = 30, k = a * 0.866, cx = 110, cy = 112, s = '', list = [], x, y, z;
  function P(x, y, z) { return [cx + (y - x) * k, cy + (x + y) * a / 2 - z * a]; }
  for (y = 0; y < H.length; y++) for (x = 0; x < H[y].length; x++) for (z = 0; z < H[y][x]; z++) list.push([x, y, z]);
  list.sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]) || p[2] - q[2]; });
  var st = { stroke: COL.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' };
  list.forEach(function (c) {
    var x = c[0], y = c[1], z = c[2];
    s += poly([P(x, y, z + 1), P(x, y + 1, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], ext(st, { fill: '#e2dcff' }));
    s += poly([P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x + 1, y, z)], ext(st, { fill: '#9c8bff' }));
    s += poly([P(x, y + 1, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x, y + 1, z)], ext(st, { fill: '#6c4cf1' }));
  });
  return svgBox(220, 220, s, 'pic pic-mid');
}

function holes(list) {
  var s = box(10, 10, 80, 80, { fill: '#fff', stroke: COL.ink, 'stroke-width': 2.5, rx: 2 }) +
    ln(50, 12, 50, 88, { stroke: COL.line, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }) +
    ln(12, 50, 88, 50, { stroke: COL.line, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
  list.forEach(function (p) { s += circ(10 + p[0] * 80, 10 + p[1] * 80, 5.5, { fill: COL.ink }); });
  return s;
}

function net(cells) {
  var cols = 0, rows = 0, s = '';
  cells.forEach(function (c) { cols = Math.max(cols, c[0] + 1); rows = Math.max(rows, c[1] + 1); });
  var sz = Math.min(86 / cols, 86 / rows), ox = 50 - cols * sz / 2, oy = 50 - rows * sz / 2;
  cells.forEach(function (c) { s += box(ox + c[0] * sz, oy + c[1] * sz, sz, sz, { fill: '#ffe08a', stroke: COL.ink, 'stroke-width': 2 }); });
  return s;
}

// значки на гранях кубика (рисуются в квадрате 100×100)
function sym(kind) {
  if (kind === 'star') return poly(starPts(50, 53, 38, 16, 5), { fill: COL.yellow, stroke: '#d9a300', 'stroke-width': 3, 'stroke-linejoin': 'round' });
  if (kind === 'circle') return circ(50, 50, 30, { fill: COL.coral });
  if (kind === 'tri') return poly([[50, 16], [86, 80], [14, 80]], { fill: COL.mint, 'stroke-linejoin': 'round' });
  if (kind === 'square') return box(22, 22, 56, 56, { fill: COL.violet, rx: 4 });
  if (kind === 'plus') return pth('M39 14 H61 V39 H86 V61 H61 V86 H39 V61 H14 V39 H39 Z', { fill: COL.sky });
  if (kind === 'heart') return pth('M50 84 C 20 62, 10 40, 26 27 C 37 19, 47 25, 50 34 C 53 25, 63 19, 74 27 C 90 40, 80 62, 50 84 Z', { fill: COL.pink });
  return '';
}
function isoCube(top, left, right, cx, cy) {
  var a = 54, k = a * 0.866;
  function P(x, y, z) { return [cx + (y - x) * k, cy + (x + y) * a / 2 - z * a]; }
  function face(pts, fill) { return poly(pts, { fill: fill, stroke: COL.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }); }
  function onFace(kind, O, U, V) {
    var m = [(U[0] - O[0]) / 100, (U[1] - O[1]) / 100, (V[0] - O[0]) / 100, (V[1] - O[1]) / 100, O[0], O[1]].map(function (v) { return v.toFixed(3); }).join(' ');
    return grp(grp(sym(kind), 'translate(11 11) scale(0.78)'), 'matrix(' + m + ')');
  }
  var s = face([P(0, 0, 1), P(0, 1, 1), P(1, 1, 1), P(1, 0, 1)], '#ffffff') +
    face([P(1, 0, 1), P(1, 1, 1), P(1, 1, 0), P(1, 0, 0)], '#f1eefc') +
    face([P(0, 1, 1), P(1, 1, 1), P(1, 1, 0), P(0, 1, 0)], '#e3defa');
  s += onFace(top, P(0, 0, 1), P(0, 1, 1), P(1, 0, 1));
  s += onFace(left, P(1, 0, 1), P(1, 1, 1), P(1, 0, 0));
  s += onFace(right, P(1, 1, 1), P(0, 1, 1), P(1, 1, 0));
  return s;
}
function symCard(kind) { return box(8, 8, 84, 84, { rx: 12, fill: '#f7f5ff' }) + grp(sym(kind), 'translate(18 18) scale(0.64)'); }

/* ---------- Раздел 4: слова ---------- */
function heads() {
  var s = '';
  ['Белов', 'Чернов', 'Рыжов'].forEach(function (name, i) {
    var cx = 70 + i * 120;
    s += circ(cx, 66, 32, { fill: '#ffd9b8' });
    s += pth('M' + (cx - 34) + ' 62 Q' + (cx - 32) + ' 24 ' + cx + ' 26 Q' + (cx + 32) + ' 24 ' + (cx + 34) + ' 62 Q' + (cx + 22) + ' 42 ' + cx + ' 44 Q' + (cx - 22) + ' 42 ' + (cx - 34) + ' 62 Z', { fill: COL.gray });
    s += txt(cx, 34, '?', 22, { fill: '#fff' });
    s += circ(cx - 11, 68, 3.5, { fill: COL.ink }) + circ(cx + 11, 68, 3.5, { fill: COL.ink });
    s += pth('M' + (cx - 10) + ' 80 Q' + cx + ' 88 ' + (cx + 10) + ' 80', { fill: 'none', stroke: COL.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
    s += txt(cx, 122, name, 18);
  });
  return svgBox(380, 140, s, 'pic pic-wide');
}
function penNote() {
  var s = box(40, 22, 110, 120, { rx: 8, fill: '#fff', stroke: COL.ink, 'stroke-width': 3 }) +
    box(40, 22, 18, 120, { fill: COL.violet, rx: 4 });
  [48, 68, 88, 108].forEach(function (y) { s += ln(68, y, 138, y, { stroke: COL.line, 'stroke-width': 3, 'stroke-linecap': 'round' }); });
  s += grp(box(-6, -48, 12, 88, { rx: 3, fill: COL.coral }) + poly([[-6, 40], [6, 40], [0, 54]], { fill: '#ffd9b8' }) + box(-6, -48, 12, 14, { fill: COL.ink, rx: 3 }), 'translate(190 84) rotate(28)');
  s += grp(box(0, 0, 112, 44, { rx: 22, fill: COL.yellow }) + txt(56, 22, '110 ₽', 24), 'translate(232 54)');
  return svgBox(360, 160, s, 'pic pic-wide');
}

/* ---------- Раздел 5: память и внимание ---------- */
var MEM = ['🍎', '🔑', '🐟', '🎈', '🚲', '🌵', '📚', '🍄', '🎸'];
function memGrid(items) {
  return '<div class="mem-grid">' + items.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>';
}
function posGrid(hl) {
  var s = '', i, x, y;
  for (i = 0; i < 9; i++) {
    x = (i % 3) * 64 + 4; y = Math.floor(i / 3) * 64 + 4;
    s += box(x, y, 58, 58, { rx: 12, fill: i === hl ? '#fff' : '#efecfb', stroke: i === hl ? COL.violet : 'none', 'stroke-width': 3, 'stroke-dasharray': i === hl ? '7 5' : null });
    if (i === hl) s += txt(x + 29, y + 29, '?', 30, { fill: COL.violet });
  }
  return svgBox(200, 200, s, 'pic pic-small');
}

function smiley(odd) {
  var s = circ(20, 20, 17, { fill: '#ffd23f', stroke: '#e0a800', 'stroke-width': 2 }) + circ(14, 16, 2.6, { fill: COL.ink });
  s += odd ? pth('M23 16.5 L29 16.5', { stroke: COL.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }) : circ(26, 16, 2.6, { fill: COL.ink });
  s += pth('M12 24 Q20 31 28 24', { fill: 'none', stroke: COL.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  return svgBox(40, 40, s, 'smile');
}

function scene(b) {
  var s = box(0, 0, 220, 170, { fill: '#dff1ff' }) + box(0, 132, 220, 38, { fill: '#9be08f' });
  var i, a;
  for (i = 0; i < 8; i++) { a = i * Math.PI / 4; s += ln(186 + Math.cos(a) * 20, 30 + Math.sin(a) * 20, 186 + Math.cos(a) * 27, 30 + Math.sin(a) * 27, { stroke: COL.yellow, 'stroke-width': 3, 'stroke-linecap': 'round' }); }
  s += circ(186, 30, 15, { fill: COL.yellow });
  if (!b) s += circ(52, 32, 12, { fill: '#fff' }) + circ(66, 26, 15, { fill: '#fff' }) + circ(82, 33, 11, { fill: '#fff' }) + box(52, 32, 30, 12, { fill: '#fff' });
  if (!b) s += box(132, 50, 12, 26, { fill: '#b5654a', stroke: COL.ink, 'stroke-width': 2.5 });
  s += box(80, 80, 66, 56, { fill: '#ffb38a', stroke: COL.ink, 'stroke-width': 2.5 });
  s += poly([[70, 82], [113, 46], [156, 82]], { fill: '#e0525a', stroke: COL.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  s += box(106, 104, 18, 32, { fill: COL.violet, stroke: COL.ink, 'stroke-width': 2 }) + circ(120, 121, 2, { fill: COL.yellow });
  s += box(86, 92, 15, 15, { fill: '#bfe6ff', stroke: COL.ink, 'stroke-width': 2 });
  if (!b) s += ln(93.5, 92, 93.5, 107, { stroke: COL.ink, 'stroke-width': 2 }) + ln(86, 99.5, 101, 99.5, { stroke: COL.ink, 'stroke-width': 2 });
  s += box(30, 100, 10, 36, { fill: '#9b6a43' }) + circ(35, 86, 24, { fill: '#3cbf6a' });
  if (!b) s += circ(25, 79, 4, { fill: '#e0313f' }) + circ(45, 88, 4, { fill: '#e0313f' }) + circ(32, 98, 4, { fill: '#e0313f' });
  s += ln(180, 136, 180, 116, { stroke: '#3d8a3d', 'stroke-width': 3 });
  var pc = b ? COL.yellow : COL.coral;
  for (i = 0; i < 5; i++) { a = i * Math.PI * 2 / 5 - Math.PI / 2; s += circ(180 + Math.cos(a) * 6, 112 + Math.sin(a) * 6, 4.5, { fill: pc }); }
  s += circ(180, 112, 3.5, { fill: b ? '#ff9f1c' : '#ffe08a' });
  return svgBox(220, 170, s, 'pic scene');
}

function triFigure() {
  var o = { stroke: COL.violet, 'stroke-width': 3.5, 'stroke-linecap': 'round' };
  return svgBox(200, 180,
    poly([[100, 15], [20, 165], [180, 165]], { fill: '#f7f5ff', stroke: COL.violet, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }) +
    ln(100, 15, 73.3, 165, o) + ln(100, 15, 126.7, 165, o) + ln(52, 105, 148, 105, o), 'pic pic-mid');
}

/* ---------- РАЗДЕЛЫ ---------- */
var SECTIONS = [
  {
    name: 'Узоры и закономерности', short: 'Узоры', icon: '🧩', img: 'img/s1.jpg',
    desc: 'Найдите правило, по которому меняются фигуры, и достройте картинку.',
    fact: 'Задания-матрицы придумал британский психолог Джон Равен в 1936 году. Их до сих пор используют в серьёзных тестах, потому что они почти не зависят от языка и образования.',
    tip: 'Тренируют: головоломки с узорами, судоку, настольная игра «Сет».'
  },
  {
    name: 'Числа и счёт', short: 'Числа', icon: '🔢', img: 'img/s2.jpg',
    desc: 'Числовые ряды, весы, фрукты и часы. Калькулятор не нужен: всё решается в уме.',
    fact: 'Термин «коэффициент интеллекта» (IQ) предложил немецкий психолог Вильям Штерн в 1912 году.',
    tip: 'Тренируют: устный счёт, задачи на закономерности, шахматы.'
  },
  {
    name: 'Пространство', short: 'Пространство', icon: '🧊', img: 'img/s3.jpg',
    desc: 'Зеркала, повороты, кубики и развёртки. Покрутите фигуры в голове.',
    fact: 'Существует ровно 11 разных развёрток куба. Одна из них прячется в этом разделе.',
    tip: 'Тренируют: конструкторы, тетрис, оригами, 3D-моделирование.'
  },
  {
    name: 'Слова и логика', short: 'Логика', icon: '📖', img: 'img/s4.jpg',
    desc: 'Аналогии, ловушки для интуиции и логические задачи. Читайте внимательно.',
    fact: 'Эффект Флинна: в XX веке средний результат тестов IQ рос примерно на 3 балла за десятилетие, поэтому тесты регулярно перенастраивают.',
    tip: 'Тренируют: чтение, кроссворды, логические задачи, споры по правилам.'
  },
  {
    name: 'Память и внимание', short: 'Память', icon: '💡', img: 'img/s5.jpg',
    desc: 'Запоминайте картинки и цифры, ищите отличия. Будьте готовы к сюрпризу.',
    fact: 'В кратковременной памяти человек удерживает в среднем 7 ± 2 элемента. Это «магическое число» описал психолог Джордж Миллер в 1956 году.',
    tip: 'Тренируют: игры на запоминание, «Найди отличия», хороший сон.'
  }
];

/* ---------- ЗАДАНИЯ ---------- */
var QUESTIONS = [
  /* ===== 1. Узоры ===== */
  {
    sec: 0, d: 1, kind: 'pic',
    q: 'Какая фигура должна стоять на месте знака «?»',
    pic: function () { return matrix([many('circle', 1), many('circle', 2), many('circle', 3), many('square', 1), many('square', 2), many('square', 3), many('triangle', 1), many('triangle', 2)]); },
    opts: [many('triangle', 3), many('triangle', 2), many('triangle', 4), many('circle', 3), many('square', 3), many('triangleDown', 3)],
    ans: 0,
    why: 'В каждой строке одна и та же фигура, а слева направо их становится 1, 2, 3. В третьей строке нужны три треугольника.'
  },
  {
    sec: 0, d: 1, kind: 'pic',
    q: 'Стрелка поворачивается по правилу. Какой должна быть последняя?',
    pic: function () { return matrix([arrow(0), arrow(90), arrow(180), arrow(45), arrow(135), arrow(225), arrow(90), arrow(180)]); },
    opts: [arrow(270), arrow(0), arrow(90), arrow(180), arrow(225), arrow(315)],
    ans: 0,
    why: 'В каждой строке стрелка поворачивается на 90° по часовой стрелке: 90° → 180° → 270°. Последняя стрелка смотрит влево.'
  },
  {
    sec: 0, d: 2, kind: 'pic',
    q: 'Какая фигура должна стоять на месте знака «?»',
    pic: function () {
      return matrix([shape('circle', 50, 50, 28, 'w'), shape('square', 50, 50, 28, 'b'), shape('diamond', 50, 50, 28, 'g'),
        shape('square', 50, 50, 28, 'g'), shape('diamond', 50, 50, 28, 'w'), shape('circle', 50, 50, 28, 'b'),
        shape('diamond', 50, 50, 28, 'b'), shape('circle', 50, 50, 28, 'g')]);
    },
    opts: [shape('square', 50, 50, 28, 'w'), shape('square', 50, 50, 28, 'b'), shape('square', 50, 50, 28, 'g'), shape('circle', 50, 50, 28, 'w'), shape('diamond', 50, 50, 28, 'w'), shape('triangle', 50, 50, 28, 'w')],
    ans: 0,
    why: 'В каждой строке и в каждом столбце по одному кругу, квадрату и ромбу, а также по одной белой, серой и чёрной фигуре. Не хватает белого квадрата.'
  },
  {
    sec: 0, d: 2, kind: 'pic',
    q: 'Третья картинка в строке получается из первых двух. Что на месте «?»',
    pic: function () { return matrix([lines(['T', 'L']), lines(['B', 'R']), lines(['T', 'L', 'B', 'R']), lines(['V']), lines(['H', 'C']), lines(['V', 'H', 'C']), lines(['D1', 'B']), lines(['D2', 'C'])]); },
    opts: [lines(['D1', 'D2', 'B', 'C']), lines(['D1', 'D2', 'C']), lines(['D1', 'D2', 'B']), lines(['D1', 'B', 'C']), lines(['D1', 'D2', 'T', 'C']), lines(['D2', 'B', 'C', 'V'])],
    ans: 0,
    why: 'Третья картинка — это первые две, наложенные друг на друга. Обе диагонали, нижняя линия и кружок.'
  },
  {
    sec: 0, d: 2, kind: 'pic',
    q: 'Правило изменилось. Что на месте «?»',
    note: 'Подсказка: сравните, какие линии повторяются в первых двух картинках строки.',
    pic: function () { return matrix([lines(['T', 'L', 'D1']), lines(['T', 'R']), lines(['L', 'D1', 'R']), lines(['V', 'H', 'B']), lines(['H', 'C']), lines(['V', 'B', 'C']), lines(['D1', 'D2', 'T', 'B']), lines(['D2', 'L', 'T'])]); },
    opts: [lines(['D1', 'B', 'L']), lines(['D1', 'D2', 'T', 'B', 'L']), lines(['D2', 'T']), lines(['D1', 'B']), lines(['D1', 'L', 'T']), lines(['D2', 'B', 'L'])],
    ans: 0,
    why: 'Линии, которые есть в обеих первых картинках, исчезают, остальные остаются. В третьей строке общие — диагональ «/» и верхняя линия. Остаются диагональ «\\», нижняя и левая линии.'
  },
  {
    sec: 0, d: 3, kind: 'pic',
    q: 'Здесь работают сразу два правила. Что на месте «?»',
    pic: function () { return matrix([polyDots(3, 3), polyDots(4, 2), polyDots(5, 1), polyDots(4, 4), polyDots(5, 3), polyDots(6, 2), polyDots(5, 5), polyDots(6, 4)]); },
    opts: [polyDots(7, 3), polyDots(7, 5), polyDots(6, 3), polyDots(7, 2), polyDots(8, 3), polyDots(7, 4)],
    ans: 0,
    why: 'Слева направо у фигуры прибавляется одна сторона, а точек становится на одну меньше. Каждая следующая строка сдвинута на шаг. Нужен семиугольник с тремя точками.'
  },

  /* ===== 2. Числа ===== */
  {
    sec: 1, d: 1, kind: 'text', keep: true,
    q: 'Какое число продолжает ряд?',
    pic: function () { return chain(['3', '7', '15', '31', '?']); },
    opts: ['47', '61', '62', '63', '64'],
    ans: 3,
    why: 'Каждое число умножают на 2 и прибавляют 1: 31 × 2 + 1 = 63.'
  },
  {
    sec: 1, d: 1, kind: 'text', keep: true,
    q: 'Первые двое весов уравновешены. Сколько кругов нужно положить справа на третьи весы?',
    pic: function () { return svgBox(580, 290, scale(145, 4, ['c', 'c'], ['s']) + scale(435, 4, ['s', 't'], ['c', 'c', 'c', 'c', 'c']) + scale(290, 152, ['s', 's', 't'], ['?']), 'pic pic-wide'); },
    opts: ['5', '6', '7', '8', '9'],
    ans: 2,
    why: 'Квадрат весит как 2 круга. Квадрат и треугольник весят 5 кругов, значит треугольник = 3 круга. Итого: 2 + 2 + 3 = 7.'
  },
  {
    sec: 1, d: 2, kind: 'text', keep: true,
    q: 'Каждый фрукт — это число. Сколько получится в последней строке?',
    pic: function () {
      return svgBox(370, 228, fruitRow(28, ['A', '+', 'A', '+', 'A', '=', '30']) + fruitRow(84, ['A', '+', 'B', '+', 'B', '=', '18']) +
        fruitRow(140, ['B', '+', 'Ch', '+', 'Ch', '=', '10']) + fruitRow(198, ['Ch', '+', 'A', '×', 'B', '=', '?']), 'pic pic-mid');
    },
    opts: ['17', '40', '43', '46', '52'],
    ans: 2,
    why: 'Яблоко = 10, банан = 4, вишня = 3. Ловушка в порядке действий: сначала умножение. 3 + 10 × 4 = 43, а не 52.'
  },
  {
    sec: 1, d: 2, kind: 'text', keep: true,
    q: 'Число в центре треугольника получается из чисел в углах. Какое число вместо «?»',
    pic: function () { return svgBox(480, 150, numTri(80, '3', '2', '5', '21') + numTri(240, '4', '1', '6', '28') + numTri(400, '2', '7', '4', '?'), 'pic pic-wide'); },
    opts: ['18', '22', '26', '30', '56'],
    ans: 1,
    why: 'Нижние числа складывают и умножают на верхнее: (2 + 5) × 3 = 21, (1 + 6) × 4 = 28, (7 + 4) × 2 = 22.'
  },
  {
    sec: 1, d: 2, kind: 'pic',
    q: 'Часы показывают время по порядку. Какими будут следующие?',
    pic: function () {
      return svgBox(440, 110, clockFace(11, 40, 55, 55, 46) + clockFace(1, 20, 165, 55, 46) + clockFace(3, 0, 275, 55, 46) +
        circ(385, 55, 46, { fill: '#f7f5ff', stroke: COL.violet, 'stroke-width': 3, 'stroke-dasharray': '8 6' }) + txt(385, 55, '?', 40, { fill: COL.violet }), 'pic pic-wide');
    },
    opts: [clockFace(4, 40, 50, 50, 42), clockFace(4, 20, 50, 50, 42), clockFace(5, 0, 50, 50, 42), clockFace(3, 40, 50, 50, 42), clockFace(5, 20, 50, 50, 42)],
    ans: 0,
    why: 'Каждые следующие часы показывают время на 1 час 40 минут позже: 11:40 → 1:20 → 3:00 → 4:40.'
  },
  {
    sec: 1, d: 3, kind: 'text', keep: true,
    q: 'Самый хитрый ряд раздела. Какое число следующее?',
    pic: function () { return chain(['1', '4', '9', '61', '52', '?']); },
    opts: ['36', '49', '63', '64', '72'],
    ans: 2,
    why: 'Это квадраты чисел 1, 4, 9, 16, 25, 36, записанные задом наперёд: 16 → 61, 25 → 52, 36 → 63.'
  },

  /* ===== 3. Пространство ===== */
  {
    sec: 2, d: 1, kind: 'pic',
    q: 'Справа от картинки стоит зеркало. Каким будет отражение?',
    pic: function () {
      return svgBox(270, 110, box(5, 5, 100, 100, { rx: 14, fill: '#fff', stroke: COL.line, 'stroke-width': 2 }) + grp(mirrorArt(), 'translate(5 5)') +
        box(127, 2, 12, 106, { rx: 4, fill: '#cfe9ff', stroke: COL.sky, 'stroke-width': 2 }) + ln(131, 10, 135, 30, { stroke: '#fff', 'stroke-width': 2 }) +
        box(162, 5, 100, 100, { rx: 14, fill: '#f7f5ff', stroke: COL.violet, 'stroke-width': 3, 'stroke-dasharray': '8 6' }) + txt(212, 55, '?', 44, { fill: COL.violet }), 'pic pic-mid');
    },
    opts: [grp(mirrorArt(), MIR), mirrorArt(), grp(mirrorArt(), 'rotate(180 50 50)'), grp(mirrorArt(), 'translate(0 100) scale(1 -1)'), grp(mirrorArt(true), MIR)],
    ans: 0,
    why: 'В зеркале левое и правое меняются местами, а верх и низ остаются на месте. Цвета не меняются.'
  },
  {
    sec: 2, d: 2, kind: 'pic',
    q: 'Какую фигуру можно получить из образца только поворотом, не переворачивая её?',
    pic: function () { return svgBox(120, 120, box(4, 4, 112, 112, { rx: 16, fill: '#fff', stroke: COL.line, 'stroke-width': 2 }) + grp(pent('', COL.coral), 'translate(10 10)'), 'pic pic-small'); },
    opts: [pent('rotate(90 50 50)'), pent(MIR), pent('rotate(90 50 50) ' + MIR), pent('rotate(180 50 50) ' + MIR), pent('rotate(270 50 50) ' + MIR)],
    ans: 0,
    why: 'Верный вариант — образец, повёрнутый на 90° по часовой стрелке. Остальные фигуры перевёрнуты, как в зеркале, и поворотом из образца их не получить.'
  },
  {
    sec: 2, d: 2, kind: 'text', keep: true,
    q: 'Сколько всего кубиков в этой фигуре?',
    note: 'Невидимые кубики есть только там, где на них что-то стоит: в воздухе кубики не висят.',
    pic: function () { return isoCubes([[3, 2, 1], [2, 1, 1], [1, 1, 0]]); },
    opts: ['10', '11', '12', '13', '14'],
    ans: 2,
    why: 'Считаем столбики: задний ряд 3 + 2 + 1, средний 2 + 1 + 1, передний 1 + 1. Итого 12.'
  },
  {
    sec: 2, d: 2, kind: 'pic',
    q: 'Квадратный лист сложили пополам, потом ещё раз пополам и проткнули насквозь. Каким он будет, если его развернуть?',
    pic: function () {
      var dash = { stroke: COL.coral, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, arr = { fill: 'none', stroke: COL.coral, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      var ghost = { fill: 'none', stroke: COL.line, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, paper = { fill: '#fff', stroke: COL.ink, 'stroke-width': 2.5 };
      var p1 = box(10, 10, 80, 80, paper) + ln(50, 10, 50, 90, dash) + pth('M28 46 Q50 18 72 46', arr) + pth('M64 44 L72 46 L74 38', arr);
      var p2 = box(10, 10, 80, 80, ghost) + box(50, 10, 40, 80, paper) + ln(50, 50, 90, 50, dash) + pth('M70 28 Q96 50 70 72', arr) + pth('M77 70 L70 72 L70 64', arr);
      var p3 = box(10, 10, 80, 80, ghost) + box(50, 50, 40, 40, paper) + circ(62, 78, 5.5, { fill: COL.ink });
      var ar = function (x) { return pth('M' + x + ' 50 L' + (x + 14) + ' 50 M' + (x + 8) + ' 44 L' + (x + 14) + ' 50 L' + (x + 8) + ' 56', { fill: 'none', stroke: COL.gray, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); };
      return svgBox(360, 100, p1 + ar(103) + grp(p2, 'translate(130 0)') + ar(233) + grp(p3, 'translate(260 0)'), 'pic pic-wide');
    },
    opts: [holes([[0.35, 0.15], [0.65, 0.15], [0.35, 0.85], [0.65, 0.85]]), holes([[0.35, 0.85], [0.65, 0.85]]), holes([[0.15, 0.35], [0.85, 0.35], [0.15, 0.65], [0.85, 0.65]]),
      holes([[0.4, 0.4], [0.6, 0.4], [0.4, 0.6], [0.6, 0.6]]), holes([[0.65, 0.85], [0.35, 0.15]]), holes([[0.65, 0.85]])],
    ans: 0,
    why: 'Лист сложен вчетверо, поэтому дырок будет четыре. Каждый сгиб отражает дырку зеркально, и они расходятся к углам: две сверху и две снизу.'
  },
  {
    sec: 2, d: 3, kind: 'pic',
    q: 'Какую развёртку НЕЛЬЗЯ сложить в кубик?',
    opts: [net([[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]]), net([[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]), net([[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]]),
      net([[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]]), net([[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]])],
    ans: 0,
    why: 'В неверной развёртке четыре квадрата в ряд образуют «пояс» кубика, а оба верхних квадрата при сгибании ложатся на одну и ту же грань. Сверху их два, а дна нет.'
  },
  {
    sec: 2, d: 3, kind: 'pic',
    q: 'Это один и тот же кубик в трёх положениях. Какой знак на грани напротив кружка?',
    pic: function () { return svgBox(450, 150, isoCube('star', 'circle', 'tri', 75, 75) + isoCube('heart', 'circle', 'plus', 225, 75) + isoCube('star', 'square', 'plus', 375, 75), 'pic pic-wide'); },
    opts: [symCard('square'), symCard('star'), symCard('tri'), symCard('plus'), symCard('heart')],
    ans: 0,
    why: 'Рядом с кружком мы видим звезду, треугольник, сердце и крест. Соседей у грани четыре, значит напротив кружка — единственный оставшийся знак, квадрат.'
  },

  /* ===== 4. Слова и логика ===== */
  {
    sec: 3, d: 1, kind: 'text',
    q: 'Книга относится к библиотеке так же, как картина — к…',
    opts: ['музею', 'художнику', 'раме', 'краскам', 'холсту'],
    ans: 0,
    why: 'Книги собирают и хранят в библиотеке, картины — в музее. Остальные слова связаны с картиной, но не так.'
  },
  {
    sec: 3, d: 1, kind: 'text',
    q: 'Какое слово лишнее?',
    opts: ['ЛЕС', 'ДОМ', 'МОСТ', 'БАШНЯ', 'ЗАБОР'],
    ans: 0,
    why: 'Дом, мост, башню и забор строит человек. Лес вырастает сам.'
  },
  {
    sec: 3, d: 2, kind: 'text', keep: true,
    q: 'Ручка и блокнот вместе стоят 110 ₽. Блокнот дороже ручки на 100 ₽. Сколько стоит ручка?',
    pic: penNote,
    opts: ['5 ₽', '10 ₽', '15 ₽', '50 ₽', '55 ₽'],
    ans: 0,
    why: 'Если ручка стоит 10 ₽, то блокнот 110 ₽, а вместе 120 ₽. Верно: ручка 5 ₽, блокнот 105 ₽, вместе 110 ₽. Интуиция подсказывает 10, и это ловушка.'
  },
  {
    sec: 3, d: 2, kind: 'text',
    q: 'Какое слово НЕЛЬЗЯ составить из букв слова «ПРОГРАММА»? Каждую букву можно взять столько раз, сколько она встречается.',
    opts: ['ПОРОГ', 'ПАРОМ', 'ГАММА', 'МАГМА', 'ГРАММ'],
    ans: 0,
    why: 'В слове «ПОРОГ» две буквы «О», а в «ПРОГРАММА» она одна. Остальные слова складываются.'
  },
  {
    sec: 3, d: 2, kind: 'text', keep: true,
    q: 'Все блимы — зорки. Некоторые зорки — тапы. Что из этого точно следует?',
    opts: ['Все блимы — тапы', 'Некоторые блимы — тапы', 'Ни один блим не тап', 'Все тапы — зорки', 'Ничего из перечисленного'],
    ans: 4,
    why: 'Тапы могут оказаться среди тех зорков, которые не блимы. А могут и не оказаться. Поэтому ни одно утверждение не следует наверняка.'
  },
  {
    sec: 3, d: 3, kind: 'text', keep: true,
    q: 'Встретились Белов, Чернов и Рыжов. Один из них брюнет, другой блондин, третий рыжий. Белов сказал: «Забавно, что ни у кого из нас цвет волос не совпадает с фамилией». Рыжий ответил: «Точно!» Какого цвета волосы у Белова?',
    pic: heads,
    opts: ['Чёрные', 'Светлые', 'Рыжие', 'Определить нельзя'],
    ans: 0,
    why: 'Белову ответил рыжий, значит сам Белов не рыжий. Блондином он тоже быть не может, ведь цвет не совпадает с фамилией. Остаётся брюнет.'
  },

  /* ===== 5. Память и внимание ===== */
  {
    sec: 4, d: 2, kind: 'emoji', type: 'memory', showSec: 10,
    showText: 'Запомните, где лежит каждый предмет',
    show: function () { return memGrid(MEM); },
    q: 'Какой предмет лежал в клетке, отмеченной знаком «?»',
    pic: function () { return posGrid(8); },
    opts: ['🎸', '📚', '🍄', '🌵', '🐟'],
    ans: 0,
    why: 'В правом нижнем углу лежала гитара. Вся картинка: 🍎 🔑 🐟 / 🎈 🚲 🌵 / 📚 🍄 🎸.'
  },
  {
    sec: 4, d: 2, kind: 'text', type: 'memory', showSec: 6,
    showText: 'Запомните цифры по порядку',
    show: function () { return '<div class="mem-digits">7391648</div>'; },
    q: 'Какие цифры вы видели?',
    opts: ['7 3 9 1 6 4 8', '7 3 1 9 6 4 8', '7 3 9 1 6 8 4', '7 3 9 1 4 6 8', '7 9 3 1 6 4 8'],
    ans: 0,
    why: 'Было: 7 3 9 1 6 4 8. В остальных вариантах две соседние цифры поменялись местами.'
  },
  {
    sec: 4, d: 1, type: 'grid', cols: 7, n: 42,
    q: 'Найдите смайлик, который отличается от остальных, и нажмите на него.',
    why: 'Отличался смайлик, который подмигивает: один глаз у него закрыт.'
  },
  {
    sec: 4, d: 2, kind: 'text', keep: true,
    q: 'Сколько отличий между картинками?',
    pic: function () { return '<div class="scenes">' + scene(false) + scene(true) + '</div>'; },
    opts: ['3', '4', '5', '6', '7'],
    ans: 2,
    why: 'Пять отличий: облако, труба на крыше, рама в окне, яблоки на дереве и цвет цветка.'
  },
  {
    sec: 4, d: 3, kind: 'text', keep: true,
    q: 'Сколько треугольников на рисунке?',
    note: 'Считайте треугольники любого размера, в том числе составленные из нескольких частей.',
    pic: triFigure,
    opts: ['6', '8', '10', '12', '13'],
    ans: 3,
    why: 'Из верхней вершины выходят 4 линии, они дают 6 пар. Каждая пара образует треугольник с нижним основанием и с горизонтальной линией: 6 × 2 = 12.'
  },
  {
    sec: 4, d: 2, kind: 'emoji',
    q: 'Сюрприз! Вспомните картинку из первого задания этого раздела. Какого предмета там НЕ было?',
    opts: ['⚽', '🔑', '🚲', '🍄', '🐟'],
    ans: 0,
    why: 'Мяча не было. На картинке были: 🍎 🔑 🐟 🎈 🚲 🌵 📚 🍄 🎸.'
  }
];
