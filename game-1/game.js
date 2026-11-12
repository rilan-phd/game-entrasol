/*
 * Memory Flip (game-1) - logika gameplay.
 *
 * Struktur berkas:
 *   1. Konstanta
 *   2. Fungsi murni (tanpa DOM, tanpa localStorage; aman dimuat di Node)
 *   3. State game
 *   4. Ekspos (MemoryFlipLogic + module.exports)
 *   5. Lapisan DOM/timer: init (restore sesi: intro/playing/result),
 *      startGame, tick, finishGame, showResult
 *
 * Tiga tampilan dalam satu halaman: Intro_Screen, Game_Screen, Result_Screen.
 * Selesai main menampilkan Result_Screen; pindah ke game berikutnya hanya
 * saat tombol "Lanjutkan" diklik. Tanpa history.pushState.
 */

/* ------------------------------------------------------------------ */
/* 1. Konstanta                                                        */
/* ------------------------------------------------------------------ */
const TOTAL_PAIRS = 8;
const GAME_SECONDS = 30;
const POINTS_PER_PAIR = 5;
const MISMATCH_DELAY_MS = 800;
const TICK_INTERVAL_MS = 250;
const COUNTDOWN_AT = 3;
const WARNING_THRESHOLD = 10;
const NEXT_PAGE = '../game-2/index.html';

/* ------------------------------------------------------------------ */
/* 2. Fungsi murni                                                     */
/* ------------------------------------------------------------------ */

/** Dek 16 kartu: item 1..8 masing-masing dua kali. Mengembalikan array {id, item}. */
function buildDeck() {
  const deck = [];
  for (let item = 1; item <= TOTAL_PAIRS; item++) {
    deck.push({ id: deck.length, item });
    deck.push({ id: deck.length, item });
  }
  return deck;
}

/** Fisher-Yates. Mengembalikan salinan baru; array asli tidak diubah. */
function shuffle(arr, rand = Math.random) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(rand() * (i + 1));
    if (!(j >= 0)) j = 0;       // jaga nilai rand tak valid (NaN / negatif)
    if (j > i) j = i;           // jaga rand() >= 1
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/** 'match' bila dua kartu berbeda memiliki item sama, selain itu 'mismatch'. */
function evaluateFlip(deck, firstIdx, secondIdx) {
  if (firstIdx === secondIdx) return 'mismatch';
  const a = deck[firstIdx];
  const b = deck[secondIdx];
  if (!a || !b) return 'mismatch';
  return a.item === b.item ? 'match' : 'mismatch';
}

/** Skor = 5 x pasangan, dijepit 0..40. */
function calcScore(pairsFound) {
  const n = Number.isFinite(pairsFound) ? Math.floor(pairsFound) : 0;
  const score = n * POINTS_PER_PAIR;
  return Math.max(0, Math.min(TOTAL_PAIRS * POINTS_PER_PAIR, score));
}

/** 'warning' bila 0 < secondsLeft <= 10, selain itu 'normal'. */
function timerLevel(secondsLeft) {
  return secondsLeft > 0 && secondsLeft <= WARNING_THRESHOLD ? 'warning' : 'normal';
}

/**
 * Kartu boleh dibuka hanya bila phase 'playing', kartu berstatus 'closed',
 * dan kartu terbuka yang belum dievaluasi kurang dari 2.
 */
function canFlip(gameState, idx) {
  if (!gameState || gameState.phase !== 'playing') return false;
  if (!gameState.cardStatus || gameState.cardStatus[idx] !== 'closed') return false;
  const openCount = gameState.openIdx ? gameState.openIdx.length : 0;
  return openCount < 2;
}

/** Sisa detik dari deadline absolut: clamp(ceil((deadline - now) / 1000), 0, 30). */
function remainingSeconds(deadline, now) {
  const secs = Math.ceil((deadline - now) / 1000);
  if (!Number.isFinite(secs)) return 0;
  return Math.max(0, Math.min(GAME_SECONDS, secs));
}

/** True bila hitung mundur melintasi 3 dari atas (prev > 3, 1 <= next <= 3). */
function shouldPlayCountdown(prev, next) {
  return prev > COUNTDOWN_AT && next <= COUNTDOWN_AT && next >= 1;
}

/** Bentuk Game_Session_State: dek -> 16 angka item, 'open' -> 'closed'. */
function serializeState(gameState, phase) {
  const deck = (gameState.deck || []).map((c) => (typeof c === 'object' && c !== null ? c.item : c));
  const cardStatus = (gameState.cardStatus || []).map((s) => (s === 'open' ? 'closed' : s));
  return {
    phase,
    deck,
    cardStatus,
    pairsFound: gameState.pairsFound,
    deadline: gameState.deadline,
    score: calcScore(gameState.pairsFound)
  };
}

/** Tentukan mode boot dari state tersimpan. Murni: tanpa storage/DOM. */
function restoreState(saved, now) {
  if (!saved) return { mode: 'intro' };
  if (saved.phase === 'finished') {
    return {
      mode: 'result',
      score: calcScore(saved.pairsFound),
      pairsFound: saved.pairsFound,
      needsFinalize: false
    };
  }
  if (now >= saved.deadline) {
    return {
      mode: 'result',
      score: calcScore(saved.pairsFound),
      pairsFound: saved.pairsFound,
      needsFinalize: true
    };
  }
  return {
    mode: 'playing',
    deck: saved.deck,
    cardStatus: saved.cardStatus,
    pairsFound: saved.pairsFound,
    deadline: saved.deadline,
    secondsLeft: remainingSeconds(saved.deadline, now),
    score: calcScore(saved.pairsFound)
  };
}

/* ------------------------------------------------------------------ */
/* 3. State game                                                       */
/* ------------------------------------------------------------------ */
const state = {
  phase: 'intro',        // 'intro' | 'playing' | 'locked' | 'finished'
  deck: [],              // hasil shuffle(buildDeck())
  cardStatus: [],        // per indeks: 'closed' | 'open' | 'matched'
  openIdx: [],           // indeks kartu terbuka yang belum dievaluasi (0..2)
  pairsFound: 0,
  deadline: 0,           // timestamp ms absolut
  secondsLeft: GAME_SECONDS,
  countdownPlayed: false,
  timerId: null,
  mismatchTimeoutId: null,
  finished: false        // penjaga satu kali simpan + navigasi
};

/* ------------------------------------------------------------------ */
/* 4. Ekspos                                                           */
/* ------------------------------------------------------------------ */
const MemoryFlipLogic = {
  TOTAL_PAIRS,
  GAME_SECONDS,
  POINTS_PER_PAIR,
  MISMATCH_DELAY_MS,
  TICK_INTERVAL_MS,
  COUNTDOWN_AT,
  WARNING_THRESHOLD,
  NEXT_PAGE,
  buildDeck,
  shuffle,
  evaluateFlip,
  calcScore,
  timerLevel,
  canFlip,
  remainingSeconds,
  shouldPlayCountdown,
  serializeState,
  restoreState,
  state
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryFlipLogic;
}

/* ------------------------------------------------------------------ */
/* 5. Lapisan DOM/timer                                                */
/* ------------------------------------------------------------------ */
const dom = {};

/* Audio: bila konstruktor Audio tidak ada (mis. Node), sounds kosong. */
const sounds = (function createSounds() {
  const result = {};
  if (typeof Audio === 'undefined') return result;
  ['flip', 'match', 'wrong', 'countdown'].forEach((name) => {
    try {
      const audio = new Audio('assets/audio/' + name + '.mp3');
      audio.preload = 'auto';
      result[name] = audio;
    } catch (e) {
      // Gagal membuat satu audio tidak boleh mengganggu permainan.
    }
  });
  return result;
})();

/** Putar dari awal. Tidak pernah melempar. */
function playSound(name) {
  try {
    const audio = sounds[name];
    if (!audio) return;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {
    // Abaikan: autoplay diblokir atau berkas gagal dimuat.
  }
}

/** Hentikan dan kembalikan ke awal. Tidak pernah melempar. */
function stopSound(name) {
  try {
    const audio = sounds[name];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  } catch (e) {
    // Abaikan.
  }
}

/** Simpan Game_Session_State fase 'playing'. Tidak pernah melempar. */
function persistPlaying() {
  try {
    saveGame1State(serializeState(state, 'playing'));
  } catch (e) {
    // Kegagalan penyimpanan tidak boleh mengganggu permainan.
  }
}

function renderTimer() {
  if (!dom.timerText) return;
  const s = state.secondsLeft;
  dom.timerText.textContent = String(s);
  dom.timerText.classList.toggle('flip-timer--warning', timerLevel(s) === 'warning');
  if (dom.timerBar) {
    dom.timerBar.style.width = (s / GAME_SECONDS) * 100 + '%';
    const progress = dom.timerBar.parentElement;
    if (progress) progress.setAttribute('aria-valuenow', String(s));
  }
}

function renderScore() {
  if (dom.scoreText) dom.scoreText.textContent = String(calcScore(state.pairsFound));
}

/** Perbarui tampilan satu kartu sesuai state.cardStatus. */
function renderCard(idx) {
  const btn = dom.cards[idx];
  if (!btn) return;
  const status = state.cardStatus[idx] || 'closed';
  const item = state.deck[idx] ? state.deck[idx].item : null;
  btn.classList.toggle('is-open', status !== 'closed');
  btn.classList.toggle('flip-card--matched', status === 'matched');
  const label = status === 'closed'
    ? 'Kartu ' + (idx + 1) + ', tertutup'
    : 'Kartu ' + (idx + 1) + ', terbuka, gambar item ' + item + (status === 'matched' ? ', cocok' : '');
  btn.setAttribute('aria-label', label);
}

/** Bangun papan 16 kartu sesuai state.deck (atau placeholder tertutup bila dek kosong). */
function renderBoard() {
  dom.board.textContent = '';
  dom.cards = [];
  for (let i = 0; i < TOTAL_PAIRS * 2; i++) {
    const item = state.deck[i] ? state.deck[i].item : 1;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flip-card';
    btn.setAttribute('data-idx', String(i));

    const inner = document.createElement('span');
    inner.className = 'flip-card__inner';

    const back = document.createElement('img');
    back.className = 'flip-card__face flip-card__back';
    back.src = 'assets/back-card.jpg';
    back.alt = 'Kartu tertutup';

    const front = document.createElement('img');
    front.className = 'flip-card__face flip-card__front';
    front.src = 'assets/item-' + item + '.jpg';
    front.alt = 'Gambar item ' + item;

    inner.appendChild(back);
    inner.appendChild(front);
    btn.appendChild(inner);
    btn.addEventListener('click', () => onCardClick(i));
    dom.board.appendChild(btn);
    dom.cards.push(btn);
    renderCard(i);
  }
}

/** Tampilkan Result_Screen (halaman yang sama, tanpa pushState). */
function showResult(score) {
  if (dom.resultScore) dom.resultScore.textContent = String(score);
  if (dom.introScreen) dom.introScreen.hidden = true;
  if (dom.gameScreen) dom.gameScreen.hidden = true;
  if (dom.resultScreen) dom.resultScreen.hidden = false;
}

function init() {
  dom.introScreen = document.getElementById('introScreen');
  dom.gameScreen = document.getElementById('gameScreen');
  dom.resultScreen = document.getElementById('resultScreen');
  dom.startBtn = document.getElementById('startBtn');
  dom.continueBtn = document.getElementById('continueBtn');
  dom.timerText = document.getElementById('timerText');
  dom.scoreText = document.getElementById('scoreText');
  dom.timerBar = document.getElementById('timerBar');
  dom.board = document.getElementById('board');
  dom.resultScore = document.getElementById('resultScore');
  if (!dom.startBtn || !dom.board) return;

  if (dom.continueBtn) {
    dom.continueBtn.addEventListener('click', () => navigateTo(NEXT_PAGE));
  }

  let restored;
  try {
    restored = restoreState(loadGame1State(), Date.now());
  } catch (e) {
    restored = { mode: 'intro' };
  }

  if (restored.mode === 'playing') {
    state.deck = restored.deck.map((item, i) => ({ id: i, item }));
    state.cardStatus = restored.cardStatus.slice();
    state.openIdx = [];
    state.pairsFound = restored.pairsFound;
    state.deadline = restored.deadline;
    state.secondsLeft = restored.secondsLeft;
    state.countdownPlayed = restored.secondsLeft <= COUNTDOWN_AT;
    state.finished = false;
    state.phase = 'playing';
    renderBoard();
    renderScore();
    renderTimer();
    dom.introScreen.hidden = true;
    dom.resultScreen.hidden = true;
    dom.gameScreen.hidden = false;
    startTimer();
    return;
  }

  if (restored.mode === 'result') {
    if (restored.needsFinalize) {
      // Deadline lewat saat halaman tertutup: finalisasi sekali.
      try {
        saveGameScore('memoryFlip', restored.score);
      } catch (e) {
        // Diabaikan.
      }
      try {
        const saved = loadGame1State();
        if (saved) {
          saveGame1State({
            phase: 'finished',
            deck: saved.deck,
            cardStatus: saved.cardStatus,
            pairsFound: saved.pairsFound,
            deadline: saved.deadline,
            score: restored.score
          });
        }
      } catch (e) {
        // Diabaikan.
      }
    }
    state.finished = true;
    state.phase = 'finished';
    showResult(restored.score);
    return;
  }

  // Mode intro.
  state.cardStatus = new Array(TOTAL_PAIRS * 2).fill('closed');
  renderBoard();   // papan tertutup; klik diabaikan karena phase 'intro'
  renderTimer();
  renderScore();
  dom.startBtn.addEventListener('click', startGame);
}

function startGame() {
  if (state.phase !== 'intro') return;
  dom.startBtn.disabled = true;

  state.deck = shuffle(buildDeck());
  state.cardStatus = new Array(TOTAL_PAIRS * 2).fill('closed');
  state.openIdx = [];
  state.pairsFound = 0;
  state.secondsLeft = GAME_SECONDS;
  state.finished = false;
  state.deadline = Date.now() + GAME_SECONDS * 1000;
  state.countdownPlayed = false;

  renderBoard();
  renderScore();
  renderTimer();

  dom.introScreen.hidden = true;
  dom.gameScreen.hidden = false;

  state.phase = 'playing';
  persistPlaying();
  startTimer();
}

function startTimer() {
  if (state.timerId !== null) clearInterval(state.timerId);
  state.timerId = setInterval(tick, TICK_INTERVAL_MS);
  tick(); // sinkronkan tampilan di awal
}

function onCardClick(idx) {
  if (!canFlip(state, idx)) return;

  state.cardStatus[idx] = 'open';
  state.openIdx.push(idx);
  renderCard(idx);
  playSound('flip');
  if (state.openIdx.length < 2) return;

  const first = state.openIdx[0];
  const second = state.openIdx[1];
  if (evaluateFlip(state.deck, first, second) === 'match') {
    state.cardStatus[first] = 'matched';
    state.cardStatus[second] = 'matched';
    state.openIdx = [];
    state.pairsFound++;
    renderCard(first);
    renderCard(second);
    renderScore();
    playSound('match');
    persistPlaying();
    if (state.pairsFound === TOTAL_PAIRS) finishGame('complete');
  } else {
    playSound('wrong');
    state.phase = 'locked';
    state.mismatchTimeoutId = setTimeout(() => {
      state.mismatchTimeoutId = null;
      if (state.finished) return;
      state.cardStatus[first] = 'closed';
      state.cardStatus[second] = 'closed';
      state.openIdx = [];
      renderCard(first);
      renderCard(second);
      state.phase = 'playing';
    }, MISMATCH_DELAY_MS);
  }
}

function tick() {
  if (state.finished) return;
  const next = remainingSeconds(state.deadline, Date.now());
  if (next === state.secondsLeft) return;
  const prev = state.secondsLeft;
  state.secondsLeft = next;
  renderTimer();
  if (!state.countdownPlayed && shouldPlayCountdown(prev, next)) {
    playSound('countdown');
    state.countdownPlayed = true;
  }
  if (next === 0) finishGame('timeout');
}

function finishGame(reason) {
  if (state.finished) return;
  state.finished = true;
  state.phase = 'finished';
  stopSound('countdown');

  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  if (state.mismatchTimeoutId !== null) {
    clearTimeout(state.mismatchTimeoutId);
    state.mismatchTimeoutId = null;
  }

  // Tutup kartu terbuka yang belum cocok.
  state.openIdx.forEach((i) => {
    if (state.cardStatus[i] === 'open') {
      state.cardStatus[i] = 'closed';
      renderCard(i);
    }
  });
  state.openIdx = [];

  const score = calcScore(state.pairsFound);
  try {
    saveGameScore('memoryFlip', score);
  } catch (e) {
    // Kegagalan penyimpanan tidak boleh menghalangi Result_Screen.
  }
  try {
    saveGame1State(serializeState(state, 'finished'));
  } catch (e) {
    // Hasil diabaikan.
  }

  showResult(score);
}

// Jalankan hanya di browser; aman dimuat di Node tanpa DOM.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
