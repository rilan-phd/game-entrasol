// Helper navigasi lintas halaman.
// Dipakai oleh game.js untuk berpindah ke halaman berikutnya.
function navigateTo(url) {
  window.location.href = url;
}

// Pindah halaman tanpa menyisakan halaman asal di riwayat.
function replaceTo(url) {
  window.location.replace(url);
}

// Cegah pemain kembali ke halaman game setelah sesi selesai.
(function () {
  const isGamePage = /\/game-[123]\//.test(window.location.pathname);
  const isSessionDone =
    sessionStorage.getItem('entrasol_tab_session_done') === '1';

  if (isGamePage && isSessionDone) {
    const path = window.location.pathname;
    const basePath = path.replace(/game-[123]\/.*$/, '');

    window.location.replace(basePath + 'result.html');
  }
})();

/* ==========================================================================
   Halaman Result (result.html)
   ========================================================================== */

var RESULT_MAX = 100;
var CONFETTI_COUNT = 40;
var CONFETTI_COLORS = ['#141A8C', '#8BC34A', '#A7D8F0', '#E8B339'];

// Hitung ulang total dari tiga skor game.
function normalizeResult(score) {
  var flip = score.memoryFlip;
  var recall = score.memoryRecall;
  var mem = score.memorize;
  return {
    memoryFlip: flip,
    memoryRecall: recall,
    memorize: mem,
    total: flip + recall + mem
  };
}

// Snapshot per tab -> sesi selesai (buat snapshot) -> null (tidak ada hasil).
function loadResult() {
  var snap = getResultSnapshot();
  if (snap) return normalizeResult(snap);
  if (!isSessionFinished()) return null;
  var result = normalizeResult(getScore());
  saveResultSnapshot(result);
  markSessionDone();
  return result;
}

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function launchConfetti(container) {
  if (!container || container.childNodes.length > 0) return;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < CONFETTI_COUNT; i++) {
    var piece = document.createElement('i');
    piece.className = 'result-confetti__piece';
    var size = 6 + Math.random() * 4;
    piece.style.left = (Math.random() * 100).toFixed(1) + '%';
    piece.style.width = size.toFixed(1) + 'px';
    piece.style.height = (size * (1 + Math.random())).toFixed(1) + 'px';
    piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDuration = (3 + Math.random() * 2).toFixed(2) + 's';
    piece.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    piece.style.setProperty('--spin', Math.floor(180 + Math.random() * 540) + 'deg');
    frag.appendChild(piece);
  }
  container.appendChild(frag);
}

function renderResult(score) {
  var win = score.total === RESULT_MAX;
  var icon = document.getElementById('resultIcon');
  var title = document.getElementById('resultTitle');
  var sub = document.getElementById('resultSubtitle');
  var confetti = document.getElementById('resultConfetti');

  if (win) {
    icon.src = 'assets/confetti-cone.png';
    icon.alt = 'Ikon perayaan kemenangan';
    title.textContent = 'Wow Hebat';
    sub.textContent = 'Kamu berhasil!';
  } else {
    icon.src = 'assets/cancel.png';
    icon.alt = 'Ikon belum beruntung';
    title.textContent = 'Jangan Sedih';
    sub.textContent = 'Yuk coba lagi!';
  }
  sub.classList.toggle('result-subtitle--win', win);
  sub.classList.toggle('result-subtitle--lose', !win);

  // Tampilkan skor masing-masing game
  document.getElementById('scoreFlip').textContent = score.memoryFlip;
  document.getElementById('scoreRecall').textContent = score.memoryRecall;
  document.getElementById('scoreMemorize').textContent = score.memorize;
  document.getElementById('scoreTotal').textContent = score.total;

  // Tentukan status berdasarkan skor maksimal setiap game
  function setGameStatus(elementId, currentScore, maxScore) {
    var element = document.getElementById(elementId);
    var isPerfect = currentScore === maxScore;

    element.textContent = isPerfect ? '✓' : '✕';
    element.classList.toggle('result-item__status--success', isPerfect);
    element.classList.toggle('result-item__status--fail', !isPerfect);

    element.setAttribute(
      'aria-label',
      isPerfect ? 'Poin penuh' : 'Belum mencapai poin penuh'
    );
  }

  setGameStatus('statusFlip', score.memoryFlip, 40);
  setGameStatus('statusRecall', score.memoryRecall, 30);
  setGameStatus('statusMemorize', score.memorize, 30);

  if (confetti) {
    if (win && !prefersReducedMotion()) {
      launchConfetti(confetti);
    } else {
      confetti.innerHTML = '';
    }
  }
}

//ubah back button dari halaman result jadi nampilin poin game 3
function initResultPage() {
  var result = loadResult();

  if (!result) {
    replaceTo('index.html');
    return;
  }

  renderResult(result);

  // Perbarui tampilan jika halaman dipulihkan dari browser cache.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var r = loadResult();
      if (r) renderResult(r);
    }
  });
}


if (typeof document !== 'undefined' && document.getElementById('resultTitle')) {
  initResultPage();
}

// Ekspos untuk lingkungan Node (pengujian); diabaikan di browser.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { navigateTo, replaceTo, normalizeResult };
}
