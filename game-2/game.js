/*
 * Memory Recall (game-2) - logika gameplay.
 *
 * Struktur berkas:
 *   1. Konstanta + CARD_IMAGES
 *   2. Fungsi murni (tanpa DOM, tanpa localStorage; aman dimuat di Node)
 *   3. State game
 *   4. Ekspos (MemoryRecallLogic + module.exports)
 *   5. Lapisan DOM/timer/audio (ditambahkan pada tugas berikutnya)
 */

/* ------------------------------------------------------------------ */
/* 1. Konstanta                                                        */
/* ------------------------------------------------------------------ */
const MEMORIZE_SECONDS = 5;
const ANSWER_SECONDS = 5;
const PRE_COUNTDOWN_SECONDS = 3;
const TICK_INTERVAL_MS = 250;
const WARNING_THRESHOLD = 2;
const MAX_SCORE = 30;
const NEXT_PAGE = '../game-3/index.html';

// Satu-satunya daftar gambar. Menambah gambar = menambah satu entri.
const CARD_IMAGES = [
  { id: '1-a', group: '1', src: 'assets/1-a.jpg', alt: 'Kemasan Entrasol Active rasa Choco Delight' },
  { id: '1-b', group: '1', src: 'assets/1-b.jpg', alt: 'Kemasan Entrasol Active rasa Vanilla Latte' },
  { id: '2-a', group: '2', src: 'assets/2-a.jpg', alt: 'Kemasan Entrasol Gold rasa Chocolate' },
  { id: '2-b', group: '2', src: 'assets/2-b.jpg', alt: 'Kemasan Entrasol Gold rasa Vanilla' }
];

/* ------------------------------------------------------------------ */
/* 2. Fungsi murni                                                     */
/* ------------------------------------------------------------------ */

/** Indeks acak 0..n-1 dari sumber acak; aman terhadap nilai rand tak valid. */
function randomIndex(n, rand) {
  let j = Math.floor(rand() * n);
  if (!(j >= 0)) j = 0;
  if (j > n - 1) j = n - 1;
  return j;
}

/** Fisher-Yates. Mengembalikan salinan baru; array asli tidak diubah. */
function shuffle(arr, rand = Math.random) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, rand);
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * Bentuk Round: target (punya saudara sejenis dan ada gambar group lain),
 * satu saudara, satu gambar group lain; posisi diacak.
 * Mengembalikan { targetId, optionIds } atau null bila tidak ada kandidat.
 * Tidak mengubah images.
 */
function buildRound(images, rand = Math.random) {
  if (!Array.isArray(images) || images.length < 3) return null;
  const candidates = images.filter((img) =>
    images.some((o) => o !== img && o.group === img.group) &&
    images.some((o) => o.group !== img.group)
  );
  if (candidates.length === 0) return null;

  const target = candidates[randomIndex(candidates.length, rand)];
  const siblings = images.filter((o) => o !== target && o.group === target.group);
  const others = images.filter((o) => o.group !== target.group);
  const sibling = siblings[randomIndex(siblings.length, rand)];
  const other = others[randomIndex(others.length, rand)];

  return {
    targetId: target.id,
    optionIds: shuffle([target.id, sibling.id, other.id], rand)
  };
}

/** 'correct' bila id sama, selain itu 'wrong'. */
function gradeAnswer(targetId, chosenId) {
  return targetId === chosenId ? 'correct' : 'wrong';
}

/** 30 untuk 'correct', selain itu 0. */
function calcScore(status) {
  return status === 'correct' ? MAX_SCORE : 0;
}

/** Ikon hasil untuk Result_Status. */
function resultIconFor(status) {
  if (status === 'correct') return { src: 'assets/checked.png', alt: 'Jawaban benar' };
  if (status === 'wrong') return { src: 'assets/wrong.png', alt: 'Jawaban salah' };
  return { src: 'assets/times-up.png', alt: 'Waktu habis' };
}

/**
 * Angka hitung mundur pra-game: <1000 -> 3, <2000 -> 2, <3000 -> 1,
 * >=3000 -> 0 (selesai). Negatif atau non-finite -> 3.
 */
function countdownNumber(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return PRE_COUNTDOWN_SECONDS;
  if (elapsedMs < 1000) return 3;
  if (elapsedMs < 2000) return 2;
  if (elapsedMs < 3000) return 1;
  return 0;
}

/** clamp(ceil((endTime - now) / 1000), 0, maxSeconds). */
function remainingSeconds(endTime, now, maxSeconds = 5) {
  const secs = Math.ceil((endTime - now) / 1000);
  if (!Number.isFinite(secs)) return 0;
  return Math.max(0, Math.min(maxSeconds, secs));
}

/** 'warning' bila 0 < secondsLeft <= 2, selain itu 'normal'. */
function phaseTimerLevel(secondsLeft) {
  return secondsLeft > 0 && secondsLeft <= WARNING_THRESHOLD ? 'warning' : 'normal';
}

/** Klik boleh diproses hanya pada phase 'answer' dan belum finished. */
function canChoose(gameState) {
  return !!gameState && gameState.phase === 'answer' && gameState.finished === false;
}

/**
 * Bentuk Game_Session_State. phase: 'playing' | 'finished'.
 * Fase 'finished' menambah result dan score = calcScore(result).
 */
function serializeState(gameState, phase) {
  const round = gameState.round || {};
  const saved = {
    phase,
    targetId: round.targetId,
    optionIds: Array.isArray(round.optionIds) ? round.optionIds.slice() : [],
    memorizeEnd: gameState.memorizeEnd,
    answerEnd: gameState.answerEnd
  };
  if (phase === 'finished') {
    const result = gameState.result || 'timeout';
    saved.result = result;
    saved.score = calcScore(result);
    saved.chosenId = result === 'timeout' ? null : (gameState.chosenId || null);
  }
  return saved;
}

/** Tentukan mode boot dari state tersimpan. Murni: tanpa storage/DOM. */
function restoreState(saved, now) {
  if (!saved) return { mode: 'intro' };
  if (saved.phase === 'finished') {
    return {
      mode: 'result',
      result: saved.result,
      score: calcScore(saved.result),
      needsFinalize: false
    };
  }
  if (now >= saved.answerEnd) {
    return { mode: 'result', result: 'timeout', score: 0, needsFinalize: true };
  }
  const inMemorize = now < saved.memorizeEnd;
  return {
    mode: 'playing',
    stage: inMemorize ? 'memorize' : 'answer',
    targetId: saved.targetId,
    optionIds: saved.optionIds,
    memorizeEnd: saved.memorizeEnd,
    answerEnd: saved.answerEnd,
    secondsLeft: inMemorize
      ? remainingSeconds(saved.memorizeEnd, now, MEMORIZE_SECONDS)
      : remainingSeconds(saved.answerEnd, now, ANSWER_SECONDS)
  };
}

/* ------------------------------------------------------------------ */
/* 3. State game                                                       */
/* ------------------------------------------------------------------ */
const state = {
  phase: 'intro',        // 'intro' | 'countdown' | 'memorize' | 'answer' | 'finished'
  round: null,           // { targetId, optionIds }
  result: null,          // 'correct' | 'wrong' | 'timeout' setelah selesai
  chosenId: null,        // id gambar pilihan pemain (null bila waktu habis)
  memorizeEnd: 0,        // timestamp ms absolut
  answerEnd: 0,
  secondsLeft: MEMORIZE_SECONDS,
  timerId: null,
  countdownId: null,
  finished: false        // penjaga satu kali simpan skor
};

/* ------------------------------------------------------------------ */
/* 4. Ekspos                                                           */
/* ------------------------------------------------------------------ */
const MemoryRecallLogic = {
  MEMORIZE_SECONDS,
  ANSWER_SECONDS,
  PRE_COUNTDOWN_SECONDS,
  TICK_INTERVAL_MS,
  WARNING_THRESHOLD,
  MAX_SCORE,
  NEXT_PAGE,
  CARD_IMAGES,
  shuffle,
  buildRound,
  gradeAnswer,
  calcScore,
  resultIconFor,
  countdownNumber,
  remainingSeconds,
  phaseTimerLevel,
  canChoose,
  serializeState,
  restoreState,
  state
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryRecallLogic;
}

/* ------------------------------------------------------------------ */
/* 5. Lapisan DOM / timer / audio (hanya dijalankan di browser)        */
/* ------------------------------------------------------------------ */

/* ---- 5a. Audio: hanya countdown.mp3, tidak pernah melempar ---- */
const sounds = { countdown: null, match: null, wrong: null };
try {
  if (typeof Audio !== 'undefined') {
    ['countdown', 'match', 'wrong'].forEach((name) => {
      sounds[name] = new Audio('assets/audio/' + name + '.mp3');
    });
  }
} catch (e) {
  // Audio tidak tersedia: semua efek suara diabaikan.
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
    'timerText', 'timerBar', 'prompt', 'stage', 'resultIcon', 'resultChoice', 'resultScore'
  ].forEach((id) => { dom[id] = document.getElementById(id); });
}

function findImage(id) {
  return CARD_IMAGES.find((img) => img.id === id) || null;
}

function maxSecondsForPhase() {
  return state.phase === 'answer' ? ANSWER_SECONDS : MEMORIZE_SECONDS;
}

/* ---- 5c. Render ---- */
function renderEmptyStage() {
  dom.stage.innerHTML = '';
  const frame = document.createElement('div');
  frame.className = 'recall-frame recall-frame--empty';
  dom.stage.appendChild(frame);
}

function setBadge(kind) {
  const isMemorize = kind === 'memorize';
  dom.phaseBadge.textContent = isMemorize ? 'Hafalkan!' : 'Jawab sekarang!';
  dom.phaseBadge.className = 'recall-badge ' +
    (isMemorize ? 'recall-badge--memorize' : 'recall-badge--answer');
}

function createImg(info) {
  const img = document.createElement('img');
  img.className = 'recall-img';
  img.src = info.src;
  img.alt = info.alt;
  return img;
}

function renderMemorize() {
  setBadge('memorize');
  dom.prompt.textContent = 'Perhatikan gambar berikut';
  dom.stage.innerHTML = '';
  const info = findImage(state.round.targetId);
  const frame = document.createElement('div');
  frame.className = 'recall-frame';
  if (info) frame.appendChild(createImg(info));
  dom.stage.appendChild(frame);
}

function renderAnswer() {
  setBadge('answer');
  dom.prompt.textContent = 'Pilih gambar yang tepat';
  dom.stage.innerHTML = '';

  const pyramid = document.createElement('div');
  pyramid.className = 'recall-pyramid';
  // Tata letak vertikal: tiga pilihan ditumpuk dari atas ke bawah.
  const rows = state.round.optionIds.map((id) => [id]);
  rows.forEach((ids) => {
    const row = document.createElement('div');
    row.className = 'recall-row';
    ids.forEach((id) => {
      const info = findImage(id);
      if (!info) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'recall-option';
      btn.dataset.id = id;
      btn.setAttribute('aria-label', 'Pilih gambar: ' + info.alt);
      btn.appendChild(createImg(info));
      btn.addEventListener('click', () => onOptionClick(id));
      row.appendChild(btn);
    });
    pyramid.appendChild(row);
  });
  dom.stage.appendChild(pyramid);
}

/** instant=true: bar langsung ke lebar baru tanpa animasi (dipakai saat fase baru dimulai). */
function renderTimer(instant) {
  const secs = state.secondsLeft;
  const max = maxSecondsForPhase();
  dom.timerText.textContent = String(secs);
  dom.timerText.className = 'recall-timer' +
    (phaseTimerLevel(secs) === 'warning' ? ' recall-timer--warning' : '');
  if (instant) dom.timerBar.style.transition = 'none';
  dom.timerBar.style.width = Math.max(0, Math.min(100, (secs / max) * 100)) + '%';
  if (instant) {
    void dom.timerBar.offsetWidth; // paksa reflow agar lebar diterapkan tanpa transisi
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

function renderResultChoice(chosenId) {
  const box = dom.resultChoice;
  if (!box) return;
  box.innerHTML = '';
  const info = chosenId ? findImage(chosenId) : null;
  if (info) {
    box.className = 'recall-result__choice';
    box.setAttribute('aria-label', 'Gambar pilihan Anda: ' + info.alt);
    box.appendChild(createImg(info));
  } else {
    box.className = 'recall-result__choice recall-result__choice--empty';
    box.setAttribute('aria-label', 'Tidak ada gambar yang dipilih');
  }
}

function showResult(status, score, chosenId) {
  const icon = resultIconFor(status);
  dom.resultIcon.src = icon.src;
  dom.resultIcon.alt = icon.alt;
  renderResultChoice(chosenId);
  dom.resultScore.textContent = String(score);
  dom.introScreen.hidden = true;
  dom.gameScreen.hidden = true;
  dom.countdownScreen.hidden = true;
  dom.resultScreen.hidden = false;
}

/* ---- 5e. Fase ---- */
function enterMemorize() {
  state.phase = 'memorize';
  state.secondsLeft = remainingSeconds(state.memorizeEnd, Date.now(), MEMORIZE_SECONDS);
  renderMemorize();
  renderTimer(true);
}

function enterAnswer() {
  state.phase = 'answer';
  state.secondsLeft = remainingSeconds(state.answerEnd, Date.now(), ANSWER_SECONDS);
  renderAnswer();
  renderTimer(true);
}

/* ---- 5f. Stub: diisi pada tugas 4.2 / 4.3 ---- */
function beginCountdown() {
  if (state.phase !== 'intro') return;
  dom.startBtn.disabled = true;
  state.phase = 'countdown';

  // Game_Screen di belakang overlay: bingkai kosong, badge/prompt/timer netral.
  setBadge('memorize');
  dom.prompt.textContent = 'Perhatikan gambar berikut';
  state.secondsLeft = MEMORIZE_SECONDS;
  renderEmptyStage();
  renderTimer(true);
  dom.introScreen.hidden = true;
  dom.resultScreen.hidden = true;
  dom.gameScreen.hidden = false;

  let shown = countdownNumber(0);
  dom.countdownNumber.textContent = String(shown);
  dom.countdownScreen.hidden = false;
  playSound('countdown');

  const t0 = Date.now();
  state.countdownId = setInterval(() => {
    const n = countdownNumber(Date.now() - t0);
    if (n === 0) {
      clearInterval(state.countdownId);
      state.countdownId = null;
      dom.countdownScreen.hidden = true;
      startGame();
      return;
    }
    if (n !== shown) {
      shown = n;
      dom.countdownNumber.textContent = String(n);
    }
  }, TICK_INTERVAL_MS);
}

function cancelCountdown() {
  if (state.countdownId !== null) {
    clearInterval(state.countdownId);
    state.countdownId = null;
  }
  stopSound('countdown');
}

function startGame() {
  if (state.phase !== 'countdown') return;
  state.round = buildRound(CARD_IMAGES, Math.random);
  state.memorizeEnd = Date.now() + MEMORIZE_SECONDS * 1000;
  state.answerEnd = state.memorizeEnd + ANSWER_SECONDS * 1000;
  try {
    saveGame2State(serializeState(state, 'playing'));
  } catch (e) {
    // Kegagalan simpan tidak menghalangi permainan.
  }
  enterMemorize();
  startTimer();
}

function startTimer() {
  if (state.timerId !== null) clearInterval(state.timerId);
  state.timerId = setInterval(tick, TICK_INTERVAL_MS);
}

function tick() {
  if (state.finished) {
    clearInterval(state.timerId);
    state.timerId = null;
    return;
  }
  const now = Date.now();
  if (now >= state.answerEnd) {
    finishGame('timeout');
    return;
  }
  if (state.phase === 'memorize' && now >= state.memorizeEnd) {
    enterAnswer();
    return;
  }
  const end = state.phase === 'answer' ? state.answerEnd : state.memorizeEnd;
  const secs = remainingSeconds(end, now, maxSecondsForPhase());
  if (secs !== state.secondsLeft) {
    state.secondsLeft = secs;
    renderTimer();
  }
}

function onOptionClick(id) {
  if (!canChoose(state)) return;
  finishGame(gradeAnswer(state.round.targetId, id), id);
}

function finishGame(status, chosenId) {
  if (state.finished) return;
  state.finished = true;
  state.phase = 'finished';
  state.result = status;
  state.chosenId = chosenId || null;
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  const score = calcScore(status);
  try {
    saveGameScore('memoryRecall', score);
  } catch (e) {
    // Kegagalan simpan tidak menghalangi Result_Screen.
  }
  try {
    saveGame2State(serializeState(state, 'finished'));
  } catch (e) {
    // Diabaikan.
  }
  showResult(status, score, state.chosenId);
  // Efek suara hasil: benar -> match; salah atau waktu habis -> wrong.
  playSound(status === 'correct' ? 'match' : 'wrong');
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

function init() {
  cacheDom();
  dom.continueBtn.addEventListener('click', () => navigateTo(NEXT_PAGE));

  const restored = restoreState(loadGame2State(), Date.now());

  if (restored.mode === 'playing') {
    const ids = [restored.targetId].concat(restored.optionIds);
    if (ids.some((id) => !findImage(id))) {
      clearGame2State();
      showOnly('intro');
      bindIntro();
      return;
    }
    state.round = { targetId: restored.targetId, optionIds: restored.optionIds.slice() };
    state.memorizeEnd = restored.memorizeEnd;
    state.answerEnd = restored.answerEnd;
    showOnly('game');
    if (restored.stage === 'memorize') enterMemorize(); else enterAnswer();
    startTimer();
    return;
  }

  if (restored.mode === 'result') {
    state.finished = true;
    state.phase = 'finished';
    state.result = restored.result;
    const savedFinal = loadGame2State();
    if (restored.result === 'correct' && savedFinal) {
      state.chosenId = savedFinal.targetId;
    } else if (restored.result === 'wrong' && savedFinal && savedFinal.optionIds.indexOf(savedFinal.chosenId) !== -1) {
      state.chosenId = savedFinal.chosenId;
    } else {
      state.chosenId = null;
    }
    if (restored.needsFinalize) {
      const saved = loadGame2State();
      try {
        saveGameScore('memoryRecall', 0);
      } catch (e) {
        // Kegagalan simpan tidak menghalangi Result_Screen.
      }
      try {
        saveGame2State(serializeState({
          round: saved ? { targetId: saved.targetId, optionIds: saved.optionIds } : null,
          memorizeEnd: saved ? saved.memorizeEnd : 0,
          answerEnd: saved ? saved.answerEnd : 0,
          result: 'timeout'
        }, 'finished'));
      } catch (e) {
        // Diabaikan.
      }
    }
    showResult(restored.result, restored.score, state.chosenId);
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
