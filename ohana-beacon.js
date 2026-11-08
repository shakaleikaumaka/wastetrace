/*! ʻohana beacon bar v1 — MODEL LAW v3 (8 Nov 2026)
 * Shows which brain a chat desk is thinking on: "🧠 now thinking on: <model> · <tier>"
 * Usage: <script defer src="/ohana-beacon.js" data-hub="shaka" data-anchor="#chatPanel" data-place="append"></script>
 *   data-hub    = desk id in models.json (shaka, ohana, jai, terri, ijlove, globy, spector, tracey, komoro, kprot, tele, vlog, oso, crops)
 *   data-anchor = CSS selector of the chat panel (bar goes under it); waits up to 20 s for lazy widgets
 *   data-place  = append (last child, default) | after (next sibling)
 * Never breaks the chat: self-contained, try/catch everywhere, no globals except window.__ohanaBeacon.
 */
(function () {
  try {
    if (window.__ohanaBeacon) return;
    window.__ohanaBeacon = 1;
    var me = document.currentScript || document.querySelector('script[src*="ohana-beacon.js"]');
    if (!me) return;
    var HUB = me.getAttribute('data-hub') || '';
    var ANCHOR = me.getAttribute('data-anchor') || '';
    var PLACE = me.getAttribute('data-place') || 'append';
    var SRC = [];
    if (location.hostname === 'myagentohana.com' || location.hostname === 'www.myagentohana.com') SRC.push('/beacon/models.json');
    SRC.push('https://myagentohana.com/beacon/models.json');           // GitHub Pages behind a custom domain (GFW-friendlier than workers.dev)
    SRC.push('https://cdn.jsdelivr.net/gh/shakaleikaumaka/my-agent-ohana@gh-pages/beacon/models.json'); // CDN fallback (reachable from mainland China)
    if (/\.taur\.link$/.test(location.hostname)) SRC.push('https://ohana-beacon-u7z2obu673-ffieyo32.taur.link/models.json'); // live daemon copy
    var TIER = { deep: 'deep thought', build: 'builder', watch: 'watch desk' };

    var css = '.ohb-bar[hidden]{display:none!important}' +
      '.ohb-bar{display:flex;align-items:center;gap:.45em;box-sizing:border-box;width:100%;margin:0;padding:3px 10px;' +
      'font:500 11px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;color:#cfe9ff;' +
      'background:rgba(8,18,36,.82);border-top:1px solid rgba(120,200,255,.25);border-radius:0 0 10px 10px;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;z-index:1}' +
      '.ohb-dot{flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#53e0a1;box-shadow:0 0 0 0 rgba(83,224,161,.7);animation:ohb-p 2s infinite}' +
      '.ohb-bar[data-state="fallback"] .ohb-dot,.ohb-bar[data-state="switching"] .ohb-dot{background:#ffc04d;box-shadow:0 0 0 0 rgba(255,192,77,.7)}' +
      '.ohb-bar[data-state="unknown"] .ohb-dot{background:#9aa7b8;animation:none}' +
      '.ohb-txt{overflow:hidden;text-overflow:ellipsis}' +
      '@keyframes ohb-p{0%{box-shadow:0 0 0 0 rgba(83,224,161,.6)}70%{box-shadow:0 0 0 6px rgba(83,224,161,0)}100%{box-shadow:0 0 0 0 rgba(83,224,161,0)}}' +
      '@media (prefers-reduced-motion:reduce){.ohb-dot{animation:none}}';

    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

    var bar = el('div', 'ohb-bar');
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('data-state', 'unknown');
    var dot = el('span', 'ohb-dot'); dot.setAttribute('aria-hidden', 'true');
    var txt = el('span', 'ohb-txt'); txt.textContent = '🧠 model status unknown';
    bar.appendChild(dot); bar.appendChild(txt);

    function set(d) {
      try {
        var x = d && d.desks && d.desks[HUB];
        if (!x || !x.label) { bar.setAttribute('data-state', 'unknown'); txt.textContent = '🧠 model status unknown'; return; }
        var st = x.state || 'home';
        bar.setAttribute('data-state', st);
        var tail = st === 'fallback' ? ' · backup brain' : (st === 'switching' ? ' · switching' : '');
        txt.textContent = '🧠 now thinking on: ' + x.label + ' · ' + (TIER[x.tier] || x.tier || 'desk') + tail;
        bar.title = 'ʻohana beacon · updated ' + (d.updated_at || '?');
      } catch (e) {}
    }

    function load(i) {
      if (i >= SRC.length || !window.fetch) { set(null); return; }
      var ctl = window.AbortController ? new AbortController() : null;
      var t = setTimeout(function () { try { ctl && ctl.abort(); } catch (e) {} }, 6000);
      var u = SRC[i] + (SRC[i].indexOf('?') < 0 ? '?' : '&') + 't=' + Math.floor(Date.now() / 60000);
      fetch(u, { cache: 'no-store', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { clearTimeout(t); if (!d || !d.desks) throw 0; set(d); })
        .catch(function () { clearTimeout(t); load(i + 1); });
    }

    function mount(tries) {
      try {
        var a = ANCHOR ? document.querySelector(ANCHOR) : null;
        if (!a) { if (tries < 40) setTimeout(function () { mount(tries + 1); }, 500); return; }
        var s = el('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s);
        if (PLACE === 'after' && a.parentNode) a.parentNode.insertBefore(bar, a.nextSibling); else a.appendChild(bar);
        load(0);
        setInterval(function () { if (!document.hidden) load(0); }, 5 * 60 * 1000);
      } catch (e) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(0); });
    else mount(0);
  } catch (e) {}
})();
