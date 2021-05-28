!(function (i, n) {
  'use strict';
  'object' == typeof module && 'object' == typeof module.exports
    ? (module.exports = n())
    : 'function' == typeof define && define.amd
    ? define([], function () {
        return (i.returnExportsGlobal = n());
      })
    : (i.gbmsg = n());
})(this, function () {
  function i() {
    var i = document.createElement('div');
    (i.id = 'GBMsg'),
      (i.className = 'gbmsg-overlay'),
      (i.innerHTML = '<div class="gbmsg-dialog"></div>'),
      g.appendChild(i),
      (r = document.getElementById('GBMsg')),
      (m = r.firstElementChild || r.children[0]);
  }
  function n(i, n, o) {
    var i = i,
      n = n,
      o = o || {},
      s = o.timeout || 1,
      e = [],
      c = '',
      t = o.iconClass;
    t &&
      (e.push('<div class="gbmsg-dialog-icon">'),
      e.push('<i class="' + t + '"></i>'),
      e.push('</div>')),
      n
        ? (e.push('<div class="gbmsg-dialog-container">'),
          e.push('<h5 class="gbmsg-dialog-title">' + i + '</h5>'))
        : ((n = i), (c = '<div class="gbmsg-dialog-container">')),
      n ? e.push(c + '<div class="gbmsg-dialog-content">' + n + '</div>') : '',
      e.push('</div></div>'),
      (m.innerHTML = e.join('')),
      (r.style.display = 'block'),
      s &&
        s < 100 &&
        (f && clearTimeout(f),
        (f = setTimeout(function () {
          (r.style.display = 'none'), (f = null);
        }, 1000 * s)));
  }
  function o(i, o) {
    n(i, o, { iconClass: 'icono-checkCircle' });
  }
  function s(i, o) {
    n(i, o, { iconClass: 'icono-crossCircle' });
  }
  function e(i, o) {
    n(i, o, { iconClass: 'icono-exclamationCircle' });
  }
  function c(i, o) {
    n(i, o, { iconClass: 'icono-clock', timeout: 100 });
  }
  function t(i, o) {
    n(i, o, { iconClass: 'icono-reset', timeout: 100 });
  }
  function l(i, o) {
    n(i, o, { iconClass: 'icono-frown' });
  }
  function a(i, o) {
    n(i, o, { iconClass: 'icono-smile' });
  }
  function u(i, o) {
    n(i, o);
  }
  function d() {
    f && clearTimeout(f), (r.style.display = 'none'), (f = null);
  }
  var r,
    m,
    f,
    g = document.body;
  return (
    i(),
    {
      success: o,
      failure: s,
      info: e,
      waitting: c,
      loading: t,
      frown: l,
      smile: a,
      hide: d,
      show: u,
    }
  );
});
