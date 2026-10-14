/* IQ·Квест — хранилище демо-версии.
   Всё лежит в localStorage этого браузера. В рабочей версии эти функции
   будут отправлять данные на сервер (российский хостинг). */
var Store = (function () {
  var P = 'iqq_';

  function get(key, def) {
    try {
      var v = localStorage.getItem(P + key);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  }

  function set(key, val) {
    try { localStorage.setItem(P + key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  function del(key) {
    try { localStorage.removeItem(P + key); } catch (e) { /* нет доступа — не страшно */ }
  }

  // счётчики воронки: visits, starts, finishes, leads, shares
  function bump(name) {
    var s = get('stats', {});
    s[name] = (s[name] || 0) + 1;
    set('stats', s);
  }

  function push(key, item, cap) {
    var a = get(key, []);
    a.push(item);
    if (a.length > cap) a = a.slice(a.length - cap);
    set(key, a);
  }

  function session(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(P + key);
      sessionStorage.setItem(P + key, val);
    } catch (e) { return null; }
    return null;
  }

  return { get: get, set: set, del: del, bump: bump, push: push, session: session };
})();
