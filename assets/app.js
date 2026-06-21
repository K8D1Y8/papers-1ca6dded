// shared page script: reading-progress bar + EN/KO language toggle (default = EN)
(function () {
  // reading progress
  var bar = document.getElementById('bar');
  function upd() {
    if (!bar) return;
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = Math.min(100, Math.max(0, p || 0)) + '%';
  }
  document.addEventListener('scroll', upd, { passive: true });
  upd();

  // language toggle — English is the default; KO shown when body.lang-ko
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
  setLang(saved === 'ko' ? 'ko' : 'en'); // default English
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

// "Ask Claude" — select text (or hit the button) to open Claude with the paper context.
// No API key: it opens Claude Desktop via the claude:// deep link and copies the prompt to the clipboard as a fallback.
(function () {
  var paperTitle = (document.title || '').replace(/^5-min paper · /, '').trim();
  var aEl = document.querySelector('a[href*="arxiv.org/abs/"]');
  var arxivId = aEl ? ((aEl.getAttribute('href').match(/abs\/([0-9.]+)/) || [])[1] || '') : '';
  if (!arxivId) return; // only on paper pages
  var lastSel = '';

  function buildPrompt(sel) {
    var ctx = 'I am reading the paper "' + paperTitle + '" (arXiv:' + arxivId + ', https://arxiv.org/abs/' + arxivId + ').';
    return sel
      ? ctx + ' Please explain this part clearly and simply (answer in the language of my question):\n\n"' + sel + '"'
      : ctx + ' I have a question about it:\n\n';
  }
  function ask(sel) {
    var p = buildPrompt(sel);
    try { if (navigator.clipboard) navigator.clipboard.writeText(p); } catch (e) {}
    try { window.location.href = 'claude://claude.ai/new?q=' + encodeURIComponent(p); } catch (e) {}
    toast(document.body.classList.contains('lang-ko')
      ? 'Claude 여는 중 — 안 열리면 claude.ai에서 붙여넣기(⌘V). 프롬프트는 복사됨.'
      : 'Opening Claude — if nothing opens, paste (⌘V) into claude.ai. Prompt copied.');
  }

  var bubble = document.createElement('button');
  bubble.className = 'askbubble';
  bubble.textContent = '🤖 Ask Claude';
  bubble.style.display = 'none';
  bubble.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep the selection
  bubble.addEventListener('click', function () { if (lastSel) ask(lastSel); bubble.style.display = 'none'; });
  document.body.appendChild(bubble);

  document.addEventListener('selectionchange', function () {
    var s = window.getSelection();
    var t = s ? s.toString().trim() : '';
    if (t.length > 3 && s.rangeCount) {
      lastSel = t;
      var r = s.getRangeAt(0).getBoundingClientRect();
      if (r.width || r.height) {
        bubble.style.display = 'block';
        bubble.style.top = (window.scrollY + r.top - 44) + 'px';
        bubble.style.left = (window.scrollX + Math.max(8, Math.min(r.left, window.innerWidth - 140))) + 'px';
      }
    } else {
      bubble.style.display = 'none';
    }
  });
  document.addEventListener('scroll', function () { bubble.style.display = 'none'; }, { passive: true });

  var fab = document.createElement('button');
  fab.className = 'askfab';
  fab.innerHTML = '🤖 <span class="t-en">Ask Claude</span><span class="t-ko">클로드에게 질문</span>';
  fab.addEventListener('click', function () { ask(''); });
  document.body.appendChild(fab);

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'asktoast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 4200);
  }
})();
