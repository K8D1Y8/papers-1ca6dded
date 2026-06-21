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
