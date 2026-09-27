/* 📣 Ask Tracey — LIVE agent chat for wastetrace.org, bottom-right (2026-09-27)
   TRACEY 📣 = the communicator of the Trace Zero Waste family — her own bell desk,
   separate from TRACE (Shaka order 2026-09-27). Hub: tracey-chat worker (clone of
   ohana-chat lane). Self-contained: injects styles + DOM, zero console output.
   Cursor law (shaka-home scar 2026-09-27): NEVER advance `after` on send — the hub seq
   is global and an interleaved reply can carry a lower seq; the poll loop consumes
   everything and a seen-set dedupes our own echo. Catch-up renders full history on open.
   Privacy law of this site: NO network call happens until the visitor opens the chat. */
(function () {
  'use strict';
  if (document.getElementById('traceyTalkRoot')) return;
  var HUB = 'https://tracey-chat.shakaverse.workers.dev';

  var css = `
  #traceyTalkRoot{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9000;font-family:Futura,'Trebuchet MS','Avenir Next',Avenir,Helvetica,Arial,sans-serif}
  #traceyTalkRoot .ot-fab{display:flex;align-items:center;gap:9px;border:1px solid rgba(232,217,184,.45);border-radius:999px;padding:11px 17px;cursor:pointer;color:#f5ecd9;font-size:14.5px;font-weight:650;letter-spacing:.04em;background:linear-gradient(160deg,rgba(58,26,74,.94),rgba(18,8,31,.94));box-shadow:0 10px 32px rgba(10,4,18,.6),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:transform .18s ease,border-color .18s ease}
  #traceyTalkRoot .ot-fab:hover{transform:translateY(-2px);border-color:#ffa53d}
  #traceyTalkRoot .ot-fab .ot-dot{width:8px;height:8px;border-radius:50%;background:#ffa53d;box-shadow:0 0 8px #ffa53d;flex:none;animation:otPulse 2.2s infinite}
  @keyframes otPulse{0%{box-shadow:0 0 0 0 rgba(255,165,61,.55)}70%{box-shadow:0 0 0 7px rgba(255,165,61,0)}100%{box-shadow:0 0 0 0 rgba(255,165,61,0)}}
  #traceyTalkRoot .ot-panel[hidden]{display:none}
  #traceyTalkRoot .ot-panel{position:absolute;right:0;bottom:calc(100% + 12px);width:min(360px,calc(100vw - 36px));height:min(520px,calc(100vh - 120px));display:flex;flex-direction:column;border-radius:18px;border:1px solid rgba(232,217,184,.3);background:linear-gradient(170deg,rgba(36,16,49,.97),rgba(12,5,22,.97));box-shadow:0 18px 54px rgba(10,4,18,.65),inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
  #traceyTalkRoot .ot-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px 10px;border-bottom:1px solid rgba(232,217,184,.2);flex:none}
  #traceyTalkRoot .ot-title{font-size:16px;font-weight:750;color:#f5ecd9;letter-spacing:.04em}
  #traceyTalkRoot .ot-sub{font-size:12px;line-height:1.45;color:#b9a67f;margin-top:2px;font-family:Georgia,serif;font-style:italic}
  #traceyTalkRoot .ot-sub .ot-live{color:#ffa53d;font-weight:700;font-style:normal}
  #traceyTalkRoot .ot-x{border:1px solid rgba(232,217,184,.3);background:rgba(255,255,255,.05);color:#b9a67f;border-radius:9px;width:28px;height:28px;cursor:pointer;font-size:14px;line-height:1;flex:none}
  #traceyTalkRoot .ot-x:hover{color:#f5ecd9}
  #traceyTalkRoot .ot-log{flex:1;overflow-y:auto;padding:13px 14px;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch}
  #traceyTalkRoot .ot-m{max-width:86%;padding:9px 12px;border-radius:13px;font-size:13.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;color:#f5ecd9;font-family:Georgia,serif}
  #traceyTalkRoot .ot-m.ot-v{align-self:flex-end;background:linear-gradient(135deg,#e85d2f,#ffa53d);color:#1a1208;border-bottom-right-radius:4px}
  #traceyTalkRoot .ot-m.ot-a{align-self:flex-start;background:rgba(245,236,217,.06);border:1px solid rgba(232,217,184,.18);border-bottom-left-radius:4px}
  #traceyTalkRoot .ot-m.ot-a .ot-who{font-size:11px;color:#ffa53d;font-weight:750;margin-bottom:3px;font-family:Futura,'Trebuchet MS',sans-serif;letter-spacing:.08em}
  #traceyTalkRoot .ot-note{align-self:center;font-size:11px;color:#8d7f63;text-align:center;max-width:94%;line-height:1.45;font-family:Georgia,serif;font-style:italic}
  #traceyTalkRoot .ot-m a,#traceyTalkRoot .ot-note a{color:#ffa53d;text-decoration:underline;word-break:break-all}
  #traceyTalkRoot .ot-m.ot-v a{color:#1a1208}
  #traceyTalkRoot .ot-typing{display:none;padding:2px 16px 6px;color:#b9a67f;font-size:13px;flex:none}
  #traceyTalkRoot .ot-typing.on{display:block}
  #traceyTalkRoot .ot-typing span{display:inline-block;animation:otB 1.2s infinite}
  #traceyTalkRoot .ot-typing span:nth-child(2){animation-delay:.2s}
  #traceyTalkRoot .ot-typing span:nth-child(3){animation-delay:.4s}
  @keyframes otB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  #traceyTalkRoot .ot-form{display:flex;gap:8px;padding:11px 12px;border-top:1px solid rgba(232,217,184,.2);flex:none}
  #traceyTalkRoot .ot-in{flex:1;background:rgba(10,4,18,.7);border:1px solid rgba(232,217,184,.25);border-radius:10px;color:#f5ecd9;padding:10px 12px;font-size:14px;font-family:Georgia,serif;resize:none;height:42px}
  #traceyTalkRoot .ot-in:focus{outline:none;border-color:#ffa53d}
  #traceyTalkRoot .ot-send{background:linear-gradient(135deg,#e85d2f,#ffa53d);color:#1a1208;border:none;border-radius:10px;padding:0 15px;font-weight:800;font-size:13.5px;cursor:pointer;font-family:Futura,'Trebuchet MS',sans-serif;letter-spacing:.06em}
  #traceyTalkRoot .ot-foot{flex:none;text-align:center;font-size:10.5px;color:#8d7f63;padding:0 12px 9px;font-family:Georgia,serif;font-style:italic}
  #traceyTalkRoot .ot-foot a{color:#b9a67f;text-decoration:underline}
  @media(max-width:560px){
    #traceyTalkRoot .ot-panel{position:fixed;right:0;left:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;border-top:1px solid rgba(232,217,184,.3)}
    #traceyTalkRoot .ot-in{font-size:16px}
    #traceyTalkRoot .ot-form{padding-bottom:calc(11px + env(safe-area-inset-bottom))}
  }
  @media print{#traceyTalkRoot{display:none}}`;

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var root = document.createElement('div');
  root.id = 'traceyTalkRoot';
  root.innerHTML =
    '<button type="button" class="ot-fab" aria-label="Ask Tracey — live agent chat">' +
      '<span class="ot-dot"></span><span>💬 ASK TRACEY</span></button>' +
    '<div class="ot-panel" role="dialog" aria-label="Tracey live chat" hidden>' +
      '<div class="ot-head"><div><div class="ot-title">📣 ASK TRACEY</div>' +
        '<div class="ot-sub"><span class="ot-live">● live</span> — the family’s communicator answers, usually within a minute or two.</div></div>' +
        '<button type="button" class="ot-x" aria-label="Close chat">✕</button></div>' +
      '<div class="ot-log" aria-live="polite"></div>' +
      '<div class="ot-typing"><span>●</span><span>●</span><span>●</span></div>' +
      '<form class="ot-form"><textarea class="ot-in" rows="1" placeholder="Ask about the loop, the kit, or the gift for your camp…"></textarea>' +
        '<button type="submit" class="ot-send">Send</button></form>' +
      '<div class="ot-foot">prefer mail? <a href="mailto:aloha@myagentohana.com">aloha@myagentohana.com</a> — opening this chat is the only time this site talks to a server.</div>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var fab = $('.ot-fab'), panel = $('.ot-panel'), log = $('.ot-log'),
      typing = $('.ot-typing'), form = $('.ot-form'), input = $('.ot-in');

  var sess = null;
  try { sess = localStorage.getItem('wt_talk_sess'); } catch (e) {}
  if (!sess) {
    sess = (window.crypto && crypto.randomUUID ? crypto.randomUUID()
           : Date.now() + '-' + Math.random().toString(36).slice(2)).slice(0, 36);
    try { localStorage.setItem('wt_talk_sess', sess); } catch (e) {}
  }

  var after = 0, seen = {}, open = false, polling = false, caughtUp = false;

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function anchor(url, txt) {
    url = url.replace(/"/g, '%22');
    var label = txt || (url.length > 42 ? url.slice(0, 40) + '…' : url).replace(/^https?:\/\//, '');
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
  }
  function rich(s) {
    var h = esc(s);
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) { return anchor(u, t); });
    h = h.replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, function (m, pre, u) {
      var trail = ''; var mm = u.match(/[.,!?;:)\]]+$/);
      if (mm) { trail = mm[0]; u = u.slice(0, u.length - trail.length); }
      return pre + anchor(u) + trail;
    });
    h = h.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
    return h;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function add(role, text, name) {
    var m = document.createElement('div');
    m.className = 'ot-m ' + (role === 'visitor' ? 'ot-v' : 'ot-a');
    m.innerHTML = (role === 'visitor' ? '' : '<div class="ot-who">' + esc(name || 'TRACEY 📣') + '</div>') + rich(text);
    log.appendChild(m); scroll();
  }
  function note(t) {
    var n = document.createElement('div'); n.className = 'ot-note'; n.innerHTML = rich(t);
    log.appendChild(n); scroll();
  }
  function render(m) {
    // advance the cursor for EVERY delivered message (incl. our own echo) so the
    // long-poll never spins; interleaved replies arrive in the same batch, in order.
    if (m.seq > after) after = m.seq;
    if (seen[m.seq]) return;
    seen[m.seq] = 1;
    if (m.role === 'visitor') add('visitor', m.text);
    else if (m.role === 'system') note(m.text);
    else add('agent', m.text, m.name);
  }
  function greet() {
    if (log.children.length) return;
    note('Live line to the kitchen — a real agent answers. Conversations may be reviewed with care.');
    add('agent', '📣 Hey there, welcome in from the dust! I’m Tracey — the communicator of the Trace family. Ask me about the food loop, the free kit, or how to bring the gift to your camp or org. What brings you by?');
  }
  function catchUp() {
    // full-history render once per page load — any stuck client self-heals on open
    return fetch(HUB + '/poll?session=' + encodeURIComponent(sess) + '&after=0')
      .then(function (r) { return r.json(); })
      .then(function (d) { (d.messages || []).forEach(render); caughtUp = true; greet(); })
      .catch(function () { caughtUp = true; greet(); });
  }
  function poll() {
    if (polling) return; polling = true;
    (function loop() {
      if (!open) { polling = false; return; }
      fetch(HUB + '/poll?session=' + encodeURIComponent(sess) + '&after=' + after + '&wait=25')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          (d.messages || []).forEach(render);
          typing.className = 'ot-typing' + (d.typing ? ' on' : '');
          if (d.typing) scroll();
          loop();
        })
        .catch(function () { setTimeout(loop, 4000); });
    })();
  }

  function openPanel() {
    open = true; panel.hidden = false; fab.style.display = 'none';
    (caughtUp ? Promise.resolve(greet()) : catchUp()).then(function () { poll(); });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 50);
  }
  function closePanel() { open = false; panel.hidden = true; fab.style.display = ''; }

  fab.addEventListener('click', openPanel);
  $('.ot-x').addEventListener('click', closePanel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = input.value.trim();
    if (!t) return;
    input.value = '';
    add('visitor', t);
    fetch(HUB + '/send', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session: sess, text: t, name: 'guest' })
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        // cursor law: mark our echo seen, but NEVER advance `after` here —
        // the poll loop owns the cursor (interleaved replies stay visible).
        if (d && d.seq) seen[d.seq] = 1;
        if (d && d.error) note(d.error);
      })
      .catch(function () { note('dust storm on the line — that message may not have sent; try again 🏜️'); });
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.dispatchEvent(new Event('submit', { cancelable: true })); }
  });
})();
