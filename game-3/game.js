/*
 * Memory Shuffle & Recall (game-3)
 *
 * Struktur berkas:
 *   1. Konstanta dan CARD_IMAGES
 *   2. Fungsi murni (tanpa DOM, tanpa localStorage; aman dimuat di Node)
 *   3. State runtime
 *   4. Ekspos (MemoryShuffleLogic + module.exports)
 *   5. Lapisan DOM/timer/audio (ditambahkan pada tugas berikutnya)
 */

/* ------------------------------------------------------------------ */
/* 1. Konstanta dan daftar gambar                                      */
/* ------------------------------------------------------------------ */
const MEMORIZE_SECONDS = 5;
const ANSWER_SECONDS = 5;
const PRE_COUNTDOWN_SECONDS = 3;
const TICK_INTERVAL_MS = 250;
const WARNING_THRESHOLD = 2;
const POINTS_PER_SLOT = 10;
const SLOT_COUNT = 3;
const FLY_MS = 400;
const FINISH_DELAY_MS = 450;
const FINISH_DELAY_REDUCED_MS = 250;
const CATEGORIES = ['zaitun', 'product', 'organ'];
const NEXT_PAGE = '../result.html';

// Satu-satunya daftar gambar. Menambah gambar = menambah satu entri.
const CARD_IMAGES = [
  { id: 'zaitun-1', category: 'zaitun', src: 'assets/zaitun/zaitun-1.jpg', alt: 'Gambar zaitun 1' },
  { id: 'zaitun-2', category: 'zaitun', src: 'assets/zaitun/zaitun-2.jpg', alt: 'Gambar zaitun 2' },
  { id: 'zaitun-3', category: 'zaitun', src: 'assets/zaitun/zaitun-3.jpg', alt: 'Gambar zaitun 3' },
  { id: 'product-1', category: 'product', src: 'assets/product/product-1.jpg', alt: 'Gambar produk 1' },
  { id: 'product-2', category: 'product', src: 'assets/product/product-2.jpg', alt: 'Gambar produk 2' },
  { id: 'product-3', category: 'product', src: 'assets/product/product-3.jpg', alt: 'Gambar produk 3' },
  { id: 'product-4', category: 'product', src: 'assets/product/product-4.jpg', alt: 'Gambar produk 4' },
  { id: 'product-5', category: 'product', src: 'assets/product/product-5.jpg', alt: 'Gambar produk 5' },
  { id: 'product-6', category: 'product', src: 'assets/product/product-6.jpg', alt: 'Gambar produk 6' },
  { id: 'product-7', category: 'product', src: 'assets/product/product-7.jpg', alt: 'Gambar produk 7' },
  { id: 'product-8', category: 'product', src: 'assets/product/product-8.jpg', alt: 'Gambar produk 8' },
  { id: 'product-9', category: 'product', src: 'assets/product/product-9.jpg', alt: 'Gambar produk 9' },
  { id: 'product-10', category: 'product', src: 'assets/product/product-10.jpg', alt: 'Gambar produk 10' },
  { id: 'organ-1', category: 'organ', src: 'assets/organ/organ-1.jpg', alt: 'Gambar organ 1' },
  { id: 'organ-2', category: 'organ', src: 'assets/organ/organ-2.jpg', alt: 'Gambar organ 2' },
  { id: 'organ-3', category: 'organ', src: 'assets/organ/organ-3.jpg', alt: 'Gambar organ 3' }
];

/* ------------------------------------------------------------------ */
/* 2. Fungsi murni                                                     */
/* ------------------------------------------------------------------ */

// Indeks acak 0..n-1, aman terhadap nilai rand di luar [0, 1).
function randomIndex(n, rand) {
  let r = typeof rand === 'function' ? Number(rand()) : Math.random();
  if (!Number.isFinite(r)) r = 0;
  const i = Math.floor(r * n);
  return Math.min(Math.max(i, 0), n - 1);
}

// Fisher-Yates; mengembalikan salinan baru.
function shuffle(arr, rand = Math.random) {
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, rand);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

const NON_IDENTITY_PERMUTATIONS = [
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0]
];

// Satu gambar acak per kategori; null bila ada kategori kosong.
function buildRound(images, rand = Math.random) {
  if (!Array.isArray(images)) return null;
  const chosen = [];
  for (const category of CATEGORIES) {
    const pool = images.filter((img) => img && img.category === category);
    if (pool.length === 0) return null;
    chosen.push(pool[randomIndex(pool.length, rand)].id);
  }
  const originalOrder = shuffle(chosen, rand);
  const perm = NON_IDENTITY_PERMUTATIONS[randomIndex(NON_IDENTITY_PERMUTATIONS.length, rand)];
  const optionOrder = perm.map((i) => originalOrder[i]);
  return { originalOrder, optionOrder };
}

// Elemen ke-i true bila picks[i] === originalOrder[i].
function gradeSlots(originalOrder, picks) {
  const result = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const p = Array.isArray(picks) ? picks[i] : undefined;
    result.push(p !== undefined && p !== null && Array.isArray(originalOrder) && p === originalOrder[i]);
  }
  return result;
}

function calcScore(originalOrder, picks) {
  return gradeSlots(originalOrder, picks).filter(Boolean).length * POINTS_PER_SLOT;
}

// Menambah id di akhir picks bila valid; tidak mengubah argumen.
function addPick(picks, optionOrder, id) {
  const current = Array.isArray(picks) ? picks.slice() : [];
  if (
    current.length < SLOT_COUNT &&
    Array.isArray(optionOrder) &&
    optionOrder.indexOf(id) !== -1 &&
    current.indexOf(id) === -1
  ) {
    current.push(id);
  }
  return current;
}

function canPick(gameState) {
  return !!gameState &&
    gameState.phase === 'answer' &&
    gameState.finished === false &&
    gameState.locked === false &&
    Array.isArray(gameState.picks) &&
    gameState.picks.length < SLOT_COUNT;
}

function buildResultSlots(originalOrder, picks) {
  const graded = gradeSlots(originalOrder, picks);
  const slots = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const pick = Array.isArray(picks) && picks[i] !== undefined ? picks[i] : null;
    let status;
    let icon;
    if (pick === null) {
      status = 'empty';
      icon = { src: 'assets/wrong.png', alt: 'Posisi tidak terisi' };
    } else if (graded[i]) {
      status = 'correct';
      icon = { src: 'assets/checked.png', alt: 'Posisi benar' };
    } else {
      status = 'wrong';
      icon = { src: 'assets/wrong.png', alt: 'Posisi salah' };
    }
    slots.push({ slot: i + 1, imageId: pick, status, icon });
  }
  return slots;
}

// 3, 2, 1 lalu 0 (selesai). Negatif / non-finite -> 3.
function countdownNumber(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 1000) return 3;
  if (elapsedMs < 2000) return 2;
  if (elapsedMs < 3000) return 1;
  return 0;
}

function remainingSeconds(endTime, now, maxSeconds = MEMORIZE_SECONDS) {
  const diff = (endTime - now) / 1000;
  if (!Number.isFinite(diff)) return 0;
  return Math.min(Math.max(Math.ceil(diff), 0), maxSeconds);
}

function phaseTimerLevel(secondsLeft) {
  return secondsLeft > 0 && secondsLeft <= WARNING_THRESHOLD ? 'warning' : 'normal';
}

function serializeState(gameState, phase) {
  const round = gameState.round || {};
  const originalOrder = (round.originalOrder || []).slice();
  const picks = (gameState.picks || []).slice();
  const out = {
    phase,
    originalOrder,
    optionOrder: (round.optionOrder || []).slice(),
    memorizeEnd: gameState.memorizeEnd,
    answerEnd: gameState.answerEnd,
    picks
  };
  if (phase === 'finished') out.score = calcScore(originalOrder, picks);
  return out;
}

function restoreState(saved, now) {
  if (!saved) return { mode: 'intro' };
  const originalOrder = saved.originalOrder.slice();
  const picks = (saved.picks || []).slice();
  if (saved.phase === 'finished') {
    return { mode: 'result', originalOrder, picks, score: calcScore(originalOrder, picks), needsFinalize: false };
  }
  if (now >= saved.answerEnd || picks.length === SLOT_COUNT) {
    return { mode: 'result', originalOrder, picks, score: calcScore(originalOrder, picks), needsFinalize: true };
  }
  const base = {
    mode: 'playing',
    originalOrder,
    optionOrder: saved.optionOrder.slice(),
    memorizeEnd: saved.memorizeEnd,
    answerEnd: saved.answerEnd
  };
  if (now < saved.memorizeEnd) {
    return Object.assign(base, {
      stage: 'memorize',
      picks: [],
      secondsLeft: remainingSeconds(saved.memorizeEnd, now, MEMORIZE_SECONDS)
    });
  }
  return Object.assign(base, {
    stage: 'answer',
    picks,
    secondsLeft: remainingSeconds(saved.answerEnd, now, ANSWER_SECONDS)
  });
}

/* ------------------------------------------------------------------ */
/* 3. State runtime                                                    */
/* ------------------------------------------------------------------ */
const state = {
  phase: 'intro',        // 'intro' | 'countdown' | 'memorize' | 'answer' | 'finished'
  round: null,           // { originalOrder, optionOrder }
  picks: [],             // id kartu menurut urutan klik; picks[i] mengisi Slot i+1
  memorizeEnd: 0,        // timestamp ms absolut
  answerEnd: 0,
  secondsLeft: MEMORIZE_SECONDS,
  timerId: null,
  countdownId: null,
  pendingTimeouts: [],
  locked: false,         // true setelah klik ketiga
  finished: false        // penjaga satu kali simpan skor
};

/* ------------------------------------------------------------------ */
/* 4. Ekspos                                                           */
/* ------------------------------------------------------------------ */
const MemoryShuffleLogic = {
  MEMORIZE_SECONDS,
  ANSWER_SECONDS,
  PRE_COUNTDOWN_SECONDS,
  TICK_INTERVAL_MS,
  WARNING_THRESHOLD,
  POINTS_PER_SLOT,
  SLOT_COUNT,
  FLY_MS,
  FINISH_DELAY_MS,
  FINISH_DELAY_REDUCED_MS,
  CATEGORIES,
  NEXT_PAGE,
  CARD_IMAGES,
  shuffle,
  buildRound,
  gradeSlots,
  calcScore,
  addPick,
  canPick,
  buildResultSlots,
  countdownNumber,
  remainingSeconds,
  phaseTimerLevel,
  serializeState,
  restoreState,
  state
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryShuffleLogic;
}

/* ------------------------------------------------------------------ */
/* 5. Lapisan DOM / timer / audio (hanya dijalankan di browser)        */
/* ------------------------------------------------------------------ */

/* ---- 5a. Audio: countdown.mp3 dan flip.mp3, tidak pernah melempar ---- */
const sounds = { countdown: null, flip: null };
try {
  if (typeof Audio !== 'undefined') {
    sounds.countdown = new Audio('assets/audio/countdown.mp3');
    sounds.flip = new Audio('assets/audio/flip.mp3');
  }
} catch (e) {
  sounds.countdown = null;
  sounds.flip = null;
}

function playSound(name) {
  try {
    const snd = sounds[name];
    if (!snd) return;
    snd.currentTime = 0;
    const p = snd.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) {
    // Audio gagal tidak boleh mengganggu permainan.
  }
}

function stopSound(name) {
  try {
    const snd = sounds[name];
    if (!snd) return;
    snd.pause();
    snd.currentTime = 0;
  } catch (e) {
    // Diabaikan.
  }
}

/* ---- 5b. Referensi DOM ---- */
const dom = {};

function cacheDom() {
  [
    'introScreen', 'countdownScreen', 'gameScreen', 'resultScreen',
    'startBtn', 'continueBtn', 'countdownNumber', 'phaseBadge',
    'timerBox', 'timerText', 'timerBar', 'prompt', 'slots', 'cards',
    'resultSlots', 'resultScore'
  ].forEach((id) => { dom[id] = document.getElementById(id); });
}

function findImage(id) {
  return CARD_IMAGES.find((img) => img.id === id) || null;
}

function maxSecondsForPhase() {
  return state.phase === 'answer' ? ANSWER_SECONDS : MEMORIZE_SECONDS;
}

/* ---- 5c. Render ---- */
function createImg(info) {
  const img = document.createElement('img');
  img.className = 'shuffle-img';
  img.src = info.src;
  img.alt = info.alt;
  return img;
}

function setBadge(kind) {
  const isMemorize = kind === 'memorize';
  dom.phaseBadge.textContent = isMemorize ? 'Hafalkan!' : 'Jawab sekarang!';
  dom.phaseBadge.className = 'shuffle-badge ' +
    (isMemorize ? 'shuffle-badge--memorize' : 'shuffle-badge--answer');
}

function renderEmptyStage() {
  dom.slots.hidden = true;
  dom.slots.innerHTML = '';
  dom.cards.innerHTML = '';
  for (let i = 0; i < SLOT_COUNT; i++) {
    const frame = document.createElement('div');
    frame.className = 'shuffle-frame shuffle-frame--empty';
    dom.cards.appendChild(frame);
  }
}

function renderMemorize() {
  setBadge('memorize');
  dom.prompt.textContent = 'Perhatikan gambar berikut dan urutannya';
  dom.slots.hidden = true;
  dom.slots.innerHTML = '';
  dom.cards.innerHTML = '';
  state.round.originalOrder.forEach((id, i) => {
    const info = findImage(id);
    const memo = document.createElement('div');
    memo.className = 'shuffle-memo';
    const frame = document.createElement('div');
    frame.className = 'shuffle-frame';
    if (info) frame.appendChild(createImg(info));
    const num = document.createElement('span');
    num.className = 'shuffle-memo__num';
    num.textContent = String(i + 1);
    memo.appendChild(frame);
    memo.appendChild(num);
    dom.cards.appendChild(memo);
  });
}

// Isi Slot (indeks 0..2) dengan gambar tanpa animasi.
function fillSlot(slotIndex, id) {
  const slot = dom.slots.children[slotIndex];
  const info = findImage(id);
  if (!slot || !info) return;
  if (slot.querySelector('.shuffle-img')) return;
  slot.appendChild(createImg(info));
  slot.classList.add('shuffle-slot--filled');
}

function renderAnswer(restoredPicks) {
  setBadge('answer');
  dom.prompt.textContent = 'Pilih gambar dengan urutan yang tepat';
  dom.slots.innerHTML = '';
  dom.cards.innerHTML = '';

  for (let i = 0; i < SLOT_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'shuffle-slot';
    slot.dataset.slot = String(i + 1);
    const num = document.createElement('span');
    num.className = 'shuffle-slot__num';
    num.textContent = String(i + 1);
    slot.appendChild(num);
    dom.slots.appendChild(slot);
  }
  dom.slots.hidden = false;

  state.round.optionOrder.forEach((id) => {
    const info = findImage(id);
    if (!info) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shuffle-option';
    btn.dataset.id = id;
    btn.setAttribute('aria-label', 'Pilih gambar: ' + info.alt);
    btn.appendChild(createImg(info));
    btn.addEventListener('click', () => onOptionClick(id, btn));
    dom.cards.appendChild(btn);
  });

  // Restore: Slot terisi langsung tanpa animasi.
  (restoredPicks || []).forEach((id, i) => {
    fillSlot(i, id);
    const btn = dom.cards.querySelector('.shuffle-option[data-id="' + id + '"]');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('shuffle-option--used');
    }
  });
}

function renderTimer(instant) {
  const secs = state.secondsLeft;
  const max = maxSecondsForPhase();
  dom.timerText.textContent = String(secs);
  (dom.timerBox || dom.timerText).className = 'shuffle-timer' +
    (phaseTimerLevel(secs) === 'warning' ? ' shuffle-timer--warning' : '');
  if (instant) dom.timerBar.style.transition = 'none';
  dom.timerBar.style.width = Math.max(0, Math.min(100, (secs / max) * 100)) + '%';
  if (instant) {
    void dom.timerBar.offsetWidth; // paksa reflow agar lebar langsung penuh tanpa animasi
    dom.timerBar.style.transition = '';
  }
  const bar = dom.timerBar.parentElement;
  if (bar) bar.setAttribute('aria-valuenow', String(secs));
}

/* ---- 5d. Tampilan ---- */
function showOnly(name) {
  dom.introScreen.hidden = name !== 'intro';
  dom.gameScreen.hidden = name !== 'game';
  dom.resultScreen.hidden = name !== 'result';
  dom.countdownScreen.hidden = true;
}

function showResult(originalOrder, picks, score) {
  dom.resultSlots.innerHTML = '';
  buildResultSlots(originalOrder, picks).forEach((rs) => {
    const wrap = document.createElement('div');
    wrap.className = 'shuffle-result-slot';

    const frame = document.createElement('div');
    frame.className = 'shuffle-frame';
    const info = rs.imageId ? findImage(rs.imageId) : null;
    if (info) {
      frame.appendChild(createImg(info));
    } else {
      frame.classList.add('shuffle-frame--empty');
      frame.textContent = String(rs.slot);
    }
    wrap.appendChild(frame);

    const icon = document.createElement('img');
    icon.className = 'shuffle-result-slot__icon';
    icon.src = rs.icon.src;
    icon.alt = rs.icon.alt;
    wrap.appendChild(icon);

    dom.resultSlots.appendChild(wrap);
  });
  dom.resultScore.textContent = String(score);
  showOnly('result');
}

/* ---- 5e. Fase ---- */
function enterMemorize() {
  state.phase = 'memorize';
  state.secondsLeft = remainingSeconds(state.memorizeEnd, Date.now(), MEMORIZE_SECONDS);
  renderMemorize();
  renderTimer(true);
}

function enterAnswer(restoredPicks) {
  state.phase = 'answer';
  state.picks = Array.isArray(restoredPicks) ? restoredPicks.slice() : [];
  state.secondsLeft = remainingSeconds(state.answerEnd, Date.now(), ANSWER_SECONDS);
  renderAnswer(state.picks);
  renderTimer(true);
}

/* ---- 5f. Placeholder: diimplementasikan pada tugas 4.2 / 4.3 ---- */
function beginCountdown() {
  if (state.phase !== 'intro') return;
  state.phase = 'countdown';
  dom.startBtn.disabled = true;
  showOnly('game');
  renderEmptyStage();
  dom.countdownScreen.hidden = false;
  let shown = countdownNumber(0);
  dom.countdownNumber.textContent = String(shown);
  playSound('countdown');
  const t0 = Date.now();
  state.countdownId = setInterval(() => {
    const n = countdownNumber(Date.now() - t0);
    if (n === shown) return;
    shown = n;
    if (n > 0) {
      dom.countdownNumber.textContent = String(n);
      return;
    }
    clearInterval(state.countdownId);
    state.countdownId = null;
    dom.countdownScreen.hidden = true;
    startGame();
  }, TICK_INTERVAL_MS);
}

function startGame() {
  if (state.phase !== 'countdown') return;
  state.round = buildRound(CARD_IMAGES, Math.random);
  if (!state.round) return;
  state.picks = [];
  state.locked = false;
  state.finished = false;
  state.memorizeEnd = Date.now() + MEMORIZE_SECONDS * 1000;
  state.answerEnd = state.memorizeEnd + ANSWER_SECONDS * 1000;
  saveGame3State(serializeState(state, 'playing'));
  enterMemorize();
  startTimer();
}

function cancelCountdown() {
  if (state.countdownId !== null) {
    clearInterval(state.countdownId);
    state.countdownId = null;
  }
  stopSound('countdown');
}
function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  state.timerId = setInterval(tick, TICK_INTERVAL_MS);
}

function tick() {
  if (state.finished) {
    stopTimer();
    return;
  }
  const now = Date.now();
  if (state.phase === 'memorize') {
    if (now >= state.memorizeEnd) {
      enterAnswer([]);
      return;
    }
    const secs = remainingSeconds(state.memorizeEnd, now, MEMORIZE_SECONDS);
    if (secs !== state.secondsLeft) {
      state.secondsLeft = secs;
      renderTimer();
    }
  } else if (state.phase === 'answer') {
    if (now >= state.answerEnd) {
      stopTimer();
      finishGame();
      return;
    }
    const secs = remainingSeconds(state.answerEnd, now, ANSWER_SECONDS);
    if (secs !== state.secondsLeft) {
      state.secondsLeft = secs;
      renderTimer();
    }
  }
}

function prefersReducedMotion() {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}

function schedule(fn, ms) {
  const id = setTimeout(() => {
    const i = state.pendingTimeouts.indexOf(id);
    if (i !== -1) state.pendingTimeouts.splice(i, 1);
    fn();
  }, ms);
  state.pendingTimeouts.push(id);
  return id;
}

function clearPendingTimeouts() {
  state.pendingTimeouts.forEach((id) => clearTimeout(id));
  state.pendingTimeouts = [];
}

// Kartu terbang ke Slot; setelah mendarat Slot terisi dan kartu asal disembunyikan.
function flyToSlot(button, slotIndex) {
  const id = button.dataset.id;
  const land = () => {
    fillSlot(slotIndex, id);
    button.classList.remove('shuffle-option--flying');
    button.style.transform = '';
    button.classList.add('shuffle-option--used');
  };

  const slot = dom.slots.children[slotIndex];
  let from = null;
  let to = null;
  try {
    from = button.getBoundingClientRect();
    to = slot ? slot.getBoundingClientRect() : null;
  } catch (e) {
    from = null;
  }
  const valid = from && to && from.width > 0 && from.height > 0 && to.width > 0 && to.height > 0;

  if (prefersReducedMotion() || !valid) {
    land();
    return;
  }

  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const scale = to.width / from.width;
  button.classList.add('shuffle-option--flying');
  // Paksa reflow agar transisi berjalan dari posisi awal.
  void button.offsetWidth;
  button.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale + ')';
  schedule(land, FLY_MS);
}

function onOptionClick(id, btn) {
  if (!canPick(state)) return;
  const next = addPick(state.picks, state.round.optionOrder, id);
  if (next.length === state.picks.length) return;
  state.picks = next;
  const slotIndex = next.length - 1;
  if (btn) btn.disabled = true;
  playSound('flip');
  saveGame3State(serializeState(state, 'playing'));
  if (btn) flyToSlot(btn, slotIndex);
  if (next.length === SLOT_COUNT) {
    state.locked = true;
    schedule(finishGame, prefersReducedMotion() ? FINISH_DELAY_REDUCED_MS : FINISH_DELAY_MS);
  }
}

function finishGame() {
  if (state.finished) return;
  state.finished = true;
  state.phase = 'finished';
  state.locked = true;
  stopTimer();
  clearPendingTimeouts();
  stopSound('countdown');

  const originalOrder = state.round.originalOrder;
  const score = calcScore(originalOrder, state.picks);
  try {
    saveGameScore('memorize', score);
  } catch (e) {
    // Kegagalan simpan tidak menghalangi Result_Screen.
  }
  try {
    saveGame3State(serializeState(state, 'finished'));
  } catch (e) {
    // Diabaikan.
  }
  showResult(originalOrder, state.picks, score);
}

/* ---- 5g. Init ---- */
function bindIntro() {
  if (buildRound(CARD_IMAGES, Math.random) === null) {
    dom.startBtn.disabled = true;
  } else {
    dom.startBtn.addEventListener('click', beginCountdown);
  }
  window.addEventListener('pagehide', cancelCountdown);
}

// Id valid: ada di CARD_IMAGES dan mewakili tiga kategori berbeda.
function restoredIdsValid(originalOrder, optionOrder) {
  const all = originalOrder.concat(optionOrder);
  if (all.some((id) => !findImage(id))) return false;
  const cats = originalOrder.map((id) => findImage(id).category);
  return CATEGORIES.every((c) => cats.indexOf(c) !== -1);
}

function init() {
  cacheDom();
  dom.continueBtn.addEventListener('click', () => replaceTo(NEXT_PAGE));

  const restored = restoreState(loadGame3State(), Date.now());

  if (restored.mode === 'playing') {
    if (!restoredIdsValid(restored.originalOrder, restored.optionOrder)) {
      clearGame3State();
      showOnly('intro');
      bindIntro();
      return;
    }
    state.round = {
      originalOrder: restored.originalOrder.slice(),
      optionOrder: restored.optionOrder.slice()
    };
    state.memorizeEnd = restored.memorizeEnd;
    state.answerEnd = restored.answerEnd;
    showOnly('game');
    if (restored.stage === 'memorize') {
      enterMemorize();
    } else {
      enterAnswer(restored.picks);
    }
    startTimer();
    return;
  }

  if (restored.mode === 'result') {
    state.finished = true;
    state.phase = 'finished';
    state.picks = restored.picks.slice();
    state.round = { originalOrder: restored.originalOrder.slice(), optionOrder: [] };
    if (restored.needsFinalize) {
      const saved = loadGame3State();
      try {
        saveGameScore('memorize', restored.score);
      } catch (e) {
        // Kegagalan simpan tidak menghalangi Result_Screen.
      }
      try {
        saveGame3State(serializeState({
          round: {
            originalOrder: restored.originalOrder,
            optionOrder: saved ? saved.optionOrder : []
          },
          picks: restored.picks,
          memorizeEnd: saved ? saved.memorizeEnd : 0,
          answerEnd: saved ? saved.answerEnd : 0
        }, 'finished'));
      } catch (e) {
        // Diabaikan.
      }
    }
    showResult(restored.originalOrder, restored.picks, restored.score);
    return;
  }

  showOnly('intro');
  bindIntro();
}

// Jalankan hanya di browser; aman dimuat di Node tanpa DOM.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
