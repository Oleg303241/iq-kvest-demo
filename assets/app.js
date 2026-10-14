/* IQ·Квест — логика сайта: главная, прохождение теста, результат, разбор, «поделиться». */
(function () {
  'use strict';

  var TOTAL = 25 * 60;           // время на весь тест, секунд
  var LET = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
  var app = document.getElementById('app');
  var st = null;                 // состояние текущего прохождения
  var loop = null, memTimer = null;
  var current = null;            // показанный результат

  var LOGO = '<svg class="logo-ico" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#6c4cf1"/>' +
    '<circle cx="15" cy="16" r="6" fill="#fff"/><circle cx="26" cy="16" r="6" fill="#fff"/><circle cx="15" cy="16" r="2.6" fill="#24223f"/><circle cx="26" cy="16" r="2.6" fill="#24223f"/>' +
    '<path d="M17 25 L20.5 29 L24 25 Z" fill="#ffc531"/></svg>';

  var LEVELS = [
    { min: 140, name: 'Гений', emoji: '🏆', text: 'Такой результат встречается реже, чем у одного человека из двухсот. Вы видите закономерности там, где другие видят хаос.' },
    { min: 130, name: 'Интеллектуал', emoji: '🚀', text: 'Очень высокий результат — выше, чем у 97% людей. Вы быстро схватываете суть и держите в голове сложные конструкции.' },
    { min: 120, name: 'Стратег', emoji: '🎯', text: 'Высокий результат. Вы хорошо видите правила и умеете думать на несколько шагов вперёд.' },
    { min: 110, name: 'Аналитик', emoji: '🔍', text: 'Выше среднего. Логика и внимательность — ваши сильные стороны.' },
    { min: 90, name: 'Уверенный ум', emoji: '💡', text: 'Средний диапазон, в нём находится половина взрослых. Где вы сильнее, а где есть запас роста, покажет подробный разбор.' },
    { min: 0, name: 'Практик', emoji: '🛠️', text: 'Головоломки на время — не ваша стихия, и это нормально: тест измеряет лишь часть способностей. Попробуйте пройти его ещё раз на свежую голову.' }
  ];

  /* ---------- утилиты ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function level(iq) { for (var i = 0; i < LEVELS.length; i++) if (iq >= LEVELS[i].min) return LEVELS[i]; return LEVELS[LEVELS.length - 1]; }
  function phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function percentile(iq) { return Math.min(99, Math.max(1, Math.round(phi((iq - 100) / 15) * 100))); }
  function top() { window.scrollTo(0, 0); }

  var toastT = null;
  function toast(msg) {
    var el = $('#toast');
    el.innerHTML = msg; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 4500);
  }

  function ad(kind) {
    return '<div class="ad ad-' + kind + '"><span class="ad-tag">Реклама</span><b>Здесь будет рекламный блок</b><small>Яндекс РСЯ · ' +
      (kind === 'wide' ? 'адаптивный баннер' : '300×250') + ' · в демо-версии это заглушка</small></div>';
  }

  function topbar(extra) {
    return '<header class="topbar"><div class="wrap tb-row"><a class="logo" href="#" data-act="home">' + LOGO + '<span>IQ<i>·</i>Квест</span></a>' + (extra || '') + '</div></header>';
  }

  function footer() {
    return '<footer class="foot"><div class="wrap">' +
      '<div class="foot-row"><a class="logo" href="#" data-act="home">' + LOGO + '<span>IQ<i>·</i>Квест</span></a>' +
      '<nav><a href="#" data-doc="policy">Политика конфиденциальности</a><a href="#" data-doc="consent">Согласие на обработку данных</a><a href="#admin">Вход для владельца</a></nav></div>' +
      '<p>Развлекательный онлайн-тест. Результат — ориентировочная оценка, а не психологическая или медицинская диагностика.</p>' +
      '<p>© 2026 IQ·Квест (рабочее название) · демо-версия</p></div></footer>';
  }

  /* ---------- ГЛАВНАЯ ---------- */
  function renderHome() {
    var last = Store.get('last', null);
    var secCards = SECTIONS.map(function (s, i) {
      return '<article class="sec-card"><img src="' + s.img + '" alt="" loading="lazy"><div class="sec-card-b"><div class="sec-num">Раздел ' + (i + 1) + ' · 6 заданий</div><h3>' + s.icon + ' ' + s.name + '</h3><p>' + s.desc + '</p></div></article>';
    }).join('');

    app.innerHTML = topbar('<nav class="nav"><a href="#" data-scroll="how">Как устроен тест</a><a href="#" data-scroll="faq">Вопросы</a><button class="btn primary sm" data-act="start">Начать</button></nav>') +
      '<main class="home">' +
      '<section class="hero wrap">' +
      '<div class="hero-text">' +
      '<div class="chips"><span>🧠 30 заданий</span><span>⏱ 25 минут</span><span>🎁 Бесплатно</span></div>' +
      '<h1>Насколько остро работает <em>ваш ум?</em></h1>' +
      '<p class="hero-lead">Узоры, числа, кубики, логические ловушки и задания на память. Пройдите тест IQ с картинками и узнайте, сколько людей вы обходите.</p>' +
      '<div class="hero-cta"><button class="btn primary big" data-act="start">Начать тест →</button>' +
      (last ? '<button class="btn ghost" data-act="last">Мой прошлый результат: <b>' + last.iq + '</b></button>' : '') + '</div>' +
      '<p class="small muted">Без регистрации. Балл IQ — сразу после теста.</p>' +
      '</div>' +
      '<div class="hero-art"><div class="blob"></div><img src="img/hero.jpg" alt="Сова-профессор с головоломкой">' +
      '<div class="float f1">' + svgBox(100, 100, many('triangle', 3)) + '</div><div class="float f2">' + svgBox(100, 100, arrow(45)) + '</div><div class="float f3">' + svgBox(100, 100, polyDots(6, 2)) + '</div></div>' +
      '</section>' +
      '<div class="wrap">' + ad('wide') + '</div>' +
      '<section class="wrap block" id="how"><h2>5 разделов — 5 сторон мышления</h2><p class="sub">Задания идут от простых к сложным. Сложные приносят больше баллов.</p><div class="sec-grid">' + secCards + '</div></section>' +
      '<section class="wrap block"><div class="card warm"><div class="warm-text"><div class="tag">Разминка</div><h2>Попробуйте прямо сейчас</h2><p>Какое число продолжает ряд? Это не входит в тест, просто для разогрева.</p></div>' +
      '<div class="warm-task">' + chain(['1', '1', '2', '3', '5', '8', '?']) +
      '<div class="warm-opts"><button data-warm="11">11</button><button data-warm="12">12</button><button data-warm="13">13</button><button data-warm="15">15</button></div><p class="warm-res" id="warmRes"></p></div></div></section>' +
      '<section class="wrap block"><h2>Как проходить тест</h2><div class="rules">' +
      '<div><span>⏱</span><h3>25 минут на всё</h3><p>Между разделами таймер стоит на паузе — можно перевести дух.</p></div>' +
      '<div><span>⏭</span><h3>Можно пропускать</h3><p>Не знаете ответ — жмите «Пропустить». Вернуться назад нельзя, как и в настоящих тестах.</p></div>' +
      '<div><span>🧮</span><h3>Без подсказок</h3><p>Без калькулятора, бумаги и поисковика — так результат будет честным.</p></div>' +
      '<div><span>🤫</span><h3>Тихое место</h3><p>В разделе «Память» картинки показываются на несколько секунд. Не отвлекайтесь.</p></div>' +
      '</div></section>' +
      '<section class="wrap block" id="faq"><h2>Частые вопросы</h2><div class="faq">' +
      '<details><summary>Это настоящий тест IQ?</summary><p>Это развлекательный онлайн-тест на тех же типах заданий, что и профессиональные: матрицы, числовые ряды, пространственные задачи, логика и память. Он даёт ориентировочную оценку. Точный IQ определяет психолог по стандартизированной методике.</p></details>' +
      '<details><summary>Как считается результат?</summary><p>Лёгкое задание приносит 1 балл, среднее — 2, сложное — 3. Сумму мы переводим в привычную шкалу IQ, где 100 — средний результат, а в диапазон 85–115 попадают около двух третей людей. Быстрое прохождение даёт небольшой бонус.</p></details>' +
      '<details><summary>Это бесплатно?</summary><p>Да. Балл IQ вы увидите сразу. Подробный разбор по разделам с правильными ответами тоже бесплатный: он откроется, когда вы оставите контакты.</p></details>' +
      '<details><summary>Можно пройти ещё раз?</summary><p>Да, но второй результат обычно выше: задания уже знакомы. Самый честный результат — первый.</p></details>' +
      '</div></section>' +
      '<section class="wrap block"><div class="card cta-end"><img src="img/hero.jpg" alt=""><div><h2>Готовы проверить себя?</h2><p>25 минут, 30 заданий и один честный ответ.</p><button class="btn primary big" data-act="start">Начать тест →</button></div></div></section>' +
      '</main>' + footer();
    top();
  }

  /* ---------- ПРОХОЖДЕНИЕ ---------- */
  function startTest() {
    st = { i: 0, ans: [], perms: [], used: 0, last: Date.now(), running: false, odd: Math.floor(Math.random() * 42), memShown: {}, done: false, cur: null };
    QUESTIONS.forEach(function (q) {
      var p = (q.opts || []).map(function (_, j) { return j; });
      if (!q.keep) shuffle(p);
      st.perms.push(p);
    });
    Store.bump('starts');
    clearInterval(loop);
    loop = setInterval(tick, 250);
    showIntro(0);
  }

  function tick() {
    if (!st) return;
    var now = Date.now();
    if (st.running) st.used += (now - st.last) / 1000;
    st.last = now;
    var left = TOTAL - st.used, el = $('#timer');
    if (el) { el.textContent = fmt(left); el.parentNode.classList.toggle('warn', left < 120); }
    if (left <= 0 && st.running && !st.done) timeUp();
  }
  function run(on) { if (!st) return; tick(); st.running = on; st.last = Date.now(); }

  function testBar(sec) {
    var pct = st.i / QUESTIONS.length * 100, ticks = '';
    for (var k = 1; k < 5; k++) ticks += '<b style="left:' + (k * 20) + '%"></b>';
    return '<header class="testbar"><div class="wrap tb-row">' +
      '<a class="logo sm" href="#" data-act="quit" title="Выйти из теста">' + LOGO + '</a>' +
      '<div class="tb-sec">' + SECTIONS[sec].icon + ' <span>' + SECTIONS[sec].name + '</span></div>' +
      '<div class="tb-count">' + Math.min(st.i + 1, QUESTIONS.length) + '<small> / ' + QUESTIONS.length + '</small></div>' +
      '<div class="tb-timer' + (TOTAL - st.used < 120 ? ' warn' : '') + '">⏱ <b id="timer">' + fmt(TOTAL - st.used) + '</b></div>' +
      '</div><div class="tb-progress"><i style="width:' + pct + '%"></i>' + ticks + '</div></header>';
  }

  function showIntro(sec) {
    run(false);
    var S = SECTIONS[sec];
    app.innerHTML = testBar(sec) + '<main class="wrap-test">' +
      '<section class="card sec-intro anim-in">' +
      '<div class="sec-step">Раздел ' + (sec + 1) + ' из 5</div>' +
      '<img src="' + S.img + '" alt="">' +
      '<h2>' + S.icon + ' ' + S.name + '</h2>' +
      '<p class="sec-desc">' + S.desc + '</p>' +
      '<div class="fact"><b>💬 Интересный факт</b><p>' + S.fact + '</p></div>' +
      '<button class="btn primary big" data-act="go">' + (sec ? 'Продолжить' : 'Поехали') + ' →</button>' +
      '<p class="small muted">⏸ Пока вы на этой странице, таймер стоит. Осталось ' + fmt(TOTAL - st.used) + '.</p>' +
      '</section>' + (sec ? ad('wide') : '') + '</main>';
    top();
  }

  function diff(d) {
    var s = '';
    for (var i = 1; i <= 3; i++) s += '<i' + (i <= d ? ' class="on"' : '') + '></i>';
    return s + ' ' + ['', 'лёгкое', 'среднее', 'сложное'][d];
  }

  function optsHtml(q, perm) {
    var short = q.kind === 'text' && q.opts.every(function (o) { return String(o).length <= 6; });
    var cls = q.kind === 'pic' ? 'opts-pic' : (q.kind === 'emoji' ? 'opts-emoji' : (short ? 'opts-text opts-short' : 'opts-text'));
    return '<div class="opts ' + cls + (q.opts.length === 6 ? ' six' : '') + '">' + perm.map(function (orig, pos) {
      var inner = q.kind === 'pic' ? svgBox(100, 100, q.opts[orig], 'opt-svg') : '<span class="opt-t">' + esc(q.opts[orig]) + '</span>';
      return '<button class="opt" data-v="' + orig + '"><span class="opt-l">' + LET[pos] + '</span>' + inner + '</button>';
    }).join('') + '</div>';
  }

  function gridHtml(q) {
    var s = '<div class="find-grid" style="grid-template-columns:repeat(' + q.cols + ',1fr)">';
    for (var i = 0; i < q.n; i++) s += '<button class="find" data-v="' + i + '" aria-label="Смайлик ' + (i + 1) + '">' + smiley(i === st.odd) + '</button>';
    return s + '</div>';
  }

  function showQuestion() {
    var q = QUESTIONS[st.i];
    run(true);
    if (q.type === 'memory' && !st.memShown[st.i]) return showMemory(q);
    st.cur = null;
    var body = q.type === 'grid' ? gridHtml(q) : optsHtml(q, st.perms[st.i]);
    var hint = q.type === 'grid' ? '' : '<p class="kbd-hint">Можно с клавиатуры: цифры 1–' + q.opts.length + ' и Enter</p>';
    app.innerHTML = testBar(q.sec) + '<main class="wrap-test"><article class="card qcard anim-in">' +
      '<div class="q-meta"><span>Задание ' + (st.i + 1) + '</span><span class="diff">' + diff(q.d) + '</span></div>' +
      '<h2 class="q-title">' + q.q + '</h2>' + (q.note ? '<p class="q-note">' + q.note + '</p>' : '') +
      (q.pic ? '<div class="q-pic">' + q.pic() + '</div>' : '') + body +
      '<div class="q-actions"><button class="btn ghost" data-act="skip">Пропустить</button><button class="btn primary" data-act="answer" disabled>Ответить →</button></div>' +
      '</article>' + hint + '</main>';
    top();
  }

  function showMemory(q) {
    var left = q.showSec;
    app.innerHTML = testBar(q.sec) + '<main class="wrap-test"><article class="card qcard mem anim-in">' +
      '<div class="q-meta"><span>Задание ' + (st.i + 1) + '</span><span class="diff">👀 запоминание</span></div>' +
      '<h2 class="q-title">' + q.showText + '</h2>' +
      '<div class="mem-box">' + q.show() + '</div>' +
      '<div class="mem-bar"><i style="animation-duration:' + q.showSec + 's"></i></div>' +
      '<div class="q-actions"><span class="muted small">Исчезнет через <b id="memLeft">' + left + '</b> с</span><button class="btn primary" data-act="memdone">Запомнил(а) →</button></div>' +
      '</article></main>';
    top();
    clearInterval(memTimer);
    memTimer = setInterval(function () {
      left--;
      var el = $('#memLeft');
      if (el) el.textContent = left;
      if (left <= 0) memDone();
    }, 1000);
  }
  function memDone() { clearInterval(memTimer); memTimer = null; if (!st || st.done) return; st.memShown[st.i] = true; showQuestion(); }

  function commit(val) {
    if (!st || st.done) return;
    st.ans[st.i] = val;
    st.i++;
    if (st.i >= QUESTIONS.length) return finish(false);
    if (QUESTIONS[st.i].sec !== QUESTIONS[st.i - 1].sec) showIntro(QUESTIONS[st.i].sec);
    else showQuestion();
  }

  function isRight(q, a, odd) {
    if (a === null || a === undefined) return false;
    return q.type === 'grid' ? a === odd : a === q.ans;
  }

  function score() {
    var earned = 0, max = 0, sE = [0, 0, 0, 0, 0], sM = [0, 0, 0, 0, 0], correct = 0;
    QUESTIONS.forEach(function (q, i) {
      var ok = isRight(q, st.ans[i], st.odd);
      max += q.d; sM[q.sec] += q.d;
      if (ok) { earned += q.d; sE[q.sec] += q.d; correct++; }
    });
    var p = earned / max, used = Math.min(TOTAL, st.used);
    var bonus = Math.max(0, (TOTAL - used) / TOTAL) * 4 * p;   // до +4 баллов за скорость
    var iq = Math.round(100 + 15 * (p - 0.48) / 0.18 + bonus);
    iq = Math.max(70, Math.min(150, iq));
    var ans = [];
    for (var i = 0; i < QUESTIONS.length; i++) ans.push(st.ans[i] === undefined ? null : st.ans[i]);
    return {
      t: Date.now(), iq: iq, pct: percentile(iq), correct: correct, used: Math.round(used),
      secPct: sE.map(function (e, i) { return Math.round(e / sM[i] * 100); }), ans: ans, odd: st.odd, unlocked: false
    };
  }

  function finish(timeout) {
    run(false);
    st.done = true;
    clearInterval(loop); loop = null;
    clearInterval(memTimer); memTimer = null;
    var r = score();
    Store.bump('finishes');
    Store.push('results', { t: r.t, iq: r.iq, correct: r.correct, time: r.used, secs: r.secPct }, 2000);
    Store.set('last', r);
    if (timeout) {
      modal('<div class="m-center"><div class="m-emoji">⏰</div><h2>Время вышло!</h2><p>Мы посчитали ответы, которые вы успели дать. Остальные задания засчитаны как пропущенные.</p><button class="btn primary big" data-close>Смотреть результат →</button></div>', function () { renderResults(r); });
    } else renderResults(r);
  }
  function timeUp() { finish(true); }

  /* ---------- РЕЗУЛЬТАТ ---------- */
  function bell(iq) {
    var x0 = 24, x1 = 616, base = 140, k = window.innerWidth < 720 ? 1.8 : 1;
    function X(v) { return x0 + (v - 55) / 90 * (x1 - x0); }
    function Y(v) { var z = (v - 100) / 15; return base - Math.exp(-z * z / 2) * 98; }
    var d = '', f, v, cut = Math.min(145, Math.max(55, iq)), s = '';
    for (v = 55; v <= 145; v++) d += (v === 55 ? 'M' : 'L') + X(v).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
    f = 'M' + X(55) + ' ' + base + ' ';
    for (v = 55; v <= cut; v++) f += 'L' + X(v).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
    f += 'L' + X(cut).toFixed(1) + ' ' + base + ' Z';
    s += box(X(85), 30, X(115) - X(85), base - 30, { fill: '#f4f1ff', rx: 6 });
    if (k === 1) s += txt(X(100), 16, 'средний диапазон 85–115', 13, { fill: '#8f8aad', 'font-weight': 700 });
    s += pth(f, { fill: 'rgba(108,76,241,.22)' }) + pth(d, { fill: 'none', stroke: COL.violet, 'stroke-width': 3 });
    s += ln(x0, base, x1, base, { stroke: COL.line, 'stroke-width': 2 });
    (k > 1 ? [70, 100, 130] : [70, 85, 100, 115, 130, 145]).forEach(function (t) { s += ln(X(t), base, X(t), base + 6, { stroke: COL.gray, 'stroke-width': 2 }) + txt(X(t), base + 10 + 8 * k, t, 14 * k, { fill: '#8f8aad', 'font-weight': 700 }); });
    var mx = X(cut), my = Y(cut);
    s += ln(mx, base, mx, my - 16, { stroke: COL.coral, 'stroke-width': 3, 'stroke-dasharray': '5 4' }) + circ(mx, my, 7, { fill: COL.coral, stroke: '#fff', 'stroke-width': 3 });
    var bw = 88 * k, bh = 28 * k, lx = Math.max(bw / 2 + 4, Math.min(636 - bw / 2, mx)), ly = my - 18 - bh;
    if (ly < 2) { ly = my - bh / 2; lx = mx + (mx < 320 ? 1 : -1) * (bw / 2 + 14); }
    s += box(lx - bw / 2, ly, bw, bh, { rx: bh / 2, fill: COL.coral }) + txt(lx, ly + bh / 2, 'Вы: ' + iq, 15 * k, { fill: '#fff' });
    return '<div class="bell">' + svgBox(640, 140 + 14 + 16 * k, s, 'pic bell-svg') + '</div>';
  }

  function radar(vals) {
    var cx = 160, cy = 150, R = 100, s = '', i, k;
    function pt(i, r) { var a = (-90 + i * 72) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    for (k = 1; k <= 4; k++) { var ring = []; for (i = 0; i < 5; i++) ring.push(pt(i, R * k / 4)); s += poly(ring, { fill: k === 4 ? '#faf9ff' : 'none', stroke: COL.line, 'stroke-width': 1.5 }); }
    for (i = 0; i < 5; i++) { var e = pt(i, R); s += ln(cx, cy, e[0], e[1], { stroke: COL.line, 'stroke-width': 1.5 }); }
    var avg = [], me = [];
    for (i = 0; i < 5; i++) { avg.push(pt(i, R * 0.5)); me.push(pt(i, R * Math.max(0.04, vals[i] / 100))); }
    s += poly(avg, { fill: 'none', stroke: COL.gray, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    s += poly(me, { fill: 'rgba(108,76,241,.25)', stroke: COL.violet, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    me.forEach(function (p) { s += circ(p[0], p[1], 4.5, { fill: COL.violet, stroke: '#fff', 'stroke-width': 2 }); });
    for (i = 0; i < 5; i++) { var l = pt(i, R + 30); s += txt(l[0], l[1] - 8, SECTIONS[i].icon, 18) + txt(l[0], l[1] + 12, SECTIONS[i].short, 13, { fill: '#5d5a7a', 'font-weight': 700 }); }
    return svgBox(320, 300, s, 'pic radar-svg');
  }

  function verdict(p) {
    if (p >= 70) return { cls: 'good', text: 'Сильная сторона' };
    if (p >= 40) return { cls: 'mid', text: 'На уровне большинства' };
    return { cls: 'low', text: 'Есть куда расти' };
  }

  function answerView(q, a, r) {
    if (a === null || a === undefined) return '<span class="muted">пропущено</span>';
    if (q.type === 'grid') return '<span class="mini-smile">' + smiley(a === r.odd) + '</span>';
    if (q.kind === 'pic') return '<span class="mini-pic">' + svgBox(100, 100, q.opts[a], 'opt-svg') + '</span>';
    return '<b class="' + (q.kind === 'emoji' ? 'emo' : '') + '">' + esc(q.opts[a]) + '</b>';
  }

  function reviewHtml(r) {
    return QUESTIONS.map(function (q, i) {
      var a = r.ans[i], ok = isRight(q, a, r.odd), skip = a === null || a === undefined;
      var right = q.type === 'grid' ? r.odd : q.ans;
      return '<div class="rv ' + (ok ? 'ok' : (skip ? 'skip' : 'bad')) + '">' +
        '<div class="rv-head"><span class="rv-n">' + (i + 1) + '</span><span class="rv-sec">' + SECTIONS[q.sec].icon + ' ' + SECTIONS[q.sec].short + '</span><span class="rv-st">' + (ok ? '✓ верно' : (skip ? '— пропущено' : '✗ ошибка')) + '</span></div>' +
        '<p class="rv-q">' + q.q + '</p>' +
        (q.pic && q.type !== 'memory' ? '<div class="rv-pic">' + q.pic() + '</div>' : '') +
        '<div class="rv-ans"><div><small>Ваш ответ</small>' + answerView(q, a, r) + '</div><div><small>Правильный</small>' + answerView(q, right, r) + '</div></div>' +
        '<p class="rv-why">' + q.why + '</p></div>';
    }).join('');
  }

  function unlockedHtml(r) {
    var bars = SECTIONS.map(function (s, i) {
      var p = r.secPct[i], v = verdict(p);
      return '<div class="sb"><div class="sb-top"><span>' + s.icon + ' ' + s.name + '</span><b>' + p + '%</b></div>' +
        '<div class="sb-bar"><i class="' + v.cls + '" style="width:' + Math.max(3, p) + '%"></i></div>' +
        '<div class="sb-note"><span class="pill ' + v.cls + '">' + v.text + '</span> ' + s.tip + '</div></div>';
    }).join('');
    var best = 0, worst = 0;
    r.secPct.forEach(function (p, i) { if (p > r.secPct[best]) best = i; if (p < r.secPct[worst]) worst = i; });
    return '<h2>📊 Подробный разбор</h2>' +
      '<p class="sub">Сильнее всего у вас <b>' + SECTIONS[best].name.toLowerCase() + '</b>. Больше всего запаса для роста — <b>' + SECTIONS[worst].name.toLowerCase() + '</b>. Пунктир на диаграмме — средний результат.</p>' +
      '<div class="detail-top"><div class="radar">' + radar(r.secPct) + '</div><div class="sec-bars">' + bars + '</div></div>' +
      '<details class="review-wrap"><summary>Показать все 30 заданий с правильными ответами</summary><div class="review">' + reviewHtml(r) + '</div></details>';
  }

  function lockedHtml() {
    return '<div class="locked">' +
      '<div class="locked-preview" aria-hidden="true"><div class="radar">' + radar([72, 48, 64, 81, 55]) + '</div><div class="fake-bars"><i style="width:72%"></i><i style="width:48%"></i><i style="width:64%"></i><i style="width:81%"></i><i style="width:55%"></i></div></div>' +
      '<form class="lead" id="leadForm" novalidate>' +
      '<h2>🔓 Откройте подробный разбор — бесплатно</h2>' +
      '<ul class="perks"><li>Ваш профиль по 5 разделам: где вы сильнее всего</li><li>Все 30 заданий с правильными ответами и объяснениями</li><li>Советы, как прокачать слабые стороны</li></ul>' +
      '<div class="f-grid">' +
      '<label>Имя<input name="name" autocomplete="given-name" maxlength="60"></label>' +
      '<label>Телефон<input name="phone" type="tel" inputmode="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel"></label>' +
      '<label>Email<input name="email" type="email" autocomplete="email" maxlength="100"></label>' +
      '<label>Возраст<input name="age" type="number" min="14" max="99" inputmode="numeric"></label>' +
      '<label class="wide">Город<input name="city" autocomplete="address-level2" maxlength="60"></label>' +
      '</div>' +
      '<label class="check"><input type="checkbox" name="pd"><span>Даю <a href="#" data-doc="consent">согласие на обработку персональных данных</a></span></label>' +
      '<label class="check"><input type="checkbox" name="ads"><span>Хочу получать подборки головоломок и новости проекта (<a href="#" data-doc="ads">согласие на рассылку</a>). Необязательно.</span></label>' +
      '<p class="f-err" id="leadErr"></p>' +
      '<button class="btn primary big" type="submit">Открыть разбор →</button>' +
      '<p class="small muted">Как мы обращаемся с данными — в <a href="#" data-doc="policy">политике конфиденциальности</a>.</p>' +
      '</form></div>';
  }

  function renderResults(r) {
    current = r;
    var L = level(r.iq);
    app.innerHTML = topbar('<nav class="nav"><button class="btn ghost sm" data-act="restart">Пройти заново</button></nav>') +
      '<main class="wrap res">' +
      '<section class="card res-hero anim-in">' +
      '<div class="res-row"><div class="res-art"><img src="img/result.jpg" alt="Сова с кубком"></div>' +
      '<div class="res-main"><div class="res-label">Ваш IQ</div><div class="res-iq" id="iqNum">' + r.iq + '</div>' +
      '<div class="res-level">' + L.emoji + ' ' + L.name + '</div><p>' + L.text + '</p></div></div>' +
      '<div class="res-stats"><div><b>' + r.correct + '<small>/30</small></b><span>верных ответов</span></div><div><b>' + fmt(r.used) + '</b><span>время прохождения</span></div><div><b>' + r.pct + '%</b><span>людей с результатом ниже</span></div></div>' +
      bell(r.iq) +
      '</section>' +
      '<section class="card share"><div><h2>Поделитесь результатом</h2><p>Пусть друзья попробуют вас обогнать 😉</p></div><div class="share-btns">' +
      '<button class="sh vk" data-share="vk">ВКонтакте</button><button class="sh okru" data-share="ok">Одноклассники</button>' +
      '<button class="sh tg" data-share="tg">Telegram</button><button class="sh wa" data-share="wa">WhatsApp</button>' +
      '<button class="sh copy" data-share="copy">🔗 Скопировать</button><button class="sh img" data-share="img">⬇ Картинка с результатом</button></div></section>' +
      ad('wide') +
      '<section class="card detail" id="detail">' + (r.unlocked ? unlockedHtml(r) : lockedHtml()) + '</section>' +
      '<p class="disclaimer">Это развлекательный онлайн-тест. Он даёт ориентировочную оценку и не заменяет профессиональную психологическую диагностику.</p>' +
      '<div class="center"><button class="btn ghost" data-act="restart">↻ Пройти тест ещё раз</button></div>' +
      '</main>' + footer();
    top();
    countUp(r.iq);
    if (Date.now() - r.t < 5000) confetti();
  }

  function countUp(target) {
    var el = $('#iqNum'), t0 = null, from = 60;
    if (!el || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (target - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.createElement('div'), cols = ['#6c4cf1', '#ff6b6b', '#ffc531', '#1fc2a2', '#3fa7ff', '#ff7eb6'], i, p;
    box.className = 'confetti';
    for (i = 0; i < 90; i++) {
      p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = (Math.random() * 0.8) + 's';
      p.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      if (i % 3 === 0) p.style.borderRadius = '50%';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 4800);
  }

  /* ---------- ФОРМА РАЗБОРА ---------- */
  function phoneMask(v) {
    var d = v.replace(/\D/g, '');
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d && d.charAt(0) !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var s = '+7';
    if (d.length > 1) s += ' (' + d.slice(1, 4);
    if (d.length >= 4) s += ')';
    if (d.length > 4) s += ' ' + d.slice(4, 7);
    if (d.length > 7) s += '-' + d.slice(7, 9);
    if (d.length > 9) s += '-' + d.slice(9, 11);
    return s;
  }

  function submitLead(form) {
    var f = form.elements, errs = [], bad = [];
    var name = f.name.value.trim(), phone = f.phone.value.replace(/\D/g, ''), email = f.email.value.trim(), age = parseInt(f.age.value, 10), city = f.city.value.trim();
    if (name.length < 2) { errs.push('имя'); bad.push('name'); }
    if (phone.length !== 11) { errs.push('телефон полностью'); bad.push('phone'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { errs.push('корректный email'); bad.push('email'); }
    if (!(age >= 14 && age <= 99)) { errs.push('возраст'); bad.push('age'); }
    if (city.length < 2) { errs.push('город'); bad.push('city'); }
    $$('input', form).forEach(function (i) { i.classList.toggle('bad', bad.indexOf(i.name) >= 0); });
    var err = $('#leadErr');
    if (errs.length) { err.textContent = 'Укажите, пожалуйста: ' + errs.join(', ') + '.'; return; }
    if (!f.pd.checked) { err.textContent = 'Чтобы открыть разбор, нужно согласие на обработку данных.'; f.pd.parentNode.classList.add('bad'); return; }
    err.textContent = '';
    var r = current;
    Store.push('leads', { t: Date.now(), name: name, phone: f.phone.value, email: email, age: age, city: city, ads: f.ads.checked, iq: r.iq, correct: r.correct, secs: r.secPct }, 5000);
    Store.bump('leads');
    r.unlocked = true;
    Store.set('last', r);
    var d = $('#detail');
    d.innerHTML = unlockedHtml(r);
    d.classList.add('anim-in');
    d.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('Разбор открыт! В рабочей версии копия придёт на почту — в демо письма не отправляются.');
  }

  /* ---------- ПОДЕЛИТЬСЯ ---------- */
  function siteUrl() { return /^https?:$/.test(location.protocol) ? location.href.split('#')[0] : ''; }

  function copyText(s, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* не вышло — покажем текст */ }
      document.body.removeChild(ta); done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, fallback);
    else fallback();
  }

  function share(kind) {
    var r = current, url = siteUrl();
    var text = 'Мой IQ — ' + r.iq + '! Это выше, чем у ' + r.pct + '% людей. А сколько наберёшь ты?';
    if (kind === 'img') return downloadCard(r);
    if (kind === 'copy') {
      copyText(text + (url ? ' ' + url : ''), function () {
        toast(url ? 'Ссылка и текст скопированы — вставьте их в чат.' : 'Текст скопирован. Ссылка на сайт добавится, когда он будет опубликован в интернете.');
      });
      Store.bump('shares');
      return;
    }
    if (!url) { toast('Сейчас сайт открыт как файл на компьютере, поэтому делиться пока нечем. После публикации кнопка откроет окно соцсети с вашим результатом.'); return; }
    var u = encodeURIComponent(url), t = encodeURIComponent(text);
    var links = {
      vk: 'https://vk.com/share.php?url=' + u + '&title=' + t,
      ok: 'https://connect.ok.ru/offer?url=' + u + '&title=' + t,
      tg: 'https://t.me/share/url?url=' + u + '&text=' + t,
      wa: 'https://wa.me/?text=' + t + '%20' + u
    };
    Store.bump('shares');
    window.open(links[kind], '_blank', 'noopener,width=680,height=600');
  }

  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }

  function downloadCard(r) {
    function draw() {
      var c = document.createElement('canvas'), g = c.getContext('2d'), F = 'Nunito, "Segoe UI", Arial, sans-serif', L = level(r.iq);
      c.width = 1200; c.height = 630;
      var gr = g.createLinearGradient(0, 0, 1200, 630);
      gr.addColorStop(0, '#7a5cff'); gr.addColorStop(1, '#3d2bb8');
      g.fillStyle = gr; g.fillRect(0, 0, 1200, 630);
      g.globalAlpha = 0.14; g.fillStyle = '#fff';
      g.beginPath(); g.arc(1120, 70, 170, 0, 7); g.fill();
      g.beginPath(); g.arc(560, 660, 120, 0, 7); g.fill();
      g.save(); g.translate(620, 90); g.rotate(0.5); g.fillRect(-40, -40, 80, 80); g.restore();
      g.globalAlpha = 1;
      g.fillStyle = '#fff'; g.font = '800 40px ' + F; g.fillText('IQ·Квест', 80, 96);
      g.globalAlpha = 0.85; g.font = '700 44px ' + F; g.fillText('Мой IQ', 80, 214); g.globalAlpha = 1;
      g.font = '900 230px ' + F; g.fillText(String(r.iq), 66, 420);
      g.fillStyle = '#ffc531'; g.font = '800 54px ' + F; g.fillText(L.name, 80, 498);
      g.fillStyle = '#fff'; g.font = '600 32px ' + F; g.fillText('Выше, чем у ' + r.pct + '% людей · ' + r.correct + ' из 30 заданий', 80, 560);
      // карточка с кривой справа
      g.fillStyle = '#fff'; rr(g, 700, 170, 420, 300, 28); g.fill();
      var x0 = 730, x1 = 1090, base = 400, v, X = function (v) { return x0 + (v - 55) / 90 * (x1 - x0); }, Y = function (v) { var z = (v - 100) / 15; return base - Math.exp(-z * z / 2) * 150; };
      var cut = Math.min(145, Math.max(55, r.iq));
      g.beginPath(); g.moveTo(X(55), base); for (v = 55; v <= cut; v++) g.lineTo(X(v), Y(v)); g.lineTo(X(cut), base); g.closePath();
      g.fillStyle = 'rgba(108,76,241,.25)'; g.fill();
      g.beginPath(); for (v = 55; v <= 145; v++) { if (v === 55) g.moveTo(X(v), Y(v)); else g.lineTo(X(v), Y(v)); }
      g.strokeStyle = '#6c4cf1'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#ff6b6b'; g.beginPath(); g.arc(X(cut), Y(cut), 11, 0, 7); g.fill();
      g.fillStyle = '#24223f'; g.font = '800 30px ' + F; g.textAlign = 'center'; g.fillText('А ты сможешь больше?', 910, 226);
      g.fillStyle = '#8f8aad'; g.font = '700 22px ' + F; [70, 100, 130].forEach(function (t) { g.fillText(String(t), X(t), 440); });
      c.toBlob(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = 'moy-iq-' + r.iq + '.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 1000);
      }, 'image/png');
      Store.bump('shares');
      toast('Картинка сохраняется. Её можно выложить в соцсети или сторис.');
    }
    if (document.fonts && document.fonts.load) document.fonts.load('900 230px Nunito').then(draw, draw); else draw();
  }

  /* ---------- ОКНА И ДОКУМЕНТЫ ---------- */
  var modalCb = null;
  function modal(html, onClose) {
    var m = $('#modal');
    m.innerHTML = '<div class="m-back" data-close></div><div class="m-box" role="dialog" aria-modal="true"><button class="m-x" data-close aria-label="Закрыть">×</button>' + html + '</div>';
    m.hidden = false; modalCb = onClose || null;
    document.body.classList.add('no-scroll');
  }
  function closeModal() {
    var m = $('#modal');
    m.hidden = true; m.innerHTML = '';
    document.body.classList.remove('no-scroll');
    var cb = modalCb; modalCb = null;
    if (cb) cb();
  }

  var OP = '<mark>[наименование оператора: ИП или ООО]</mark>, ИНН <mark>[…]</mark>, адрес <mark>[…]</mark>, email <mark>[…]</mark>';
  var DOCS = {
    policy: '<h2>Политика конфиденциальности</h2><p class="muted small">Шаблон для демо-версии. Перед запуском текст нужно заполнить данными оператора и согласовать с юристом.</p>' +
      '<p><b>1. Оператор.</b> ' + OP + '.</p>' +
      '<p><b>2. Какие данные мы обрабатываем.</b> Имя, телефон, email, возраст, город, результаты теста, а также технические данные (cookie, сведения о браузере) для статистики посещений.</p>' +
      '<p><b>3. Зачем.</b> Чтобы показать и отправить подробный разбор результатов, отвечать на обращения, а при отдельном согласии — присылать подборки головоломок и новости проекта.</p>' +
      '<p><b>4. Где хранятся данные.</b> На серверах в России, в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>' +
      '<p><b>5. Срок.</b> До достижения целей обработки или до отзыва согласия.</p>' +
      '<p><b>6. Ваши права.</b> Вы можете узнать, какие данные мы храним, исправить их, отозвать согласие или потребовать удаления, написав на email оператора.</p>',
    consent: '<h2>Согласие на обработку персональных данных</h2><p class="muted small">Шаблон для демо-версии. Перед запуском текст нужно заполнить и согласовать с юристом.</p>' +
      '<p>Я, отмечая галочку в форме на сайте, свободно, своей волей и в своём интересе даю согласие оператору ' + OP + ' на обработку моих персональных данных: имени, номера телефона, адреса электронной почты, возраста, города и результатов теста.</p>' +
      '<p><b>Цель:</b> предоставление подробного разбора результатов теста и связь со мной по этому вопросу.</p>' +
      '<p><b>Действия:</b> сбор, запись, систематизация, хранение, уточнение, использование, удаление, уничтожение — с использованием средств автоматизации и без них.</p>' +
      '<p><b>Срок:</b> до достижения цели обработки. Согласие можно отозвать в любой момент, написав оператору на email.</p>',
    ads: '<h2>Согласие на получение рассылки</h2><p class="muted small">Шаблон для демо-версии.</p>' +
      '<p>Я согласен(на) получать от ' + OP + ' информационные и рекламные сообщения (подборки головоломок, новости проекта, предложения партнёров) по email и телефону. Согласие необязательно для получения разбора и может быть отозвано в любой момент.</p>'
  };

  /* ---------- СОБЫТИЯ ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var close = t.closest('[data-close]');
    if (close && close.closest('#modal')) { e.preventDefault(); closeModal(); return; }

    var doc = t.closest('[data-doc]');
    if (doc) { e.preventDefault(); modal(DOCS[doc.getAttribute('data-doc')] + '<div class="center"><button class="btn primary" data-close>Понятно</button></div>'); return; }

    var sc = t.closest('[data-scroll]');
    if (sc) { e.preventDefault(); var target = document.getElementById(sc.getAttribute('data-scroll')); if (target) target.scrollIntoView({ behavior: 'smooth' }); return; }

    var warm = t.closest('[data-warm]');
    if (warm) {
      var right = warm.getAttribute('data-warm') === '13';
      $$('[data-warm]').forEach(function (b) { b.disabled = true; b.classList.toggle('right', b.getAttribute('data-warm') === '13'); });
      if (!right) warm.classList.add('wrong');
      $('#warmRes').innerHTML = (right ? '🎉 Верно! ' : '🙂 Почти! Правильно — 13. ') + 'Это числа Фибоначчи: каждое равно сумме двух предыдущих. В тесте будут задачи посложнее.';
      return;
    }

    var opt = t.closest('.opt, .find');
    if (opt && st && !st.done) {
      $$('.opt.sel, .find.sel').forEach(function (b) { b.classList.remove('sel'); });
      opt.classList.add('sel');
      st.cur = +opt.getAttribute('data-v');
      var ok = $('[data-act="answer"]');
      if (ok) ok.disabled = false;
      return;
    }

    var sh = t.closest('[data-share]');
    if (sh) { share(sh.getAttribute('data-share')); return; }

    var act = t.closest('[data-act]');
    if (!act) return;
    var a = act.getAttribute('data-act');
    if (act.tagName === 'A') e.preventDefault();
    if (a === 'start' || a === 'restart') startTest();
    else if (a === 'home') { if (location.hash) location.hash = ''; renderHome(); }
    else if (a === 'last') renderResults(Store.get('last', null));
    else if (a === 'go') showQuestion();
    else if (a === 'answer' && st && st.cur !== null) commit(st.cur);
    else if (a === 'skip') commit(null);
    else if (a === 'memdone') memDone();
    else if (a === 'quit') {
      if (window.confirm('Выйти из теста? Ответы не сохранятся.')) { st.done = true; clearInterval(loop); loop = null; clearInterval(memTimer); st = null; renderHome(); }
    }
  });

  document.addEventListener('submit', function (e) {
    if (e.target.id === 'leadForm') { e.preventDefault(); submitLead(e.target); }
  });

  document.addEventListener('input', function (e) {
    if (e.target.name === 'phone' && e.target.closest('#leadForm')) e.target.value = phoneMask(e.target.value);
    if (e.target.classList.contains('bad')) e.target.classList.remove('bad');
    if (e.target.name === 'pd') e.target.parentNode.classList.remove('bad');
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.name === 'phone' && !e.target.value) e.target.value = '+7 (';
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
    if (!st || st.done || !$('.qcard') || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (/^[1-6]$/.test(e.key)) { var b = $$('.opt')[+e.key - 1]; if (b) b.click(); }
    else if (e.key === 'Enter') { var ok = $('[data-act="answer"]'); if (ok && !ok.disabled) { e.preventDefault(); ok.click(); } }
  });

  window.addEventListener('beforeunload', function (e) {
    if (st && !st.done) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- маршруты ---------- */
  function route() {
    if (location.hash === '#admin') {
      if (st && !st.done) { st.done = true; clearInterval(loop); loop = null; st = null; }
      Admin.render(app);
      top();
    } else if (!st || st.done) renderHome();
  }
  window.addEventListener('hashchange', route);

  if (location.hash !== '#admin' && !Store.session('v')) { Store.session('v', '1'); Store.bump('visits'); }
  route();
})();
