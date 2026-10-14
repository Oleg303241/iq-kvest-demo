/* IQ·Квест — панель владельца (index.html#admin).
   Демо: вход по паролю, данные из localStorage этого браузера.
   В рабочей версии вход и данные будут на сервере. */
var Admin = (function () {
  var PASS_HASH = 2085881665; // отпечаток пароля, сам пароль в коде не хранится
  var bound = false, root = null;

  function hash(s) { var x = 5381, i; for (i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x; }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dt(t) {
    var d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function render(app) {
    root = app;
    bind();
    if (Store.session('admin') === '1') dash(); else login();
  }

  function login(err) {
    root.innerHTML = '<main class="adm-login"><form class="card" id="admLogin">' +
      '<div class="adm-lock">🔐</div><h1>Вход для владельца</h1><p class="muted">Статистика теста и заявки на разбор</p>' +
      '<input type="password" name="pass" placeholder="Пароль" autocomplete="current-password" autofocus>' +
      (err ? '<p class="f-err">Неверный пароль</p>' : '') +
      '<button class="btn primary big" type="submit">Войти</button>' +
      '<a href="#" data-adm="site">← На сайт</a></form></main>';
  }

  function kpi(label, val, note) { return '<div class="kpi"><span>' + label + '</span><b>' + val + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</div>'; }
  function pct(a, b) { return b ? Math.round(a / b * 100) + '%' : '—'; }

  function histogram(results) {
    var bins = [70, 80, 90, 100, 110, 120, 130, 140], cnt = bins.map(function () { return 0; }), max = 1, s = '';
    results.forEach(function (r) { var i = Math.min(bins.length - 1, Math.max(0, Math.floor((r.iq - 70) / 10))); cnt[i]++; });
    cnt.forEach(function (c) { max = Math.max(max, c); });
    cnt.forEach(function (c, i) {
      var h = c / max * 130, x = 20 + i * 70;
      s += box(x, 160 - h, 52, Math.max(h, 2), { rx: 6, fill: bins[i] >= 100 ? COL.violet : '#b9adff' });
      if (c) s += txt(x + 26, 150 - h, c, 14);
      s += txt(x + 26, 178, bins[i] + (i === bins.length - 1 ? '+' : '–' + (bins[i] + 9)), 12, { fill: '#8f8aad', 'font-weight': 700 });
    });
    return svgBox(580, 190, s, 'pic adm-hist');
  }

  function dash() {
    var s = Store.get('stats', {}), res = Store.get('results', []), leads = Store.get('leads', []);
    var visits = s.visits || 0, starts = s.starts || 0, fin = s.finishes || 0, nl = s.leads || 0, shares = s.shares || 0;
    var avg = res.length ? Math.round(res.reduce(function (a, r) { return a + r.iq; }, 0) / res.length) : '—';
    var secAvg = [0, 0, 0, 0, 0];
    res.forEach(function (r) { (r.secs || []).forEach(function (v, i) { secAvg[i] += v; }); });
    secAvg = secAvg.map(function (v) { return res.length ? Math.round(v / res.length) : 0; });

    var funnel = [['Посетили сайт', visits], ['Начали тест', starts], ['Прошли до конца', fin], ['Оставили контакт', nl]];
    var fmax = Math.max(1, visits, starts, fin, nl);
    var funnelHtml = funnel.map(function (f, i) {
      return '<div class="fn"><span>' + f[0] + '</span><div class="fn-bar"><i style="width:' + Math.max(2, f[1] / fmax * 100) + '%"></i></div><b>' + f[1] + '</b>' +
        (i ? '<small>' + pct(f[1], funnel[i - 1][1]) + ' от пред.</small>' : '<small>&nbsp;</small>') + '</div>';
    }).join('');

    var secHtml = SECTIONS.map(function (sec, i) {
      return '<div class="sb"><div class="sb-top"><span>' + sec.icon + ' ' + sec.name + '</span><b>' + secAvg[i] + '%</b></div><div class="sb-bar"><i class="mid" style="width:' + Math.max(2, secAvg[i]) + '%"></i></div></div>';
    }).join('');

    var rows = leads.slice().reverse().map(function (l) {
      return '<tr><td>' + dt(l.t) + '</td><td>' + esc(l.name) + '</td><td><a href="tel:' + esc(String(l.phone).replace(/[^\d+]/g, '')) + '">' + esc(l.phone) + '</a></td><td>' + esc(l.email) + '</td><td>' + esc(l.age) + '</td><td>' + esc(l.city) + '</td><td><b>' + esc(l.iq) + '</b></td><td>' + (l.ads ? '✅ да' : '—') + '</td></tr>';
    }).join('');

    root.innerHTML = '<header class="topbar adm-top"><div class="wrap tb-row"><div class="logo"><span>IQ<i>·</i>Квест</span><em class="adm-badge">панель владельца</em></div>' +
      '<nav class="nav"><a href="#" data-adm="site">На сайт</a><button class="btn ghost sm" data-adm="logout">Выйти</button></nav></div></header>' +
      '<main class="wrap adm">' +
      '<div class="adm-note">Демо-версия: данные хранятся только в этом браузере. В рабочей версии всё будет собираться на сервере со всех посетителей.</div>' +
      '<div class="kpis">' + kpi('Посетители', visits) + kpi('Начали тест', starts, pct(starts, visits) + ' посетителей') + kpi('Прошли тест', fin, pct(fin, starts) + ' начавших') +
      kpi('Оставили контакт', nl, pct(nl, fin) + ' прошедших') + kpi('Поделились', shares) + kpi('Средний IQ', avg, res.length + ' результатов') + '</div>' +
      '<div class="adm-grid"><section class="card"><h2>Воронка</h2>' + funnelHtml + '</section>' +
      '<section class="card"><h2>Распределение IQ</h2>' + (res.length ? histogram(res) : '<p class="muted">Пока нет пройденных тестов.</p>') + '</section></div>' +
      '<section class="card"><h2>Средний результат по разделам</h2>' + (res.length ? secHtml : '<p class="muted">Пока нет данных.</p>') + '</section>' +
      '<section class="card"><div class="adm-head"><h2>Заявки на разбор <span class="count">' + leads.length + '</span></h2><div class="adm-btns">' +
      '<button class="btn primary sm" data-adm="csv"' + (leads.length ? '' : ' disabled') + '>⬇ Скачать для Excel</button>' +
      '<button class="btn ghost sm" data-adm="sample">+ Примеры для показа</button><button class="btn ghost sm danger" data-adm="clear">Очистить всё</button></div></div>' +
      (leads.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дата</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Возраст</th><th>Город</th><th>IQ</th><th>Рассылка</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<p class="muted">Заявок пока нет. Пройдите тест и заполните форму разбора — заявка появится здесь. Или нажмите «Примеры для показа».</p>') +
      '</section></main>';
  }

  function csv() {
    var leads = Store.get('leads', []);
    var q = function (v) { return '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"'; };
    var lines = [['Дата', 'Имя', 'Телефон', 'Email', 'Возраст', 'Город', 'IQ', 'Верных из 30', 'Согласие на рассылку'].map(q).join(';')];
    leads.forEach(function (l) { lines.push([dt(l.t), l.name, l.phone, l.email, l.age, l.city, l.iq, l.correct, l.ads ? 'да' : 'нет'].map(q).join(';')); });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'zayavki-iq-test.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 1000);
  }

  function samples() {
    var names = ['Анна', 'Игорь', 'Мария', 'Дмитрий', 'Ольга', 'Сергей', 'Екатерина', 'Алексей'];
    var cities = ['Москва', 'Казань', 'Самара', 'Екатеринбург', 'Новосибирск', 'Краснодар', 'Пермь', 'Тула'];
    var now = Date.now(), i, iq, secs, res = Store.get('results', []), leads = Store.get('leads', []), s = Store.get('stats', {});
    function gauss() { return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.7; }
    for (i = 0; i < 40; i++) {
      iq = Math.max(72, Math.min(146, Math.round(104 + gauss() * 14)));
      secs = [0, 0, 0, 0, 0].map(function () { return Math.max(5, Math.min(100, Math.round(48 + (iq - 100) * 1.2 + gauss() * 12))); });
      res.push({ t: now - i * 3600e3 * 5, iq: iq, correct: Math.max(4, Math.min(30, Math.round(14 + (iq - 100) * 0.36))), time: 900 + Math.round(Math.random() * 500), secs: secs, sample: true });
      if (i < 8) leads.push({ t: now - i * 3600e3 * 7, name: names[i] + ' (пример)', phone: '+7 (900) 000-00-0' + i, email: 'primer' + (i + 1) + '@example.ru', age: 19 + Math.round(Math.random() * 40), city: cities[i], ads: i % 3 !== 0, iq: iq, correct: Math.max(4, Math.min(30, Math.round(14 + (iq - 100) * 0.36))), secs: secs, sample: true });
    }
    s.visits = (s.visits || 0) + 160; s.starts = (s.starts || 0) + 70; s.finishes = (s.finishes || 0) + 40; s.leads = (s.leads || 0) + 8; s.shares = (s.shares || 0) + 11;
    leads.sort(function (a, b) { return a.t - b.t; });
    Store.set('results', res); Store.set('leads', leads); Store.set('stats', s);
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('submit', function (e) {
      if (e.target.id !== 'admLogin') return;
      e.preventDefault();
      if (hash(e.target.elements.pass.value) === PASS_HASH) { Store.session('admin', '1'); dash(); } else login(true);
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-adm]');
      if (!b || location.hash !== '#admin') return;
      e.preventDefault();
      var a = b.getAttribute('data-adm');
      if (a === 'site') location.hash = '';
      else if (a === 'logout') { Store.session('admin', '0'); login(); }
      else if (a === 'csv') csv();
      else if (a === 'sample') { samples(); dash(); }
      else if (a === 'clear') {
        if (window.confirm('Удалить всю статистику и заявки из этого браузера?')) { ['stats', 'results', 'leads', 'last'].forEach(Store.del); dash(); }
      }
    });
  }

  return { render: render };
})();
