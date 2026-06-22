// shared page script: reading-progress bar + EN/KO language toggle (default = EN)
(function () {
  var bar = document.getElementById('bar');
  function upd() {
    if (!bar) return;
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = Math.min(100, Math.max(0, p || 0)) + '%';
  }
  document.addEventListener('scroll', upd, { passive: true });
  upd();

  var KEY = 'paper-lang';
  function setLang(l) {
    var ko = (l === 'ko');
    document.body.classList.toggle('lang-ko', ko);
    document.documentElement.setAttribute('lang', ko ? 'ko' : 'en');
    var btns = document.querySelectorAll('.langbtn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('on', btns[i].getAttribute('data-l') === l);
    }
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setLang(saved === 'ko' ? 'ko' : 'en');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.langbtn');
    if (b) setLang(b.getAttribute('data-l'));
  });
})();

// per-paper reader rating (1=not interested … 4=must read), saved in localStorage
(function () {
  var box = document.querySelector('.rating[data-arxiv]');
  if (!box) return;
  var KEY = 'paper-rating:' + box.getAttribute('data-arxiv');
  var rates = box.querySelectorAll('.rate');
  function paint(v) {
    for (var i = 0; i < rates.length; i++) {
      rates[i].classList.toggle('on', rates[i].getAttribute('data-v') === v);
    }
    box.classList.toggle('rated', !!v);
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  paint(saved);
  for (var i = 0; i < rates.length; i++) {
    rates[i].addEventListener('click', function () {
      var v = this.getAttribute('data-v');
      try { localStorage.setItem(KEY, v); } catch (e) {}
      paint(v);
    });
  }
})();

// personal notes: select text → write a private note. Saved per-paper in localStorage (this device only).
(function () {
  var aEl = document.querySelector('a[href*="arxiv.org/abs/"]');
  var arxivId = aEl ? ((aEl.getAttribute('href').match(/abs\/([0-9.]+)/) || [])[1] || '') : '';
  if (!arxivId) return;
  var KEY = 'paper-notes:' + arxivId;
  var blocks = [].slice.call(document.querySelectorAll('main p, main li, .tldr p, .lead, figcaption, .cap'));
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {} }
  var notes = load();
  var lastSel = null, pop = null;

  // selection bubble
  var bubble = document.createElement('button');
  bubble.className = 'notebubble'; bubble.textContent = '📝 Add note'; bubble.style.display = 'none';
  bubble.addEventListener('mousedown', function (e) { e.preventDefault(); });
  bubble.addEventListener('click', function () { if (lastSel) openEditor(null, lastSel); bubble.style.display = 'none'; });
  document.body.appendChild(bubble);

  document.addEventListener('selectionchange', function () {
    if (pop) return;
    var s = window.getSelection(); var t = s ? s.toString().trim() : '';
    if (t.length > 2 && s.rangeCount) {
      var node = s.getRangeAt(0).startContainer;
      var blk = node.nodeType === 3 ? node.parentElement : node;
      while (blk && blocks.indexOf(blk) < 0) blk = blk.parentElement;
      if (blk) {
        lastSel = { blockIndex: blocks.indexOf(blk), quote: t };
        var r = s.getRangeAt(0).getBoundingClientRect();
        bubble.style.display = 'block';
        bubble.style.top = (window.scrollY + r.top - 44) + 'px';
        bubble.style.left = (window.scrollX + Math.max(8, Math.min(r.left, window.innerWidth - 130))) + 'px';
        return;
      }
    }
    bubble.style.display = 'none';
  });
  document.addEventListener('scroll', function () { bubble.style.display = 'none'; }, { passive: true });

  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openEditor(existing, sel) {
    closePop();
    var blockIndex = existing ? existing.blockIndex : sel.blockIndex;
    var quote = existing ? existing.quote : sel.quote;
    var blk = blocks[blockIndex]; if (!blk) return;
    pop = document.createElement('div'); pop.className = 'notepop';
    pop.innerHTML = '<div class="q"></div><textarea placeholder="내 메모 · my note…"></textarea><div class="row"></div>';
    pop.querySelector('.q').textContent = '“' + quote + '”';
    var ta = pop.querySelector('textarea'); ta.value = existing ? existing.text : '';
    var row = pop.querySelector('.row');
    if (existing) {
      var del = document.createElement('button'); del.className = 'del'; del.textContent = '삭제';
      del.onclick = function () { notes = notes.filter(function (x) { return x.id !== existing.id; }); save(); render(); closePop(); };
      row.appendChild(del);
    }
    var cancel = document.createElement('button'); cancel.textContent = '취소'; cancel.onclick = closePop; row.appendChild(cancel);
    var saveb = document.createElement('button'); saveb.className = 'save'; saveb.textContent = '저장'; row.appendChild(saveb);
    saveb.onclick = function () {
      var text = ta.value.trim();
      if (existing) { existing.text = text; if (!text) notes = notes.filter(function (x) { return x.id !== existing.id; }); }
      else if (text) { notes.push({ id: 'n' + Date.now() + Math.floor(Math.random() * 999), blockIndex: blockIndex, quote: quote, text: text }); }
      save(); render(); closePop();
    };
    document.body.appendChild(pop);
    var r = blk.getBoundingClientRect();
    pop.style.top = (window.scrollY + r.bottom + 6) + 'px';
    pop.style.left = (window.scrollX + Math.max(8, Math.min(r.left, window.innerWidth - 330))) + 'px';
    ta.focus();
  }
  document.addEventListener('mousedown', function (e) { if (pop && !pop.contains(e.target)) closePop(); }, true);

  function clearMarks() {
    [].slice.call(document.querySelectorAll('mark.unote, .notebadge')).forEach(function (m) {
      if (m.classList.contains('notebadge')) { m.remove(); return; }
      var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); if (p.normalize) p.normalize();
    });
  }
  function wrapQuote(blk, quote, id) {
    var walker = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT, null);
    var tn;
    while ((tn = walker.nextNode())) {
      var i = tn.nodeValue.indexOf(quote);
      if (i >= 0) {
        var range = document.createRange(); range.setStart(tn, i); range.setEnd(tn, i + quote.length);
        var mk = document.createElement('mark'); mk.className = 'unote'; mk.setAttribute('data-id', id);
        try { range.surroundContents(mk); return mk; } catch (e) { return null; }
      }
    }
    return null;
  }
  var fab = document.createElement('button'); fab.className = 'notesfab';
  fab.innerHTML = '📝 <span class="t-en">Notes</span><span class="t-ko">메모</span> <span class="ct">0</span>';
  fab.addEventListener('click', function () { var f = document.querySelector('mark.unote, .notebadge'); if (f) f.scrollIntoView({ block: 'center' }); });
  document.body.appendChild(fab);

  function render() {
    clearMarks();
    notes.forEach(function (n) {
      var blk = blocks[n.blockIndex]; if (!blk) return;
      var mk = wrapQuote(blk, n.quote, n.id);
      if (mk) { mk.addEventListener('click', function (e) { e.stopPropagation(); openEditor(n); }); }
      else {
        var b = document.createElement('span'); b.className = 'notebadge'; b.textContent = '📝'; b.setAttribute('data-id', n.id);
        b.addEventListener('click', function (e) { e.stopPropagation(); openEditor(n); }); blk.appendChild(b);
      }
    });
    fab.querySelector('.ct').textContent = notes.length;
  }
  render();
})();

// archive index tabs: All (hides "Not interested") / Must Read / Not interested. Ratings live in localStorage (this device).
(function () {
  var tabs = document.querySelector('.tabs');
  var list = document.querySelector('.list');
  if (!tabs || !list) return;
  var rows = [].slice.call(list.querySelectorAll('.rowwrap'));
  var empties = {
    mustread: document.querySelector('.mr-empty'),
    hidden: document.querySelector('.ni-empty')
  };
  function rating(ax) { try { return localStorage.getItem('paper-rating:' + ax); } catch (e) { return null; } }
  function shownIn(mode, r) {
    var rt = rating(r.getAttribute('data-arxiv'));
    if (mode === 'mustread') return rt === '4' || r.getAttribute('data-full') === '1';
    if (mode === 'hidden') return rt === '1';            // "Not interested" bucket
    return rt !== '1';                                    // 'all' = everything except Not interested
  }
  function apply(mode) {
    var n = 0;
    rows.forEach(function (r) {
      var show = shownIn(mode, r);
      r.style.display = show ? '' : 'none';
      if (show) n++;
    });
    [].slice.call(tabs.querySelectorAll('.tab')).forEach(function (t) {
      t.classList.toggle('on', t.getAttribute('data-mode') === mode);
    });
    Object.keys(empties).forEach(function (k) {
      if (empties[k]) empties[k].style.display = (mode === k && n === 0) ? 'block' : 'none';
    });
  }
  [].slice.call(tabs.querySelectorAll('.tab')).forEach(function (t) {
    t.addEventListener('click', function () { apply(t.getAttribute('data-mode')); });
  });
  apply('all');
})();

